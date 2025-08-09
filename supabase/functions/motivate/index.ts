// Supabase Edge Function: motivate
// Returns a short, warm motivational message using GPT-4.1
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  try {
    const { context } = await req.json();

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ message: "Respira. Avanza una tarea pequeña hoy. TITA está contigo." }), { headers: { "Content-Type": "application/json" } });
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: "Eres TITA, una mentora Web3 amable que motiva con mensajes breves y cálidos." },
          { role: "user", content: `Dame 1 frase motivadora (máx 160 caracteres) basada en: ${JSON.stringify(context)}` },
        ],
        temperature: 0.8,
      }),
    });

    if (!r.ok) {
      return new Response(JSON.stringify({ message: "Nadie empieza experto. El progreso consistente gana." }), { headers: { "Content-Type": "application/json" } });
    }

    const data = await r.json();
    const content = data.choices?.[0]?.message?.content ?? "Sigue adelante. Un paso a la vez.";

    return new Response(JSON.stringify({ message: content.trim() }), { headers: { "Content-Type": "application/json" } });
  } catch (_) {
    return new Response(JSON.stringify({ message: "Vuelve a lo básico y elige un solo recurso ahora." }), { headers: { "Content-Type": "application/json" } });
  }
});
