
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('job_seeker','institution','admin');
CREATE TYPE public.contract_type AS ENUM ('full_time','part_time','internship','temporary','freelance','volunteer');
CREATE TYPE public.experience_level AS ENUM ('none','junior','mid','senior');
CREATE TYPE public.application_status AS ENUM ('received','reviewing','interview','accepted','rejected');
CREATE TYPE public.job_status AS ENUM ('open','closed');

-- UPDATED AT
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  department TEXT,
  commune TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'fr',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_read_all" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "roles_insert_own" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND role <> 'admin');

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- HANDLE NEW USER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.phone)
  ON CONFLICT (id) DO NOTHING;
  r := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'job_seeker');
  IF r = 'admin' THEN r := 'job_seeker'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, r) ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- JOB SEEKER PROFILES
CREATE TABLE public.job_seeker_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  headline TEXT,
  bio TEXT,
  sector TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{}',
  experiences JSONB NOT NULL DEFAULT '[]'::jsonb,
  educations JSONB NOT NULL DEFAULT '[]'::jsonb,
  availability TEXT,
  cv_path TEXT,
  cv_filename TEXT,
  cv_updated_at TIMESTAMPTZ,
  is_searchable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_seeker_profiles TO authenticated;
GRANT ALL ON public.job_seeker_profiles TO service_role;
ALTER TABLE public.job_seeker_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seeker_read" ON public.job_seeker_profiles FOR SELECT TO authenticated USING (is_searchable OR auth.uid() = user_id);
CREATE POLICY "seeker_write_own" ON public.job_seeker_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_seeker_updated BEFORE UPDATE ON public.job_seeker_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INSTITUTIONS
CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  sector TEXT NOT NULL,
  description TEXT,
  department TEXT,
  commune TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  whatsapp TEXT,
  contact_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_institutions_owner ON public.institutions(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.institutions TO authenticated;
GRANT SELECT ON public.institutions TO anon;
GRANT ALL ON public.institutions TO service_role;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inst_read_all" ON public.institutions FOR SELECT USING (true);
CREATE POLICY "inst_write_own" ON public.institutions FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER trg_inst_updated BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.owns_institution(_user_id UUID, _institution_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.institutions WHERE id = _institution_id AND owner_id = _user_id);
$$;

-- JOBS
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sector TEXT NOT NULL,
  department TEXT NOT NULL,
  commune TEXT,
  contract_type public.contract_type NOT NULL DEFAULT 'full_time',
  experience_level public.experience_level NOT NULL DEFAULT 'none',
  salary_range TEXT,
  deadline DATE,
  status public.job_status NOT NULL DEFAULT 'open',
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_jobs_filters ON public.jobs(sector, department, commune, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT SELECT ON public.jobs TO anon;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs_read_open" ON public.jobs FOR SELECT USING (status = 'open' OR public.owns_institution(auth.uid(), institution_id));
CREATE POLICY "jobs_write_own" ON public.jobs FOR ALL TO authenticated USING (public.owns_institution(auth.uid(), institution_id)) WITH CHECK (public.owns_institution(auth.uid(), institution_id));
CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.increment_job_view(_job_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.jobs SET views_count = views_count + 1 WHERE id = _job_id;
$$;
GRANT EXECUTE ON FUNCTION public.increment_job_view(UUID) TO anon, authenticated;

-- APPLICATIONS
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  cover_message TEXT,
  cv_path TEXT,
  cv_filename TEXT,
  status public.application_status NOT NULL DEFAULT 'received',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, applicant_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_read" ON public.applications FOR SELECT TO authenticated USING (auth.uid() = applicant_id OR public.owns_institution(auth.uid(), institution_id));
CREATE POLICY "app_insert_own" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "app_update" ON public.applications FOR UPDATE TO authenticated USING (auth.uid() = applicant_id OR public.owns_institution(auth.uid(), institution_id)) WITH CHECK (auth.uid() = applicant_id OR public.owns_institution(auth.uid(), institution_id));
CREATE POLICY "app_delete_own" ON public.applications FOR DELETE TO authenticated USING (auth.uid() = applicant_id);
CREATE TRIGGER trg_app_updated BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SAVED JOBS
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_jobs TO authenticated;
GRANT ALL ON public.saved_jobs TO service_role;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_own" ON public.saved_jobs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CONVERSATIONS
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (institution_id, seeker_id)
);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_read" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() = seeker_id OR public.owns_institution(auth.uid(), institution_id));
CREATE POLICY "conv_insert" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = seeker_id OR public.owns_institution(auth.uid(), institution_id));
CREATE POLICY "conv_update" ON public.conversations FOR UPDATE TO authenticated USING (auth.uid() = seeker_id OR public.owns_institution(auth.uid(), institution_id)) WITH CHECK (auth.uid() = seeker_id OR public.owns_institution(auth.uid(), institution_id));

CREATE OR REPLACE FUNCTION public.in_conversation(_user_id UUID, _conversation_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations c
    LEFT JOIN public.institutions i ON i.id = c.institution_id
    WHERE c.id = _conversation_id AND (c.seeker_id = _user_id OR i.owner_id = _user_id)
  );
$$;

-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_conv ON public.messages(conversation_id, created_at);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_read" ON public.messages FOR SELECT TO authenticated USING (public.in_conversation(auth.uid(), conversation_id));
CREATE POLICY "msg_insert" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND public.in_conversation(auth.uid(), conversation_id));
CREATE POLICY "msg_update" ON public.messages FOR UPDATE TO authenticated USING (public.in_conversation(auth.uid(), conversation_id)) WITH CHECK (public.in_conversation(auth.uid(), conversation_id));

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_read_own" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif_delete_own" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif_insert_any" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- JOB ALERTS
CREATE TABLE public.job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sector TEXT,
  department TEXT,
  commune TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_alerts TO authenticated;
GRANT ALL ON public.job_alerts TO service_role;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_own" ON public.job_alerts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RECOMMENDATIONS
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  relationship TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (subject_user_id IS NOT NULL OR subject_institution_id IS NOT NULL)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommendations TO authenticated;
GRANT SELECT ON public.recommendations TO anon;
GRANT ALL ON public.recommendations TO service_role;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reco_read_all" ON public.recommendations FOR SELECT USING (true);
CREATE POLICY "reco_write_own" ON public.recommendations FOR ALL TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id AND auth.uid() <> COALESCE(subject_user_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
