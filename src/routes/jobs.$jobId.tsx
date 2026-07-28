import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Briefcase, Clock, Building2, Bookmark, Send, MessageSquare, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { CONTRACT_TYPES, EXPERIENCE_LEVELS, SECTORS, labelOf } from "@/lib/haiti";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateConversation, notify, timeAgo } from "@/lib/konekte";

export const Route = createFileRoute("/jobs/$jobId")({
  head: () => ({
    meta: [
      { title: "Offre d'emploi — RecruteHT" },
      { name: "description", content: "Détails de l'offre d'emploi : missions, lieu, contrat et candidature en un clic." },
      { property: "og:title", content: "Offre d'emploi — RecruteHT" },
      { property: "og:description", content: "Postulez en un clic et échangez directement avec l'institution." },
    ],
  }),
  component: JobDetail,
});

function JobDetail() {
  const { jobId } = Route.useParams();
  const { t, lang } = useI18n();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [cover, setCover] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, institutions(id,name,logo_url,description,department,commune,sector,website,contact_public,contact_email,contact_phone,whatsapp,owner_id)")
        .eq("id", jobId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: mine } = useQuery({
    queryKey: ["job-state", jobId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [app, saved] = await Promise.all([
        supabase.from("applications").select("id,status").eq("job_id", jobId).eq("applicant_id", user!.id).maybeSingle(),
        supabase.from("saved_jobs").select("id").eq("job_id", jobId).eq("user_id", user!.id).maybeSingle(),
      ]);
      return { application: app.data, saved: saved.data };
    },
  });

  if (isLoading) return <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">{t("common.loading")}</p>;
  if (!job) return <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">{t("job.none")}</p>;

  const inst = job.institutions as unknown as {
    id: string;
    name: string;
    owner_id: string;
    description: string | null;
    website: string | null;
    contact_public: boolean;
    contact_email: string | null;
    contact_phone: string | null;
    whatsapp: string | null;
  } | null;

  const requireAuth = () => {
    if (!user) {
      void navigate({ to: "/auth", search: { mode: "signin" } });
      return false;
    }
    return true;
  };

  const apply = async () => {
    if (!requireAuth() || !inst) return;
    setBusy(true);
    try {
      const { data: seeker } = await supabase
        .from("job_seeker_profiles")
        .select("cv_path,cv_filename")
        .eq("user_id", user!.id)
        .maybeSingle();
      const { error } = await supabase.from("applications").insert({
        job_id: job.id,
        applicant_id: user!.id,
        institution_id: inst.id,
        cover_message: cover || null,
        cv_path: seeker?.cv_path ?? null,
        cv_filename: seeker?.cv_filename ?? null,
      });
      if (error) throw error;
      await notify({
        userId: inst.owner_id,
        type: "application",
        title: "Nouvelle candidature",
        body: `Une candidature a été reçue pour « ${job.title} ».`,
        link: "/institution/applications",
      });
      toast.success(t("job.applied"));
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["job-state", jobId] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const toggleSave = async () => {
    if (!requireAuth()) return;
    if (mine?.saved) {
      await supabase.from("saved_jobs").delete().eq("id", mine.saved.id);
    } else {
      await supabase.from("saved_jobs").insert({ job_id: job.id, user_id: user!.id });
    }
    void qc.invalidateQueries({ queryKey: ["job-state", jobId] });
  };

  const contact = async () => {
    if (!requireAuth() || !inst) return;
    try {
      const conv = await getOrCreateConversation(inst.id, user!.id, job.id);
      void navigate({ to: "/messages", search: { c: conv } });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-4 px-4 py-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
              <Building2 className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold leading-tight">{job.title}</h1>
              <p className="text-sm text-muted-foreground">{inst?.name}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{labelOf(SECTORS, job.sector, lang)}</Badge>
            <Badge variant="outline">{labelOf(CONTRACT_TYPES, job.contract_type, lang)}</Badge>
            <Badge variant="outline">{labelOf(EXPERIENCE_LEVELS, job.experience_level, lang)}</Badge>
            {job.salary_range && <Badge variant="outline">{job.salary_range}</Badge>}
          </div>

          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {job.commune ? `${job.commune}, ` : ""}
              {job.department}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t("job.published")} · {timeAgo(job.created_at, lang)}
            </span>
            {job.deadline && (
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                {t("job.deadline")} : {new Date(job.deadline).toLocaleDateString(lang === "fr" ? "fr-FR" : "fr-HT")}
              </span>
            )}
          </div>

          <h2 className="mt-6 font-display text-lg font-bold">{t("job.description")}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          {role === "institution" ? (
            <p className="text-sm text-muted-foreground">
              <Briefcase className="mr-1 inline h-4 w-4" />
              {t("nav.candidates")}
            </p>
          ) : mine?.application ? (
            <Button className="w-full" disabled>
              {t("job.applied")}
            </Button>
          ) : (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" onClick={(e) => !user && (e.preventDefault(), requireAuth())}>
                  <Send className="h-4 w-4" /> {t("job.apply")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{job.title}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">{t("job.cvattached")}</p>
                <Textarea
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                  placeholder={t("job.coverletter")}
                  rows={5}
                />
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button disabled={busy} onClick={apply}>
                    {t("job.apply")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Button variant="outline" className="mt-2 w-full" onClick={toggleSave}>
            <Bookmark className="h-4 w-4" /> {mine?.saved ? t("job.saved") : t("job.save")}
          </Button>
          <Button variant="secondary" className="mt-2 w-full" onClick={contact}>
            <MessageSquare className="h-4 w-4" /> {t("job.contact")}
          </Button>
        </Card>

        {inst && (
          <Card className="p-5">
            <h3 className="font-display font-bold">{inst.name}</h3>
            {inst.description && <p className="mt-2 text-sm text-muted-foreground">{inst.description}</p>}
            {inst.contact_public && (
              <div className="mt-3 space-y-1 text-sm">
                {inst.contact_email && <p>{inst.contact_email}</p>}
                {inst.contact_phone && <p>{inst.contact_phone}</p>}
                {inst.whatsapp && <p>WhatsApp : {inst.whatsapp}</p>}
              </div>
            )}
            {inst.website && (
              <a href={inst.website} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-primary">
                {inst.website}
              </a>
            )}
          </Card>
        )}

        <Link to="/jobs" className="block text-center text-sm text-muted-foreground hover:text-foreground">
          ← {t("nav.jobs")}
        </Link>
      </div>
    </div>
  );
}
