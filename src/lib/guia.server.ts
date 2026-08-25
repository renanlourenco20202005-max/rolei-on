import { createClient } from "@supabase/supabase-js";
import { places, events } from "@/lib/data";
import type { Database } from "@/integrations/supabase/types";

export interface GuiaPrefs {
  company?: string[];
  likes?: string[];
  budget?: string;
}

// Sugestão enriquecida com os atributos reais do catálogo, para o cliente
// filtrar/refinar com precisão sem depender de lookup local.
export interface GuiaSuggestion {
  type: "place" | "event";
  id: string;
  reason: string;
  name: string;
  category: string;
  image: string | null;
  priceLevel: number | null; // 1 ($) a 4 ($$$$); null = não informado
  rating: number | null;
  distanceKm: number | null;
  hasPromo: boolean;
  free: boolean;
  date: string | null;
  venue: string | null;
  linkable: boolean; // true quando existe página /place/$id no app
}

interface CatalogEntry extends GuiaSuggestion {
  searchText: string; // texto para a IA e para o fallback local
}

const PRICE_LABEL: Record<string, string> = {
  $: "até R$50 por pessoa",
  $$: "R$50–100 por pessoa",
  $$$: "R$100–200 por pessoa",
  $$$$: "acima de R$200 por pessoa",
};

function parseDistanceKm(distance: string): number | null {
  const n = Number(distance.replace(",", ".").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function eventPriceLevel(free: boolean, price?: string): number {
  if (free) return 1;
  const n = Number((price ?? "").replace(/[^\d]/g, ""));
  if (!Number.isFinite(n) || n === 0) return 1;
  if (n <= 60) return 2;
  if (n <= 120) return 3;
  return 4;
}

function promosText(promos: unknown): string {
  if (!Array.isArray(promos)) return "";
  return promos
    .map((p) => {
      if (typeof p === "string") return p;
      if (p && typeof p === "object") {
        const o = p as Record<string, unknown>;
        return [o.title, o.description].filter((v) => typeof v === "string" && v).join(" — ");
      }
      return "";
    })
    .filter(Boolean)
    .join("; ");
}

function baseCatalog(): CatalogEntry[] {
  const placeEntries: CatalogEntry[] = places.map((p) => ({
    type: "place",
    id: p.id,
    reason: "",
    name: p.name,
    category: p.category,
    image: p.image,
    priceLevel: p.price.length,
    rating: p.rating,
    distanceKm: parseDistanceKm(p.distance),
    hasPromo: Boolean(p.promo),
    free: false,
    date: null,
    venue: null,
    linkable: true,
    searchText: `id="${p.id}" tipo=local | ${p.name} (${p.category}) | faixa de preço: ${PRICE_LABEL[p.price]} | avaliação: ${p.rating}/5 (${p.reviews} avaliações) | distância: ${p.distance} | vibes: ${p.vibes.join(", ")} | tags: ${p.tags.join(", ")} | ${p.description}${p.promo ? ` | promoção: ${p.promo}` : ""}`,
  }));

  const eventEntries: CatalogEntry[] = events.map((e) => ({
    type: "event",
    id: e.id,
    reason: "",
    name: e.title,
    category: e.category,
    image: e.image,
    priceLevel: eventPriceLevel(e.free, e.price),
    rating: null,
    distanceKm: null,
    hasPromo: e.free,
    free: e.free,
    date: e.date,
    venue: e.venue,
    linkable: false,
    searchText: `id="${e.id}" tipo=evento | ${e.title} | ${e.date} | ${e.free ? "gratuito" : `pago (${e.price ?? ""})`} | local: ${e.venue} | categoria: ${e.category}`,
  }));

  return [...placeEntries, ...eventEntries];
}

async function partnerCatalog(): Promise<CatalogEntry[]> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return [];
  try {
    const supabasePublic = createClient<Database>(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data, error } = await supabasePublic
      .from("partner_profiles")
      .select("user_id, name, category, description, address, hours, cover, promos")
      .limit(50);
    if (error || !data) return [];

    return data
      .filter((row) => row.name.trim().length > 0)
      .map((row): CatalogEntry => {
        const promo = promosText(row.promos);
        const parts = [
          row.description,
          row.address ? `endereço: ${row.address}` : "",
          row.hours ? `horário: ${row.hours}` : "",
          promo ? `promoção: ${promo}` : "",
        ].filter(Boolean);
        return {
          type: "place",
          id: `partner-${row.user_id}`,
          reason: "",
          name: row.name,
          category: row.category,
          image: row.cover || null,
          priceLevel: null,
          rating: null,
          distanceKm: null,
          hasPromo: promo.length > 0,
          free: false,
          date: null,
          venue: null,
          linkable: false,
          searchText: `id="partner-${row.user_id}" tipo=local (parceiro Rolei) | ${row.name} (${row.category}) | ${parts.join(" | ")}`,
        };
      });
  } catch {
    return [];
  }
}

export async function askGuiaAI(message: string, prefs: GuiaPrefs): Promise<GuiaSuggestion[]> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Guia Rolei não está configurado (LOVABLE_API_KEY ausente).");

  const catalog = [...baseCatalog(), ...(await partnerCatalog())];

  const prefsText = [
    prefs.company?.length ? `Companhia habitual: ${prefs.company.join(", ")}` : null,
    prefs.likes?.length ? `Interesses: ${prefs.likes.join(", ")}` : null,
    prefs.budget ? `Orçamento habitual: ${prefs.budget}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const system = `Você é o Guia Rolei, assistente de um app brasileiro que responde "o que fazer hoje?".
Sua tarefa: dado o pedido do usuário e o catálogo abaixo, escolher de 2 a 4 opções (locais e/ou eventos) que melhor combinam com o pedido, considerando estilo, companhia, distância, avaliação e orçamento quando mencionados (ex.: "até R$150" exclui opções claramente acima disso).
Responda SOMENTE com um objeto json no formato:
{"suggestions":[{"type":"place"|"event","id":"<id do catálogo>","reason":"<1 frase curta e pessoal em pt-BR explicando por que combina>"}]}
Use apenas ids que existam no catálogo. Nunca invente lugares. Se nada combinar bem, escolha as 2 opções mais próximas e explique na reason.

CATÁLOGO:
${catalog.map((c) => `- ${c.searchText}`).join("\n")}`;

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
  let parsed: { suggestions?: Array<{ type: string; id: string; reason: string }> } | null = null;
  try {
    parsed = JSON.parse(content);
  } catch {
    // tenta extrair o primeiro objeto json da resposta (ex.: vindo com markdown)
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try { parsed = JSON.parse(match[0]); } catch { parsed = null; }
    }
  }

  const byId = new Map(catalog.map((c) => [c.id, c]));
  const fromAI = (parsed?.suggestions ?? [])
    .filter((s) => (s.type === "place" || s.type === "event") && byId.has(s.id))
    .slice(0, 4)
    .map((s) => stripEntry(byId.get(s.id)!, s.reason));

  // Se a IA não retornou nada válido, cai para um ranqueamento local determinístico
  // para o Guia nunca voltar de mãos vazias.
  return fromAI.length > 0 ? fromAI : localFallback(message, catalog);
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

function stripEntry(entry: CatalogEntry, reason: string): GuiaSuggestion {
  const { searchText: _omit, ...dto } = entry;
  void _omit;
  return { ...dto, reason };
}

function localFallback(message: string, catalog: CatalogEntry[]): GuiaSuggestion[] {
  const text = normalize(message);
  const tokens = text.split(/[^a-z0-9$]+/).filter((t) => t.length > 2);
  const budgetMatch = message.match(/r\$\s*(\d+)/i) ?? message.match(/(\d+)\s*reais/i);
  const budget = budgetMatch ? Number(budgetMatch[1]) : null;

  const scored = catalog
    .filter((c) => c.type === "place")
    .filter((c) => {
      if (!budget) return true;
      const base = places.find((p) => p.id === c.id);
      if (!base) return true; // parceiros sem faixa de preço não são excluídos por orçamento
      return PRICE_RANGE[base.price][0] <= budget;
    })
    .map((c) => {
      const hay = normalize([c.name, c.category, c.searchText].join(" "));
      let score = (c.rating ?? 4.2) / 10 + (c.hasPromo ? 0.4 : 0);
      for (const t of tokens) if (hay.includes(t)) score += 2;
      if (/romantic|namorad|casal/.test(text) && /romantic|casal/.test(hay)) score += 2;
      if (/vinho/.test(text) && hay.includes("vinho")) score += 2;
      if (/happy|bar|drink|chope/.test(text) && (c.category === "Bar" || hay.includes("happy hour"))) score += 2;
      if (/musica|show|jazz|ao vivo/.test(text) && (c.category === "Música ao vivo" || hay.includes("show"))) score += 2;
      if (/festa|balada|dancar/.test(text) && c.category === "Festa") score += 2;
      if (/after|madrugada|sunrise|amanhecer/.test(text) && c.category === "After") score += 2;
      if (/cafe|brunch/.test(text) && c.category === "Café") score += 2;
      return { c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return scored.map(({ c }) =>
    stripEntry(
      c,
      c.rating !== null
        ? `${c.category} com nota ${c.rating} — combina com o seu pedido.`
        : `${c.category} parceiro Rolei — combina com o seu pedido.`,
    ),
  );
}
