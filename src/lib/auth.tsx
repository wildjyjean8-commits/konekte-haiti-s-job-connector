import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "job_seeker" | "institution" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  department: string | null;
  commune: string | null;
  preferred_language: string;
};

export type Institution = {
  id: string;
  owner_id: string;
  name: string;
  logo_url: string | null;
  sector: string;
  description: string | null;
  department: string | null;
  commune: string | null;
  website: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp: string | null;
  contact_public: boolean;
};

type Ctx = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  institution: Institution | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Ctx>({
  session: null,
  user: null,
  profile: null,
  role: null,
  institution: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      setRole(null);
      setInstitution(null);
      return;
    }
    const [{ data: p }, { data: r }, { data: inst }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId).limit(1).maybeSingle(),
      supabase.from("institutions").select("*").eq("owner_id", userId).maybeSingle(),
    ]);
    setProfile((p as Profile) ?? null);
    setRole(((r?.role as AppRole) ?? null) as AppRole | null);
    setInstitution((inst as Institution) ?? null);
  };

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!active) return;
      setSession(s);
      setTimeout(() => {
        void loadUserData(s?.user?.id);
      }, 0);
    });

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadUserData(data.session?.user?.id);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role,
      institution,
      loading,
      refresh: async () => {
        await loadUserData(session?.user?.id);
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setRole(null);
        setInstitution(null);
      },
    }),
    [session, profile, role, institution, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
