import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MessageSquare, Search, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LocationSelects, OptionSelect } from "@/components/Selects";
import { SECTORS, labelOf } from "@/lib/haiti";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateConversation, initials } from "@/lib/konekte";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/candidates")({
  head: () => ({
    meta: [
      { title: "Candidats — RecruteHT" },
      { name: "description", content: "Recherchez des candidats par secteur, compétence, département et commune en Haïti." },
      { property: "og:title", content: "Candidats — RecruteHT" },
      { property: "og:description", content: "Trouvez le bon profil près de chez vous." },
    ],
  }),
  component: Candidates,
});

function Candidates() {
  const { t, lang } = useI18n();
  const { user, institution } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [sector, setSector] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [commune, setCommune] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["candidates", q, sector, department, commune],
    queryFn: async () => {
      let query = supabase
        .from("job_seeker_profiles")
        .select("user_id,headline,bio,sector,skills,profiles:user_id(full_name,department,commune)")
        .eq("is_searchable", true)
        .limit(50);
      if (sector) query = query.eq("sector", sector);
      if (q) query = query.or(`headline.ilike.%${q}%,bio.ilike.%${q}%`);
      const { data, error } = await query;
      if (error) throw error;
      const rows = data ?? [];
      return rows.filter((r) => {
        const p = r.profiles as unknown as { department: string | null; commune: string | null } | null;
        if (department && p?.department !== department) return false;
        if (commune && p?.commune !== commune) return false;
        return true;
      });
    },
  });

  const contact = async (seekerId: string) => {
    if (!institution) return toast.error("Créez d'abord la fiche de votre institution.");
    try {
      const conv = await getOrCreateConversation(institution.id, seekerId);
      void navigate({ to: "/messages", search: { c: conv } });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold">{t("nav.candidates")}</h1>

      <Card className="mt-4 gap-3 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search.keyword")} className="pl-9" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
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
        </div>
      </Card>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {(data ?? []).map((c) => {
          const p = c.profiles as unknown as { full_name: string; department: string | null; commune: string | null } | null;
          return (
            <Card key={c.user_id} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-secondary text-xs">{initials(p?.full_name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p?.full_name}</p>
                  <p className="truncate text-sm text-muted-foreground">{c.headline}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {[p?.commune, p?.department].filter(Boolean).join(", ") || "—"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.sector && <Badge variant="secondary">{labelOf(SECTORS, c.sector, lang)}</Badge>}
                    {(c.skills ?? []).slice(0, 4).map((s) => (
                      <Badge key={s} variant="outline">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              {c.user_id !== user?.id && (
                <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => contact(c.user_id)}>
                  <MessageSquare className="h-4 w-4" /> {t("job.message")}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
      {data && data.length === 0 && <p className="mt-6 text-sm text-muted-foreground">{t("dash.empty")}</p>}
    </div>
  );
}
