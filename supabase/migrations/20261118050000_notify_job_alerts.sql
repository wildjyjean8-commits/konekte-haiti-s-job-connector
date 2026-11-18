-- Envoie une notification aux candidats dont une alerte active correspond à la nouvelle offre.
-- SECURITY DEFINER : la RLS de job_alerts n'autorise chaque utilisateur qu'à lire ses propres alertes,
-- donc l'envoi ne peut pas se faire depuis le navigateur de l'institution.
CREATE OR REPLACE FUNCTION public.notify_job_alerts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status::text <> 'open' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, link)
  SELECT a.user_id,
         'job_alert',
         'Nouvelle offre correspondant à votre alerte',
         NEW.title,
         '/jobs/' || NEW.id::text
  FROM public.job_alerts a
  WHERE a.is_active = true
    AND (a.sector IS NULL OR a.sector = NEW.sector)
    AND (a.department IS NULL OR a.department = NEW.department)
  LIMIT 500;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_jobs_notify_alerts ON public.jobs;
CREATE TRIGGER trg_jobs_notify_alerts
AFTER INSERT ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.notify_job_alerts();
