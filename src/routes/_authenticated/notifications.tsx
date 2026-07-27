import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo } from "@/lib/konekte";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — KONEKTE" },
      { name: "description", content: "Toutes vos alertes KONEKTE : candidatures, messages et nouvelles offres." },
      { property: "og:title", content: "Notifications — KONEKTE" },
      { property: "og:description", content: "Ne manquez aucune opportunité." },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const markAll = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user!.id).eq("is_read", false);
    void qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t("nav.notifications")}</h1>
        <Button variant="ghost" size="sm" onClick={markAll}>
          <CheckCheck className="h-4 w-4" /> {t("notif.markall")}
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {(data ?? []).map((n) => (
          <Card
            key={n.id}
            onClick={async () => {
              if (!n.is_read) {
                await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
                void qc.invalidateQueries({ queryKey: ["notifications"] });
              }
              if (n.link) void navigate({ to: n.link });
            }}
            className={`cursor-pointer flex-row items-start gap-3 p-4 ${n.is_read ? "" : "border-primary/40 bg-muted/50"}`}
          >
            <Bell className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{n.title}</p>
              {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
              <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.created_at, lang)}</p>
            </div>
          </Card>
        ))}
        {data && data.length === 0 && <p className="text-sm text-muted-foreground">{t("notif.empty")}</p>}
      </div>
    </div>
  );
}
