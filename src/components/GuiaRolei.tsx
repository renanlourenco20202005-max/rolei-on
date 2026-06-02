import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, X, Send, Star, MapPin } from "lucide-react";
import { places } from "@/lib/data";

interface Suggestion { placeId: string; reason: string; }

function suggest(query: string): Suggestion[] {
  const q = query.toLowerCase();
  const scored = places.map((p) => {
    let score = 0;
    const haystack = `${p.name} ${p.category} ${p.tags.join(" ")} ${p.vibes.join(" ")} ${p.description} ${p.promo ?? ""}`.toLowerCase();
    if (/romantic|namorad|casal|encontro|vinho/.test(q) && p.vibes.includes("romântico")) score += 5;
    if (/happy hour|chope|cerveja/.test(q) && (p.vibes.includes("happy hour") || /chope|cerveja/.test(haystack))) score += 4;
    if (/música|show|jazz|blues/.test(q) && p.category === "Música ao vivo") score += 5;
    if (/festa|balada|dança/.test(q) && p.category === "Festa") score += 5;
    if (/café|brunch|trabalhar/.test(q) && p.category === "Café") score += 5;
    if (/burger|comida|jantar|restaurante|gastron/.test(q) && /Restaurante|Gastronomia/.test(p.category)) score += 4;
    const m = q.match(/r\$?\s?(\d+)/);
    if (m) {
      const budget = parseInt(m[1]);
      const cap = { "$": 50, "$$": 100, "$$$": 200, "$$$$": 400 }[p.price];
      if (budget >= cap) score += 2;
    }
    q.split(/\s+/).forEach((w) => { if (w.length > 3 && haystack.includes(w)) score += 1; });
    return { p, score };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);

  if (scored.length === 0) return places.slice(0, 3).map((p) => ({ placeId: p.id, reason: "Está em alta na sua região agora." }));

  return scored.map(({ p, score }) => ({
    placeId: p.id,
    reason: score >= 5 ? `Combina com o clima que você descreveu.` : `Pode ser uma boa opção pra hoje.`,
  }));
}

export function GuiaRolei({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: string }) {
  const [input, setInput] = useState(initial ?? "");
  const [submitted, setSubmitted] = useState<string | null>(initial ?? null);
  if (!open) return null;
  const results = submitted ? suggest(submitted) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-secondary/60 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-[480px] rounded-t-3xl bg-card p-5 shadow-card md:rounded-3xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-hero text-white">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold">Guia Rolei</p>
              <p className="text-[11px] text-muted-foreground">Seu assistente de rolês</p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSubmitted(input.trim() || "rolê de hoje"); }}
          className="flex items-center gap-2 rounded-2xl border border-border bg-background p-2"
        >
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Quero sair com minha namorada e gastar até R$150…"
            className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground active:scale-95">
            <Send className="h-4 w-4" />
          </button>
        </form>

        {!submitted && (
          <div className="mt-4 grid gap-2">
            {[
              "Quero um lugar romântico",
              "Bar com happy hour perto de mim",
              "Música ao vivo hoje",
              "Restaurante até R$150",
            ].map((s) => (
              <button
                key={s}
                onClick={() => { setInput(s); setSubmitted(s); }}
                className="rounded-xl bg-muted px-4 py-3 text-left text-sm text-foreground transition active:scale-[0.98]"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {submitted && (
          <div className="mt-4 max-h-[55vh] space-y-3 overflow-y-auto no-scrollbar">
            <p className="text-xs text-muted-foreground">
              Selecionei {results.length} {results.length === 1 ? "lugar" : "lugares"} pensando em: <span className="text-foreground">"{submitted}"</span>
            </p>
            {results.map((s) => {
              const p = places.find((pl) => pl.id === s.placeId)!;
              return (
                <Link
                  key={s.placeId}
                  to="/place/$id"
                  params={{ id: s.placeId }}
                  onClick={onClose}
                  className="flex gap-3 rounded-2xl border border-border bg-card p-2 transition active:scale-[0.99]"
                >
                  <img src={p.image} alt={p.name} className="h-20 w-20 flex-shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1 py-1">
                    <p className="truncate text-sm font-bold">{p.name}</p>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{s.reason}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <Star className="h-3 w-3 fill-primary text-primary" /> {p.rating}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {p.distance}
                      </span>
                      <span className="text-muted-foreground">· {p.price}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
            <button onClick={() => setSubmitted(null)} className="w-full rounded-xl py-2 text-xs font-medium text-primary">
              Fazer outra pergunta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
