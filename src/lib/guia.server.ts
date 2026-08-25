import { places, events } from "@/lib/data";

export interface GuiaPrefs {
  company?: string[];
  likes?: string[];
  budget?: string;
}

export interface GuiaSuggestion {
  type: "place" | "event";
  id: string;
  reason: string;
}

const PRICE_LABEL: Record<string, string> = {
  $: "até R$50 por pessoa",
  $$: "R$50–100 por pessoa",
  $$$: "R$100–200 por pessoa",
  $$$$: "acima de R$200 por pessoa",
};

function catalogText() {
  const placeLines = places.map(
    (p) =>
      `- id="${p.id}" tipo=local | ${p.name} (${p.category}) | faixa de preço: ${PRICE_LABEL[p.price]} | vibes: ${p.vibes.join(", ")} | tags: ${p.tags.join(", ")} | ${p.description}${p.promo ? ` | promoção: ${p.promo}` : ""}`,
  );
  const eventLines = events.map(
    (e) =>
      `- id="${e.id}" tipo=evento | ${e.title} | ${e.date} | ${e.free ? "gratuito" : `pago (${e.price ?? ""})`} | local: ${e.venue} | categoria: ${e.category}`,
  );
  return [...placeLines, ...eventLines].join("\n");
}

export async function askGuiaAI(message: string, prefs: GuiaPrefs): Promise<GuiaSuggestion[]> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Guia Rolei não está configurado (LOVABLE_API_KEY ausente).");

  const prefsText = [
    prefs.company?.length ? `Companhia habitual: ${prefs.company.join(", ")}` : null,
    prefs.likes?.length ? `Interesses: ${prefs.likes.join(", ")}` : null,
    prefs.budget ? `Orçamento habitual: ${prefs.budget}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const system = `Você é o Guia Rolei, assistente de um app brasileiro que responde "o que fazer hoje?".
Sua tarefa: dado o pedido do usuário e o catálogo abaixo, escolher de 2 a 4 opções (locais e/ou eventos) que melhor combinam com o pedido, considerando estilo, companhia e orçamento quando mencionados (ex.: "até R$150" exclui opções claramente acima disso).
Responda SOMENTE com um objeto json no formato:
{"suggestions":[{"type":"place"|"event","id":"<id do catálogo>","reason":"<1 frase curta e pessoal em pt-BR explicando por que combina>"}]}
Use apenas ids que existam no catálogo. Nunca invente lugares. Se nada combinar bem, escolha as 2 opções mais próximas e explique na reason.

CATÁLOGO:
${catalogText()}`;

  const user = `${prefsText ? `Preferências do usuário:\n${prefsText}\n\n` : ""}Pedido: ${message}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let msg = `Erro ${res.status} ao consultar o Guia Rolei.`;
    try {
      const parsed = JSON.parse(body);
      msg = parsed?.error?.message ?? parsed?.message ?? msg;
    } catch { /* keep default */ }
    // 402/403 são terminais: repassar a mensagem do gateway sem retry
    throw new Error(msg);
  }

  const json = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "";
  let parsed: { suggestions?: GuiaSuggestion[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("O Guia não conseguiu montar as sugestões. Tente de novo.");
  }

  const validPlace = new Set(places.map((p) => p.id));
  const validEvent = new Set(events.map((e) => e.id));
  return (parsed.suggestions ?? [])
    .filter((s) =>
      (s.type === "place" && validPlace.has(s.id)) || (s.type === "event" && validEvent.has(s.id)),
    )
    .slice(0, 4);
}
