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
  let parsed: { suggestions?: GuiaSuggestion[] } | null = null;
  try {
    parsed = JSON.parse(content);
  } catch {
    // tenta extrair o primeiro objeto json da resposta (ex.: vindo com markdown)
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try { parsed = JSON.parse(match[0]); } catch { parsed = null; }
    }
  }

  const validPlace = new Set(places.map((p) => p.id));
  const validEvent = new Set(events.map((e) => e.id));
  const fromAI = (parsed?.suggestions ?? [])
    .filter((s) =>
      (s.type === "place" && validPlace.has(s.id)) || (s.type === "event" && validEvent.has(s.id)),
    )
    .slice(0, 4);

  // Se a IA não retornou nada válido, cai para um ranqueamento local determinístico
  // para o Guia nunca voltar de mãos vazias.
  return fromAI.length > 0 ? fromAI : localFallback(message);
}

const PRICE_RANGE: Record<string, [number, number]> = {
  $: [0, 50],
  $$: [50, 100],
  $$$: [100, 200],
  $$$$: [200, 9999],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function localFallback(message: string): GuiaSuggestion[] {
  const text = normalize(message);
  const tokens = text.split(/[^a-z0-9$]+/).filter((t) => t.length > 2);
  const budgetMatch = message.match(/r\$\s*(\d+)/i) ?? message.match(/(\d+)\s*reais/i);
  const budget = budgetMatch ? Number(budgetMatch[1]) : null;

  const scored = places
    .filter((p) => (budget ? PRICE_RANGE[p.price][0] <= budget : true))
    .map((p) => {
      const hay = normalize([p.name, p.category, p.description, ...p.tags, ...p.vibes].join(" "));
      let score = p.rating / 10 + (p.promo ? 0.4 : 0);
      for (const t of tokens) if (hay.includes(t)) score += 2;
      if (/romantic|namorad|casal/.test(text) && p.vibes.some((v) => ["romântico", "casal"].includes(v))) score += 2;
      if (/vinho/.test(text) && hay.includes("vinho")) score += 2;
      if (/happy|bar|drink|chope/.test(text) && (p.category === "Bar" || p.vibes.includes("happy hour"))) score += 2;
      if (/musica|show|jazz|ao vivo/.test(text) && (p.category === "Música ao vivo" || hay.includes("show"))) score += 2;
      if (/festa|balada|dancar/.test(text) && p.category === "Festa") score += 2;
      if (/cafe|brunch/.test(text) && p.category === "Café") score += 2;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return scored.map(({ p }) => ({
    type: "place" as const,
    id: p.id,
    reason: `${p.category} com nota ${p.rating} e clima ${p.vibes.slice(0, 2).join(" e ")} — combina com o seu pedido.`,
  }));
}
