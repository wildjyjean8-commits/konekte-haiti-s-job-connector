import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Bookmark, Send, Eye, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { APPLICATION_STATUSES, labelOf } from "@/lib/haiti";
import { timeAgo } from "@/lib/konekte";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — KONEKTE" },
      { name: "description", content: "Suivez vos candidatures, vos offres sauvegardées et votre activité sur KONEKTE." },
      { property: "og:title", content: "Tableau de bord — KONEKTE" },
      { property: "og:description", content: "Votre activité KONEKTE en un coup d'œil." },
    ],
  }),
  component: Dashboard,
});

function Stat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number }) {
  return (
    <Card className="p-4">
      <Icon className="h-5 w-5 text-accent" />
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

function Dashboard() {
  const { user, role, institution } = useAuth();
  const { t, lang } = useI18n();

  const seeker = useQuery({
    queryKey: ["dash-seeker", user?.id],
    enabled: !!user && role !== "institution",
    queryFn: async () => {
      const [apps, saved] = await Promise.all([
        supabase
          .from("applications")
          .select("id,status,created_at,jobs(id,title),institutions(name)")
          .eq("applicant_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase.from("saved_jobs").select("id,created_at,jobs(id,title,department)").eq("user_id", user!.id),
      ]);
      return { apps: apps.data ?? [], saved: saved.data ?? [] };
    },
  });

  const inst = useQuery({
    queryKey: ["dash-inst", institution?.id],
    enabled: role === "institution" && !!institution?.id,
    queryFn: async () => {
      const [jobs, apps] = await Promise.all([
        supabase
          .from("jobs")
          .select("id,title,status,views_count,created_at,department")
          .eq("institution_id", institution!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("applications")
          .select("id,status,created_at,jobs(id,title),profiles:applicant_id(full_name)")
          .eq("institution_id", institution!.id)
          .order("created_at", { ascending: false }),
      ]);
      return { jobs: jobs.data ?? [], apps: apps.data ?? [] };
    },
  });

  if (role === "institution") {
    const jobs = inst.data?.jobs ?? [];
    const apps = inst.data?.apps ?? [];
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold">{t("nav.dashboard")}</h1>
          <Button asChild>
            <Link to="/post-job">{t("nav.postjob")}</Link>
          </Button>
        </div>

        {!institution && (
          <Card className="mt-4 p-4 text-sm">
            <p>Créez d'abord la fiche de votre institution.</p>
            <Button asChild className="mt-3" size="sm">
              <Link to="/institution">{t("nav.institution")}</Link>
            </Button>
          </Card>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat icon={Briefcase} label={t("dash.myjobs")} value={jobs.length} />
          <Stat icon={Send} label={t("dash.applications")} value={apps.length} />
          <Stat icon={Eye} label={t("job.views")} value={jobs.reduce((s, j) => s + (j.views_count ?? 0), 0)} />
          <Stat icon={Users} label={t("nav.candidates")} value={new Set(apps.map((a) => a.id)).size} />
        </div>

        <h2 className="mt-8 font-display text-lg font-bold">{t("dash.myjobs")}</h2>
        <div className="mt-3 space-y-2">
          {jobs.map((j) => (
            <Card key={j.id} className="flex flex-row items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Link to="/jobs/$jobId" params={{ jobId: j.id }} className="truncate font-semibold hover:text-primary">
                  {j.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {j.department} · {timeAgo(j.created_at, lang)}
                </p>
              </div>
              <Badge variant={j.status === "open" ? "default" : "secondary"}>{j.status}</Badge>
            </Card>
          ))}
          {jobs.length === 0 && <p className="text-sm text-muted-foreground">{t("dash.empty")}</p>}
        </div>

        <h2 className="mt-8 font-display text-lg font-bold">{t("dash.applications")}</h2>
        <div className="mt-3 space-y-2">
          {apps.map((a) => (
            <Card key={a.id} className="flex flex-row items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {(a.profiles as unknown as { full_name: string } | null)?.full_name ?? "Candidat"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {(a.jobs as unknown as { title: string } | null)?.title} · {timeAgo(a.created_at, lang)}
                </p>
              </div>
              <Badge variant="secondary">{labelOf(APPLICATION_STATUSES, a.status, lang)}</Badge>
            </Card>
          ))}
          {apps.length === 0 && <p className="text-sm text-muted-foreground">{t("dash.empty")}</p>}
        </div>
      </div>
    );
  }

  const apps = seeker.data?.apps ?? [];
  const saved = seeker.data?.saved ?? [];
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">{t("nav.dashboard")}</h1>
        <Button asChild variant="outline">
          <Link to="/profile">{t("nav.profile")}</Link>
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat icon={Send} label={t("dash.myapplications")} value={apps.length} />
        <Stat icon={Bookmark} label={t("dash.savedjobs")} value={saved.length} />
        <Stat
          icon={Briefcase}
          label={t("app.tagline")}
          value={apps.filter((a) => a.status === "shortlisted" || a.status === "interview").length}
        />
      </div>

      <h2 className="mt-8 font-display text-lg font-bold">{t("dash.myapplications")}</h2>
      <div className="mt-3 space-y-2">
        {apps.map((a) => (
          <Card key={a.id} className="flex flex-row items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{(a.jobs as unknown as { title: string } | null)?.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {(a.institutions as unknown as { name: string } | null)?.name} · {timeAgo(a.created_at, lang)}
              </p>
            </div>
            <Badge variant="secondary">{labelOf(APPLICATION_STATUSES, a.status, lang)}</Badge>
          </Card>
        ))}
        {apps.length === 0 && <p className="text-sm text-muted-foreground">{t("dash.empty")}</p>}
      </div>

      <h2 className="mt-8 font-display text-lg font-bold">{t("dash.savedjobs")}</h2>
      <div className="mt-3 space-y-2">
        {saved.map((s) => {
          const j = s.jobs as unknown as { id: string; title: string; department: string } | null;
          return (
            j && (
              <Card key={s.id} className="p-4">
                <Link to="/jobs/$jobId" params={{ jobId: j.id }} className="font-semibold hover:text-primary">
                  {j.title}
                </Link>
                <p className="text-xs text-muted-foreground">{j.department}</p>
              </Card>
            )
          );
        })}
        {saved.length === 0 && <p className="text-sm text-muted-foreground">{t("dash.empty")}</p>}
      </div>
    </div>
  );
}
