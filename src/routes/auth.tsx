import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Logo } from "@/components/layout/Header";

type AuthSearch = { mode?: string; role?: string; redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): AuthSearch => ({
    mode: (s.mode as string) || undefined,
    role: (s.role as string) || undefined,
    redirect: (s.redirect as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Connexion & inscription — RecruteHT" },
      { name: "description", content: "Créez votre compte RecruteHT, chercheur d'emploi ou institution, et commencez tout de suite." },
      { property: "og:title", content: "Connexion & inscription — RecruteHT" },
      { property: "og:description", content: "Rejoignez la plateforme d'emploi haïtienne RecruteHT." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [tab, setTab] = useState(search.mode === "signup" ? "signup" : "signin");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [role, setRole] = useState(search.role === "institution" ? "institution" : "job_seeker");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) {
      void navigate({ to: search.redirect === "/institution" ? "/institution" : "/dashboard" });
    }
  }, [session, navigate, search.redirect]);

  const afterAuth = () => {
    void navigate({ to: role === "institution" ? "/institution" : "/dashboard" });
  };

  const signUp = async () => {
    setBusy(true);
    try {
      if (method === "email") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, role },
          },
        });
        if (error) throw error;
        toast.success("Compte créé ! Vérifiez votre email si une confirmation est demandée.");
        afterAuth();
      } else {
        const { error } = await supabase.auth.signUp({
          phone,
          password,
          options: { data: { full_name: fullName, role } },
        });
        if (error) throw error;
        setOtpSent(true);
        toast.success("Code envoyé par SMS.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const signIn = async () => {
    setBusy(true);
    try {
      const { error } =
        method === "email"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signInWithPassword({ phone, password });
      if (error) throw error;
      void navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
      if (error) throw error;
      afterAuth();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error(result.error.message ?? "Connexion Google impossible");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/dashboard" });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-10">
      <Logo />
      <h1 className="mt-4 text-center font-display text-2xl font-bold">{t("auth.title")}</h1>
      <p className="mt-1 text-center text-sm text-muted-foreground">{t("app.tagline")}</p>

      <Card className="mt-6 w-full p-5">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t("auth.signin")}</TabsTrigger>
            <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex gap-2">
            {(["email", "phone"] as const).map((m) => (
              <Button
                key={m}
                type="button"
                variant={method === m ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setMethod(m);
                  setOtpSent(false);
                }}
              >
                {m === "email" ? t("auth.email") : t("auth.phone")}
              </Button>
            ))}
          </div>

          <TabsContent value="signin" className="mt-4 space-y-3">
            {method === "email" ? (
              <div className="space-y-1.5">
                <Label htmlFor="si-email">{t("auth.email")}</Label>
                <Input id="si-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="si-phone">{t("auth.phone")}</Label>
                <Input id="si-phone" type="tel" placeholder="+509…" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="si-pass">{t("auth.password")}</Label>
              <Input id="si-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button className="w-full" disabled={busy} onClick={signIn}>
              {t("auth.signin")}
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="su-name">{t("auth.fullname")}</Label>
              <Input id="su-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            {method === "email" ? (
              <div className="space-y-1.5">
                <Label htmlFor="su-email">{t("auth.email")}</Label>
                <Input id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="su-phone">{t("auth.phone")}</Label>
                <Input id="su-phone" type="tel" placeholder="+509…" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="su-pass">{t("auth.password")}</Label>
              <Input id="su-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>{t("auth.role")}</Label>
              <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-1 gap-2">
                {[
                  { v: "job_seeker", l: t("auth.role.seeker") },
                  { v: "institution", l: t("auth.role.institution") },
                ].map((o) => (
                  <Label
                    key={o.v}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${
                      role === o.v ? "border-primary bg-muted" : "border-border"
                    }`}
                  >
                    <RadioGroupItem value={o.v} /> {o.l}
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {otpSent ? (
              <div className="space-y-2">
                <Label htmlFor="otp">Code SMS</Label>
                <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <Button className="w-full" disabled={busy} onClick={verifyOtp}>
                  Vérifier
                </Button>
              </div>
            ) : (
              <Button className="w-full" disabled={busy} onClick={signUp}>
                {t("auth.signup")}
              </Button>
            )}
          </TabsContent>
        </Tabs>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> {t("auth.or")} <span className="h-px flex-1 bg-border" />
        </div>
        <Button variant="outline" className="w-full" onClick={google}>
          {t("auth.google")}
        </Button>
      </Card>

      <Link to="/jobs" className="mt-4 text-sm text-muted-foreground hover:text-foreground">
        {t("nav.jobs")} →
      </Link>
    </div>
  );
}
