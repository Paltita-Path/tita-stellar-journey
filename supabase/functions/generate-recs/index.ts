// Supabase Edge Function: generate-recs
// Deno runtime
// Reads onboarding answers and calls OpenAI GPT-4.1 to propose 3 tailored resources
// Returns: { recs: Array<{ id, title, url, type, tags }> }

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface Answers {
  experiencia: "Principiante" | "Intermedio" | "Avanzado" | null;
  metas: string[];
  tiempo: "3-5h" | "5-10h" | "10+h" | null;
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  try {
    const { answers } = await req.json() as { answers: Answers };

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY not set" }), { status: 500 });
    }

    const prompt = `Eres TITA, una mentora Web3 amable. Proporciona exactamente 3 recomendaciones útiles (JSON estricto) para este perfil. Campos: id (slug corto), title, url, type (course|hackathon|grant), tags (array de strings). Perfil: ${JSON.stringify(answers)}.`;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: "Responde solo con JSON válido" },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!r.ok) {
      const err = await r.text();
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }

    const data = await r.json();
    const content = data.choices?.[0]?.message?.content ?? "[]";
    let recs: any[] = [];
    try { recs = JSON.parse(content); } catch (_) { recs = []; }

    return new Response(JSON.stringify({ recs }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
