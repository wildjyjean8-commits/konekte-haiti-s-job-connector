import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { JobCard, type JobRow } from "@/components/JobCard";
import { LocationSelects, OptionSelect } from "@/components/Selects";
import { SECTORS, CONTRACT_TYPES, EXPERIENCE_LEVELS } from "@/lib/haiti";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

type JobSearch = {
  q?: string;
  sector?: string;
  department?: string;
  commune?: string;
  contract?: string;
  experience?: string;
};

export const Route = createFileRoute("/jobs/")({
  validateSearch: (search: Record<string, unknown>): JobSearch => ({
    q: (search.q as string) || undefined,
    sector: (search.sector as string) || undefined,
    department: (search.department as string) || undefined,
    commune: (search.commune as string) || undefined,
    contract: (search.contract as string) || undefined,
    experience: (search.experience as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Offres d'emploi en Haïti — TRAVAY" },
      {
        name: "description",
        content: "Recherchez des offres d'emploi par secteur, département et commune partout en Haïti sur TRAVAY.",
      },
      { property: "og:title", content: "Offres d'emploi en Haïti — TRAVAY" },
      { property: "og:description", content: "Filtres par secteur, département, commune, type de contrat et expérience." },
    ],
  }),
  component: JobsPage,
});

function JobsPage() {
  const { t } = useI18n();
  const initial = Route.useSearch();
  const [q, setQ] = useState(initial.q ?? "");
  const [sector, setSector] = useState<string | null>(initial.sector ?? null);
  const [department, setDepartment] = useState<string | null>(initial.department ?? null);
  const [commune, setCommune] = useState<string | null>(initial.commune ?? null);
  const [contract, setContract] = useState<string | null>(initial.contract ?? null);
  const [experience, setExperience] = useState<string | null>(initial.experience ?? null);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", q, sector, department, commune, contract, experience],
    queryFn: async () => {
      let query = supabase
        .from("jobs")
        .select("id,title,sector,department,commune,contract_type,salary_range,created_at,views_count,institutions(id,name,logo_url)")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(60);
      if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      if (sector) query = query.eq("sector", sector);
      if (department) query = query.eq("department", department);
      if (commune) query = query.eq("commune", commune);
      if (contract) query = query.eq("contract_type", contract as never);
      if (experience) query = query.eq("experience_level", experience as never);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as JobRow[];
    },
  });

  const reset = () => {
    setQ("");
    setSector(null);
    setDepartment(null);
    setCommune(null);
    setContract(null);
    setExperience(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold">{t("nav.jobs")}</h1>

      <Card className="mt-4 gap-3 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search.keyword")} className="pl-9" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <OptionSelect
            options={SECTORS}
            value={sector}
            onChange={setSector}
            placeholder={t("filter.sector")}
            includeAll
            allLabel={`${t("filter.all")} — ${t("filter.sector")}`}
          />
          <LocationSelects
            department={department}
            commune={commune}
            onDepartment={setDepartment}
            onCommune={setCommune}
            includeAll
          />
          <OptionSelect
            options={CONTRACT_TYPES}
            value={contract}
            onChange={setContract}
            placeholder={t("filter.contract")}
            includeAll
            allLabel={`${t("filter.all")} — ${t("filter.contract")}`}
          />
          <OptionSelect
            options={EXPERIENCE_LEVELS}
            value={experience}
            onChange={setExperience}
            placeholder={t("filter.experience")}
            includeAll
            allLabel={`${t("filter.all")} — ${t("filter.experience")}`}
          />
        </div>
        <Button variant="ghost" onClick={reset} className="self-start">
          {t("filter.reset")}
        </Button>
      </Card>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {isLoading && <p className="text-sm text-muted-foreground">{t("common.loading")}</p>}
        {jobs?.map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
      </div>
      {jobs && jobs.length === 0 && <p className="mt-6 text-sm text-muted-foreground">{t("job.none")}</p>}
    </div>
  );
}
