import { supabase } from "@/integrations/supabase/client";

export const CV_MAX_SIZE = 5 * 1024 * 1024;
export const CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function signedUrl(bucket: string, path: string | null | undefined, seconds = 3600) {
  if (!path) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, seconds);
  return data?.signedUrl ?? null;
}

export async function notify(params: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
}) {
  const { error } = await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    link: params.link ?? null,
  });
  if (error) console.error("notify failed", error);
}



export async function getOrCreateConversation(institutionId: string, seekerId: string, jobId?: string | null) {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("institution_id", institutionId)
    .eq("seeker_id", seekerId)
    .maybeSingle();
  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from("conversations")
    .insert({ institution_id: institutionId, seeker_id: seekerId, job_id: jobId ?? null })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export function initials(name?: string | null) {
  if (!name) return "K";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function timeAgo(iso: string, lang: "fr" | "ht" = "fr") {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return lang === "fr" ? "à l'instant" : "kounye a";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 31) return lang === "fr" ? `${days} j` : `${days} jou`;
  return new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "fr-HT");
}
