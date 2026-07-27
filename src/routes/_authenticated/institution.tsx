import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LocationSelects, OptionSelect } from "@/components/Selects";
import { SECTORS } from "@/lib/haiti";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/institution")({
  head: () => ({
    meta: [
      { title: "Mon institution — KONEKTE" },
      { name: "description", content: "Gérez la fiche de votre institution et vos coordonnées de recrutement sur KONEKTE." },
      { property: "og:title", content: "Mon institution — KONEKTE" },
      { property: "og:description", content: "Présentez votre institution aux talents haïtiens." },
    ],
  }),
  component: InstitutionPage,
});

function InstitutionPage() {
  const { t } = useI18n();
  const { user, institution, refresh } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [sector, setSector] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState<string | null>(null);
  const [commune, setCommune] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [publicContact, setPublicContact] = useState(true);

  useEffect(() => {
    if (institution) {
      setName(institution.name ?? "");
      setSector(institution.sector ?? null);
      setDescription(institution.description ?? "");
      setDepartment(institution.department ?? null);
      setCommune(institution.commune ?? null);
      setWebsite(institution.website ?? "");
      setEmail(institution.contact_email ?? "");
      setPhoneNum(institution.contact_phone ?? "");
      setWhatsapp(institution.whatsapp ?? "");
      setPublicContact(institution.contact_public ?? true);
    }
  }, [institution]);

  const save = async () => {
    if (!user) return;
    if (!name.trim() || !sector) return toast.error("Nom et secteur sont requis.");
    setSaving(true);
    try {
      const payload = {
        owner_id: user.id,
        name: name.trim(),
        sector,
        description: description || null,
        department,
        commune,
        website: website || null,
        contact_email: email || null,
        contact_phone: phoneNum || null,
        whatsapp: whatsapp || null,
        contact_public: publicContact,
      };
      const { error } = institution
        ? await supabase.from("institutions").update(payload).eq("id", institution.id)
        : await supabase.from("institutions").insert(payload);
      if (error) throw error;
      await refresh();
      toast.success(t("common.saved"));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold">{t("nav.institution")}</h1>
      <Card className="mt-4 gap-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("inst.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("filter.sector")}</Label>
            <OptionSelect options={SECTORS} value={sector} onChange={setSector} placeholder={t("filter.sector")} />
          </div>
          <LocationSelects department={department} commune={commune} onDepartment={setDepartment} onCommune={setCommune} />
        </div>

        <div className="space-y-1.5">
          <Label>{t("inst.description")}</Label>
          <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("inst.website")}</Label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
          </div>
          <div className="space-y-1.5">
            <Label>{t("auth.email")}</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("auth.phone")}</Label>
            <Input value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)} placeholder="+509…" />
          </div>
          <div className="space-y-1.5">
            <Label>WhatsApp</Label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+509…" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <p className="text-sm font-medium">{t("inst.contactpublic")}</p>
          <Switch checked={publicContact} onCheckedChange={setPublicContact} />
        </div>

        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} {t("common.save")}
        </Button>
      </Card>
    </div>
  );
}
