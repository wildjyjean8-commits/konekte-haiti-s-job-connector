import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationSelects, OptionSelect } from "@/components/Selects";
import { SECTORS, CONTRACT_TYPES, EXPERIENCE_LEVELS } from "@/lib/haiti";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/lib/konekte";

export const Route = createFileRoute("/_authenticated/post-job")({
  head: () => ({
    meta: [
      { title: "Publier une offre — RecruteHT" },
      { name: "description", content: "Publiez une offre d'emploi visible par des milliers de candidats partout en Haïti." },
      { property: "og:title", content: "Publier une offre — RecruteHT" },
      { property: "og:description", content: "Recrutez rapidement dans les 10 départements d'Haïti." },
    ],
  }),
  component: PostJob,
});

function PostJob() {
  const { t } = useI18n();
  const { institution, user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sector, setSector] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [commune, setCommune] = useState<string | null>(null);
  const [contract, setContract] = useState<string | null>("full_time");
  const [experience, setExperience] = useState<string | null>("junior");
  const [salary, setSalary] = useState("");
  const [deadline, setDeadline] = useState("");

  const submit = async () => {
    if (!institution) return toast.error("Créez d'abord la fiche de votre institution.");
    if (!title.trim() || !description.trim() || !sector || !department || !contract || !experience) {
      return toast.error("Merci de remplir les champs obligatoires.");
    }
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          institution_id: institution.id,
          title: title.trim(),
          description: description.trim(),
          sector,
          department,
          commune,
          contract_type: contract as never,
          experience_level: experience as never,
          salary_range: salary || null,
          deadline: deadline || null,
          status: "open" as never,
        })
        .select("id")
        .single();
      if (error) throw error;

      // Les alertes candidats sont envoyées par le trigger SQL `notify_job_alerts`
      // (voir supabase/migrations), car la RLS empêche de lire les alertes des autres.
      if (user) {
        await notify({
          userId: user.id,
          type: "job_posted",
          title: "Offre publiée",
          body: title.trim(),
          link: `/jobs/${data.id}`,
        });
      }

      toast.success(t("common.saved"));
      void navigate({ to: "/jobs/$jobId", params: { jobId: data.id } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold">{t("nav.postjob")}</h1>
      <Card className="mt-4 gap-4 p-5">
        <div className="space-y-1.5">
          <Label>{t("post.title")}</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("job.description")}</Label>
          <Textarea rows={8} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("filter.sector")}</Label>
            <OptionSelect options={SECTORS} value={sector} onChange={setSector} placeholder={t("filter.sector")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("filter.contract")}</Label>
            <OptionSelect options={CONTRACT_TYPES} value={contract} onChange={setContract} placeholder={t("filter.contract")} />
          </div>
          <LocationSelects department={department} commune={commune} onDepartment={setDepartment} onCommune={setCommune} />
          <div className="space-y-1.5">
            <Label>{t("filter.experience")}</Label>
            <OptionSelect
              options={EXPERIENCE_LEVELS}
              value={experience}
              onChange={setExperience}
              placeholder={t("filter.experience")}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("post.salary")}</Label>
            <Input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="25 000 – 40 000 HTG" />
          </div>
          <div className="space-y-1.5">
            <Label>{t("job.deadline")}</Label>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
        </div>
        <Button onClick={submit} disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} {t("nav.postjob")}
        </Button>
      </Card>
    </div>
  );
}
