import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/apropos")({
  head: () => ({
    meta: [
      { title: "À propos — RecruteHT" },
      { name: "description", content: "Découvrez qui est derrière RecruteHT et le groupe G-Groupe HT." },
      { property: "og:title", content: "À propos — RecruteHT" },
      { property: "og:description", content: "Découvrez qui est derrière RecruteHT et le groupe G-Groupe HT." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gold-gradient font-display text-2xl font-extrabold text-gold-foreground">
          W
        </span>
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            {t("about.title")}
          </h1>
          <p className="text-sm text-muted-foreground">Wildjy Jean — Fondateur, G-Groupe HT</p>
        </div>
      </div>

      <Card className="space-y-4 p-6 text-base leading-relaxed text-foreground/90">
        <p>{t("about.p1")}</p>
        <p>{t("about.p2")}</p>
        <p>{t("about.p3")}</p>
      </Card>
    </div>
  );
}