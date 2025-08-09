import { supabase, type Json } from "./supabase";
import { resources } from "@/data/resources";

export type Answers = {
  experiencia: "Principiante" | "Intermedio" | "Avanzado" | null;
  metas: string[];
  tiempo: "3-5h" | "5-10h" | "10+h" | null;
};

export type RecItem = {
  id: string;
  title: string;
  url: string;
  type: "course" | "hackathon" | "grant";
  tags: string[];
};

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function signInWithEmail(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
  if (error) throw error;
}

export async function saveOnboardingAnswers(answers: Answers) {
  const user = await getUser();
  if (!user) throw new Error("No autenticado");
  const { error } = await supabase.from("onboarding_answers").insert({ user_id: user.id, data: answers as unknown as Json });
  if (error) throw error;
}

export async function generateRecommendations(answers: Answers): Promise<RecItem[]> {
  try {
    const { data, error } = await supabase.functions.invoke("generate-recs", { body: { answers } });
    if (error) throw error;
    const recs = (data?.recs ?? []) as RecItem[];
    if (Array.isArray(recs) && recs.length) {
      await saveRecommendations(recs);
      return recs.slice(0, 3);
    }
    throw new Error("Sin recs");
  } catch {
    // Fallback local simple
    const metas = answers.metas ?? [];
    const level = (answers.experiencia ?? "Principiante").toLowerCase();
    const all = [...resources.courses, ...resources.hackathons, ...resources.grants];
    const base = all.filter((r) => metas.some((m) => r.tags.includes(m)) || r.tags.includes(level)).slice(0, 3);
    const recs: RecItem[] = base.map((r: any) => ({ ...r, type: r.type as RecItem["type"] }));
    await saveRecommendations(recs);
    return recs;
  }
}

export async function saveRecommendations(recs: RecItem[]) {
  const user = await getUser();
  if (!user) return;
  const { error } = await supabase.from("recommendations").insert({ user_id: user.id, items: recs as unknown as Json });
  if (error) console.warn("Error guardando recommendations:", error.message);
}

export async function fetchLatestRecommendations(): Promise<RecItem[] | null> {
  const user = await getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("recommendations")
    .select("items, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return (data?.items as RecItem[]) ?? null;
}

export async function getProgress(): Promise<Record<string, boolean>> {
  const user = await getUser();
  if (!user) return {};
  const { data } = await supabase.from("progress").select("resource_id, done").eq("user_id", user.id);
  const map: Record<string, boolean> = {};
  (data ?? []).forEach((row: any) => (map[row.resource_id] = !!row.done));
  return map;
}

export async function toggleProgress(resourceId: string, done: boolean) {
  const user = await getUser();
  if (!user) throw new Error("No autenticado");
  await supabase.from("progress").upsert({ user_id: user.id, resource_id: resourceId, done });
}

export async function motivate(context?: any): Promise<string> {
  try {
    const { data } = await supabase.functions.invoke("motivate", { body: { context } });
    const msg = data?.message as string;
    if (msg) return msg;
    throw new Error("empty");
  } catch {
    const lostMessages = [
      "Respira. Avanza una tarea pequeña hoy. TITA está contigo.",
      "Nadie empieza experto. El progreso consistente gana.",
      "Vuelve a lo básico y elige un solo recurso ahora.",
    ];
    return lostMessages[Math.floor(Math.random() * lostMessages.length)];
  }
}

export async function claimBadge(receiverPublicKey: string): Promise<{ hash?: string }> {
  const user = await getUser();
  if (!user) throw new Error("No autenticado");
  const { data, error } = await supabase.functions.invoke("mint-badge", { body: { receiverPublicKey, userId: user.id } });
  if (error) throw error;
  const txHash = data?.hash as string | undefined;
  if (txHash) {
    await supabase.from("badges").insert({
      user_id: user.id,
      tx_hash: txHash,
      metadata: { name: "TITA Builder Badge", date: new Date().toISOString(), userId: user.id } as unknown as Json,
    });
  }
  return { hash: txHash };
}
