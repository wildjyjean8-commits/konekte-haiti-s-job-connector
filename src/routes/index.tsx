import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, ArrowRight, ShieldCheck, MessagesSquare, FileText, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { JobCard, type JobRow } from "@/components/JobCard";
import { LocationSelects } from "@/components/Selects";
import { SECTORS } from "@/lib/haiti";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RecruteHT — Trouvez un emploi en Haïti" },
      {
        name: "description",
        content:
          "RecruteHT relie institutions et chercheurs d'emploi dans les 10 départements d'Haïti : offres, candidature en un clic, messagerie directe.",
      },
      { property: "og:title", content: "RecruteHT — Trouvez un emploi en Haïti" },
      {
        property: "og:description",
        content: "Offres d'emploi par département et commune, candidature en un clic, messagerie directe.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState<string | null>(null);
  const [commune, setCommune] = useState<string | null>(null);

  const { data: jobs } = useQuery({
    queryKey: ["latest-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id,title,sector,department,commune,contract_type,salary_range,created_at,views_count,institutions(id,name,logo_url)")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data ?? []) as unknown as JobRow[];
    },
  });

  const search = () => {
    void navigate({
      to: "/jobs",
      search: {
        q: q || undefined,
        department: department || undefined,
        commune: commune || undefined,
      },
    });
  };

  return (
    <div>
      <section className="bg-hero px-4 py-12 text-primary-foreground md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex rounded-full bg-gold-gradient px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold-foreground">
            Ayiti · 10 depatman
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-5xl">{t("home.hero.title")}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-primary-foreground/85 md:text-base">{t("home.hero.sub")}</p>

          <Card className="mx-auto mt-8 max-w-3xl gap-3 p-4 text-left">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder={t("search.keyword")}
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LocationSelects
                department={department}
                commune={commune}
                onDepartment={setDepartment}
                onCommune={setCommune}
              />
            </div>
            <Button onClick={search} className="w-full">
              {t("search.button")}
            </Button>
          </Card>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="secondary">
              <Link to="/jobs">{t("home.cta.seeker")}</Link>
            </Button>
            <Button asChild variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/auth" search={{ mode: "signup", role: "institution" }}>
                {t("home.cta.institution")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display text-2xl font-bold">{t("home.sectors")}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {SECTORS.slice(0, 14).map((s) => (
            <Link
              key={s.value}
              to="/jobs"
              search={{ sector: s.value }}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-soft transition-colors hover:border-primary hover:text-primary"
            >
              {s[lang]}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">{t("home.latest")}</h2>
          <Link to="/jobs" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            {t("nav.jobs")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(jobs ?? []).map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
          {jobs && jobs.length === 0 && <p className="text-sm text-muted-foreground">{t("job.none")}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <Card className="flex flex-col items-start gap-4 border-gold/40 bg-gold-gradient/10 p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-gradient text-gold-foreground">
              <Heart className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold">{t("donate.title")}</h3>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t("donate.body")}</p>
            </div>
          </div>
          <div className="shrink-0 rounded-xl border border-border bg-card px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("donate.moncash")}</p>
            <p className="mt-1 font-display text-xl font-extrabold tracking-tight text-foreground">3904-9733</p>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display text-2xl font-bold">{t("home.how")}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { icon: FileText, fr: "Créez votre profil et téléversez votre CV (PDF ou Word).", ht: "Kreye pwofil ou epi voye CV ou (PDF oswa Word)." },
            { icon: ShieldCheck, fr: "Postulez en un clic : votre CV part automatiquement.", ht: "Poze kandidati ou : CV ou pati otomatikman." },
            { icon: MessagesSquare, fr: "Discutez directement avec l'institution, sans blocage.", ht: "Pale dirèkteman ak enstitisyon an, san blokaj." },
          ].map((s, i) => (
            <Card key={i} className="p-5 shadow-soft">
              <s.icon className="h-6 w-6 text-accent" />
              <p className="mt-3 text-sm font-medium">{lang === "fr" ? s.fr : s.ht}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}