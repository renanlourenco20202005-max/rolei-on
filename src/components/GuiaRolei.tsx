import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, X, Send, Star, MapPin, Calendar, Loader2, SlidersHorizontal, Store } from "lucide-react";
import { images } from "@/lib/data";
import { askGuia, type GuiaSuggestion } from "@/lib/guia.functions";
import { getPrefs } from "@/lib/store";

interface GuiaFilters {
  maxDistance: number | null; // km
  maxPrice: number | null; // 1..4 ($ → $$$$)
  category: string | null;
  minRating: number | null;
  onlyPromo: boolean;
}

const DEFAULT_FILTERS: GuiaFilters = {
  maxDistance: null,
  maxPrice: null,
  category: null,
  minRating: null,
  onlyPromo: false,
};

function suggestionMatches(s: GuiaSuggestion, f: GuiaFilters): boolean {
  // Itens sem o dado cadastrado (ex.: eventos sem distância/avaliação) são
  // ocultados quando o filtro correspondente está ativo.
  if (f.maxDistance !== null && (s.distanceKm === null || s.distanceKm > f.maxDistance)) return false;
  if (f.maxPrice !== null && (s.priceLevel === null || s.priceLevel > f.maxPrice)) return false;
  if (f.category !== null && s.category !== f.category) return false;
  if (f.minRating !== null && (s.rating === null || s.rating < f.minRating)) return false;
  if (f.onlyPromo && !s.hasPromo && !s.free) return false;
  return true;
}

const FALLBACK_IMAGE = images.bar1;

export function GuiaRolei({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: string }) {
  const [input, setInput] = useState(initial ?? "");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [results, setResults] = useState<GuiaSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GuiaFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const ask = useServerFn(askGuia);

  const filtered = useMemo(
    () => results.filter((s) => suggestionMatches(s, filters)),
    [results, filters],
  );

  const categories = useMemo(() => Array.from(new Set(results.map((s) => s.category))), [results]);

  const activeFilterCount =
    (filters.maxDistance !== null ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.category !== null ? 1 : 0) +
    (filters.minRating !== null ? 1 : 0) +
    (filters.onlyPromo ? 1 : 0);

  if (!open) return null;

  const submit = async (message: string) => {
    const text = message.trim();
    if (!text || loading) return;
    setSubmitted(text);
    setLoading(true);
    setError(null);
    setResults([]);
    setFilters(DEFAULT_FILTERS);
    setShowFilters(false);
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
              <>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    {activeFilterCount > 0
                      ? `${filtered.length} de ${results.length} ${results.length === 1 ? "sugestão" : "sugestões"}`
                      : `Selecionei ${results.length} ${results.length === 1 ? "sugestão" : "sugestões"}`}{" "}
                    pensando em: <span className="text-foreground">"{submitted}"</span>
                  </p>
                  <button
                    onClick={() => setShowFilters((v) => !v)}
                    aria-expanded={showFilters}
                    className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition active:scale-95 ${
                      activeFilterCount > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    Filtros{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}
                  </button>
                </div>

                {showFilters && (
                  <div className="space-y-3 rounded-2xl border border-border bg-background p-3">
                    <FilterGroup label="Distância">
                      {[
                        { label: "Até 1 km", value: 1 },
                        { label: "Até 3 km", value: 3 },
                      ].map((o) => (
                        <Chip
                          key={o.label}
                          active={filters.maxDistance === o.value}
                          onClick={() =>
                            setFilters((f) => ({ ...f, maxDistance: f.maxDistance === o.value ? null : o.value }))
                          }
                        >
                          {o.label}
                        </Chip>
                      ))}
                    </FilterGroup>

                    <FilterGroup label="Preço">
                      {[
                        { label: "$", value: 1 },
                        { label: "até $$", value: 2 },
                        { label: "até $$$", value: 3 },
                      ].map((o) => (
                        <Chip
                          key={o.label}
                          active={filters.maxPrice === o.value}
                          onClick={() =>
                            setFilters((f) => ({ ...f, maxPrice: f.maxPrice === o.value ? null : o.value }))
                          }
                        >
                          {o.label}
                        </Chip>
                      ))}
                    </FilterGroup>

                    {categories.length > 1 && (
                      <FilterGroup label="Categoria">
                        {categories.map((c) => (
                          <Chip
                            key={c}
                            active={filters.category === c}
                            onClick={() =>
                              setFilters((f) => ({ ...f, category: f.category === c ? null : c }))
                            }
                          >
                            {c}
                          </Chip>
                        ))}
                      </FilterGroup>
                    )}

                    <FilterGroup label="Avaliação">
                      {[
                        { label: "4,5+", value: 4.5 },
                        { label: "4,7+", value: 4.7 },
                      ].map((o) => (
                        <Chip
                          key={o.label}
                          active={filters.minRating === o.value}
                          onClick={() =>
                            setFilters((f) => ({ ...f, minRating: f.minRating === o.value ? null : o.value }))
                          }
                        >
                          {o.label}
                        </Chip>
                      ))}
                    </FilterGroup>

                    <FilterGroup label="Promoções">
                      <Chip
                        active={filters.onlyPromo}
                        onClick={() => setFilters((f) => ({ ...f, onlyPromo: !f.onlyPromo }))}
                      >
                        Só com promoção ou grátis
                      </Chip>
                    </FilterGroup>

                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="w-full rounded-xl py-1.5 text-[11px] font-semibold text-primary"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {!loading && !error && results.length > 0 && filtered.length === 0 && (
              <div className="rounded-2xl bg-muted px-4 py-4 text-center">
                <p className="text-sm font-semibold">Nenhuma sugestão passa pelos filtros</p>
                <p className="mt-1 text-xs text-muted-foreground">Ajuste ou limpe os filtros para ver mais opções.</p>
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Limpar filtros
                </button>
              </div>
            )}

            {!loading && !error && filtered.map((s) => <SuggestionCard key={`${s.type}-${s.id}`} s={s} onClose={onClose} />)}

            {!loading && (
              <button
                onClick={() => { setSubmitted(null); setError(null); setResults([]); setFilters(DEFAULT_FILTERS); }}
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

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition active:scale-95 ${
        active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function SuggestionCard({ s, onClose }: { s: GuiaSuggestion; onClose: () => void }) {
  const isPartner = s.id.startsWith("partner-");
  const badge = s.type === "event"
    ? (s.free ? <span className="flex-shrink-0 rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold text-accent">GRÁTIS</span> : null)
    : (s.hasPromo ? <span className="flex-shrink-0 rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold text-accent">PROMO</span> : null);

  const meta = s.type === "event" ? (
    <div className="mt-1.5 flex items-center gap-2 text-[11px]">
      {s.date && (
        <span className="flex items-center gap-1 font-semibold text-primary">
          <Calendar className="h-3 w-3" /> {s.date}
        </span>
      )}
      {s.venue && (
        <span className="flex items-center gap-1 truncate text-muted-foreground">
          <MapPin className="h-3 w-3" /> {s.venue}
        </span>
      )}
    </div>
  ) : (
    <div className="mt-1.5 flex items-center gap-2 text-[11px]">
      {s.rating !== null && (
        <span className="flex items-center gap-1 font-semibold text-foreground">
          <Star className="h-3 w-3 fill-primary text-primary" /> {s.rating}
        </span>
      )}
      {s.distanceKm !== null && (
        <span className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3 w-3" /> {String(s.distanceKm).replace(".", ",")} km
        </span>
      )}
      {s.priceLevel !== null && <span className="text-muted-foreground">· {"$".repeat(s.priceLevel)}</span>}
      {isPartner && (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Store className="h-3 w-3" /> Parceiro
        </span>
      )}
    </div>
  );

  const body = (
    <>
      <img src={s.image ?? FALLBACK_IMAGE} alt={s.name} className="h-20 w-20 flex-shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-bold">{s.name}</p>
          {badge}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{s.reason}</p>
        {meta}
      </div>
    </>
  );

  const cls = "flex gap-3 rounded-2xl border border-border bg-card p-2 transition active:scale-[0.99]";
  if (s.type === "place" && s.linkable) {
    return (
      <Link to="/place/$id" params={{ id: s.id }} onClick={onClose} className={cls}>
        {body}
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
}
