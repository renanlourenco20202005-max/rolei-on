import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, X, Send, Star, MapPin, Calendar, Loader2 } from "lucide-react";
import { places, events } from "@/lib/data";
import { askGuia, type GuiaSuggestion } from "@/lib/guia.functions";
import { getPrefs } from "@/lib/store";

export function GuiaRolei({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: string }) {
  const [input, setInput] = useState(initial ?? "");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [results, setResults] = useState<GuiaSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ask = useServerFn(askGuia);

  if (!open) return null;

  const submit = async (message: string) => {
    const text = message.trim();
    if (!text || loading) return;
    setSubmitted(text);
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const prefs = getPrefs();
      const { suggestions } = await ask({
        data: {
          message: text,
          prefs: { company: prefs.company, likes: prefs.likes, budget: prefs.budget },
        },
      });
      setResults(suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não consegui falar com o Guia agora.");
    } finally {
      setLoading(false);
    }
  };

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
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-muted" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); void submit(input); }}
          className="flex items-center gap-2 rounded-2xl border border-border bg-background p-2"
        >
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Quero sair com minha namorada e gastar até R$150…"
            className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
            maxLength={300}
          />
          <button
            type="submit"
            disabled={loading}
            className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground transition active:scale-95 disabled:opacity-60"
            aria-label="Enviar"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
                onClick={() => { setInput(s); void submit(s); }}
                className="rounded-xl bg-muted px-4 py-3 text-left text-sm text-foreground transition active:scale-[0.98]"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {submitted && (
          <div className="mt-4 max-h-[55vh] space-y-3 overflow-y-auto no-scrollbar" aria-live="polite" aria-busy={loading}>
            {loading && (
              <div className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Pensando no rolê ideal para: <span className="text-foreground">"{submitted}"</span>
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl bg-muted px-4 py-4 text-center">
                <p className="text-sm font-semibold">Ops, algo deu errado</p>
                <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                <button
                  onClick={() => void submit(submitted)}
                  className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!loading && !error && results.length === 0 && (
              <div className="rounded-2xl bg-muted px-4 py-4 text-center">
                <p className="text-sm font-semibold">Nenhuma sugestão desta vez</p>
                <p className="mt-1 text-xs text-muted-foreground">Tente descrever o rolê de outro jeito.</p>
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Selecionei {results.length} {results.length === 1 ? "sugestão" : "sugestões"} pensando em:{" "}
                <span className="text-foreground">"{submitted}"</span>
              </p>
            )}

            {!loading && !error && results.map((s) =>
              s.type === "place" ? (
                <PlaceSuggestion key={`place-${s.id}`} id={s.id} reason={s.reason} onClose={onClose} />
              ) : (
                <EventSuggestion key={`event-${s.id}`} id={s.id} reason={s.reason} />
              ),
            )}

            {!loading && (
              <button
                onClick={() => { setSubmitted(null); setError(null); setResults([]); }}
                className="w-full rounded-xl py-2 text-xs font-medium text-primary"
              >
                Fazer outra pergunta
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceSuggestion({ id, reason, onClose }: { id: string; reason: string; onClose: () => void }) {
  const p = places.find((pl) => pl.id === id);
  if (!p) return null;
  return (
    <Link
      to="/place/$id"
      params={{ id }}
      onClick={onClose}
      className="flex gap-3 rounded-2xl border border-border bg-card p-2 transition active:scale-[0.99]"
    >
      <img src={p.image} alt={p.name} className="h-20 w-20 flex-shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1 py-1">
        <p className="truncate text-sm font-bold">{p.name}</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{reason}</p>
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
}

function EventSuggestion({ id, reason }: { id: string; reason: string }) {
  const e = events.find((ev) => ev.id === id);
  if (!e) return null;
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-2">
      <img src={e.image} alt={e.title} className="h-20 w-20 flex-shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1 py-1">
        <p className="line-clamp-1 text-sm font-bold">{e.title}</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{reason}</p>
        <div className="mt-1.5 flex items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1 font-semibold text-primary">
            <Calendar className="h-3 w-3" /> {e.date}
          </span>
          <span className="flex items-center gap-1 truncate text-muted-foreground">
            <MapPin className="h-3 w-3" /> {e.venue}
          </span>
        </div>
      </div>
    </div>
  );
}
