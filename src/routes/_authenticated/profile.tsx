import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { LocationSelects, OptionSelect } from "@/components/Selects";
import { SECTORS, AVAILABILITIES, LANGUAGES_SPOKEN } from "@/lib/haiti";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { CV_MAX_SIZE, CV_TYPES, signedUrl } from "@/lib/konekte";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Mon profil — KONEKTE" },
      { name: "description", content: "Complétez votre profil KONEKTE : compétences, expérience, localisation et CV." },
      { property: "og:title", content: "Mon profil — KONEKTE" },
      { property: "og:description", content: "Un profil complet augmente vos chances d'être recruté." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, lang } = useI18n();
  const { user, profile, refresh } = useAuth();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState<string | null>(null);
  const [commune, setCommune] = useState<string | null>(null);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [sector, setSector] = useState<string | null>(null);
  const [availability, setAvailability] = useState<string | null>(null);
  const [skillsText, setSkillsText] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [searchable, setSearchable] = useState(true);

  const { data: sp } = useQuery({
    queryKey: ["seeker-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("job_seeker_profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setDepartment(profile.department ?? null);
      setCommune(profile.commune ?? null);
    }
  }, [profile]);

  useEffect(() => {
    if (sp) {
      setHeadline(sp.headline ?? "");
      setBio(sp.bio ?? "");
      setSector(sp.sector ?? null);
      setAvailability(sp.availability ?? null);
      setSkillsText((sp.skills ?? []).join(", "));
      setLanguages(sp.languages ?? []);
      setSearchable(sp.is_searchable ?? true);
    }
  }, [sp]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error: e1 } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone, department, commune })
        .eq("id", user.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("job_seeker_profiles").upsert(
        {
          user_id: user.id,
          headline,
          bio,
          sector,
          availability,
          skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
          languages,
          is_searchable: searchable,
        },
        { onConflict: "user_id" },
      );
      if (e2) throw e2;
      await refresh();
      void qc.invalidateQueries({ queryKey: ["seeker-profile"] });
      toast.success(t("common.saved"));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const uploadCv = async (file: File) => {
    if (!user) return;
    if (!CV_TYPES.includes(file.type)) return toast.error("Format accepté : PDF ou Word.");
    if (file.size > CV_MAX_SIZE) return toast.error("Fichier trop lourd (max 5 Mo).");
    setUploading(true);
    try {
      const path = `${user.id}/cv-${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
      const { error } = await supabase.storage.from("cvs").upload(path, file, { upsert: true });
      if (error) throw error;
      const { error: e2 } = await supabase.from("job_seeker_profiles").upsert(
        { user_id: user.id, cv_path: path, cv_filename: file.name, cv_updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
      if (e2) throw e2;
      void qc.invalidateQueries({ queryKey: ["seeker-profile"] });
      toast.success(t("cv.uploaded"));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const openCv = async () => {
    const url = await signedUrl("cvs", sp?.cv_path);
    if (url) window.open(url, "_blank", "noopener");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold">{t("nav.profile")}</h1>

      <Card className="mt-4 gap-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("auth.fullname")}</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("auth.phone")}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+509…" />
          </div>
          <LocationSelects department={department} commune={commune} onDepartment={setDepartment} onCommune={setCommune} />
        </div>

        <div className="space-y-1.5">
          <Label>{t("profile.headline")}</Label>
          <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("profile.bio")}</Label>
          <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("filter.sector")}</Label>
            <OptionSelect options={SECTORS} value={sector} onChange={setSector} placeholder={t("filter.sector")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("profile.availability")}</Label>
            <OptionSelect
              options={AVAILABILITIES}
              value={availability}
              onChange={setAvailability}
              placeholder={t("profile.availability")}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t("profile.skills")}</Label>
          <Input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="Excel, Vente, Comptabilité…" />
        </div>

        <div className="space-y-2">
          <Label>{t("profile.languages")}</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES_SPOKEN.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguages((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]))}
              >
                <Badge variant={languages.includes(l) ? "default" : "outline"}>{l}</Badge>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">{t("profile.searchable")}</p>
            <p className="text-xs text-muted-foreground">{t("profile.searchable.hint")}</p>
          </div>
          <Switch checked={searchable} onCheckedChange={setSearchable} />
        </div>

        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} {t("common.save")}
        </Button>
      </Card>

      <Card className="mt-4 gap-3 p-5">
        <h2 className="font-display text-lg font-bold">{t("cv.title")}</h2>
        {sp?.cv_path ? (
          <button onClick={openCv} className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <FileText className="h-4 w-4" /> {sp.cv_filename ?? "CV"}
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">{t("cv.none")}</p>
        )}
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {t("cv.upload")}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={(e) => e.target.files?.[0] && uploadCv(e.target.files[0])}
          />
        </label>
        <p className="text-xs text-muted-foreground">{lang === "fr" ? "PDF ou Word, 5 Mo max." : "PDF oswa Word, 5 Mo maksimòm."}</p>
      </Card>
    </div>
  );
}
