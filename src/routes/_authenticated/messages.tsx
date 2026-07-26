import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { initials, notify, timeAgo } from "@/lib/konekte";

type MsgSearch = { c?: string };

export const Route = createFileRoute("/_authenticated/messages")({
  validateSearch: (s: Record<string, unknown>): MsgSearch => ({ c: (s.c as string) || undefined }),
  head: () => ({
    meta: [
      { title: "Messagerie — TRAVAY" },
      { name: "description", content: "Échangez directement avec les institutions et les candidats sur TRAVAY." },
      { property: "og:title", content: "Messagerie — TRAVAY" },
      { property: "og:description", content: "Discussion directe, sans intermédiaire." },
    ],
  }),
  component: Messages,
});

function Messages() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const search = Route.useSearch();
  const qc = useQueryClient();
  const [active, setActive] = useState<string | null>(search.c ?? null);
  const [text, setText] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  const { data: conversations } = useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id,last_message_at,job_id,seeker_id,institution_id,institutions(id,name,owner_id)")
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      const rows = data ?? [];

      // profiles has no direct foreign key to conversations, so it can't be
      // embedded in the select above — fetch seeker names separately instead.
      const seekerIds = Array.from(new Set(rows.map((r) => r.seeker_id)));
      let profilesById = new Map<string, { full_name: string }>();
      if (seekerIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id,full_name").in("id", seekerIds);
        profilesById = new Map((profiles ?? []).map((p) => [p.id, p]));
      }

      return rows.map((r) => ({ ...r, profiles: profilesById.get(r.seeker_id) ?? null }));
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["messages", active],
    enabled: !!active,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id,body,sender_id,created_at")
        .eq("conversation_id", active!)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!active) return;
    const channel = supabase
      .channel(`conv-${active}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${active}` },
        () => {
          void qc.invalidateQueries({ queryKey: ["messages", active] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [active, qc]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!active || !text.trim() || !user) return;
    const body = text.trim();
    setText("");
    const { error } = await supabase.from("messages").insert({ conversation_id: active, sender_id: user.id, body });
    if (!error) {
      await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", active);
      void qc.invalidateQueries({ queryKey: ["messages", active] });

      const conv = conversations?.find((c) => c.id === active);
      if (conv) {
        const inst = conv.institutions as unknown as { name: string; owner_id: string } | null;
        const isSeeker = conv.seeker_id === user.id;
        const recipientId = isSeeker ? inst?.owner_id : conv.seeker_id;
        if (recipientId) {
          void notify({
            userId: recipientId,
            type: "message",
            title: "Nouveau message",
            body: body.slice(0, 120),
            link: `/messages?c=${active}`,
          });
        }
      }
    }
  };

  const label = (c: NonNullable<typeof conversations>[number]) =>
    c.seeker_id === user?.id
      ? ((c.institutions as unknown as { name: string } | null)?.name ?? "Institution")
      : ((c.profiles as unknown as { full_name: string } | null)?.full_name ?? "Candidat");

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold">{t("msg.title")}</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-[280px_1fr]">
        <Card className="max-h-[70vh] overflow-y-auto p-2">
          {(conversations ?? []).map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-muted ${
                active === c.id ? "bg-muted" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-secondary text-xs">{initials(label(c))}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{label(c)}</span>
                <span className="block text-xs text-muted-foreground">{timeAgo(c.last_message_at, lang)}</span>
              </span>
            </button>
          ))}
          {conversations && conversations.length === 0 && (
            <p className="p-3 text-sm text-muted-foreground">{t("msg.empty")}</p>
          )}
        </Card>

        <Card className="flex h-[70vh] flex-col p-0">
          {active ? (
            <>
              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {(messages ?? []).map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      m.sender_id === user?.id
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.body}
                  </div>
                ))}
                <div ref={bottom} />
              </div>
              <div className="flex gap-2 border-t border-border p-3">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={t("msg.placeholder")}
                />
                <Button onClick={send} aria-label={t("msg.send")}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <p className="m-auto text-sm text-muted-foreground">{t("msg.select")}</p>
          )}
        </Card>
      </div>
    </div>
  );
}