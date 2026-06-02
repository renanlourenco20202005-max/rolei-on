import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, SlidersHorizontal, Map as MapIcon, List, Search as SearchIcon, Star, MapPin, Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { places } from "@/lib/data";
import { useFavorites } from "@/lib/store";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  head: () => ({ meta: [{ title: "Explorar — Rolei" }] }),
  component: SearchPage,
});

const filters = ["Perto", "Promoções", "Música ao vivo", "Casais", "Happy Hour", "Café", "Gastronomia", "Festa"];

function SearchPage() {
  const navigate = useNavigate();
  const { q } = Route.useSearch();
  const [view, setView] = useState<"list" | "map">("list");
  const [query, setQuery] = useState(q);
  const [active, setActive] = useState<string[]>([]);
  const { favs, toggle } = useFavorites();

  const results = useMemo(() => {
    return places.filter((p) => {
      if (query) {
        const haystack = `${p.name} ${p.category} ${p.tags.join(" ")} ${p.vibes.join(" ")}`.toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
      }
      if (active.includes("Promoções") && !p.promo) return false;
      if (active.includes("Música ao vivo") && p.category !== "Música ao vivo") return false;
      if (active.includes("Casais") && !p.vibes.includes("romântico")) return false;
      if (active.includes("Happy Hour") && !p.vibes.includes("happy hour")) return false;
      if (active.includes("Café") && p.category !== "Café") return false;
      if (active.includes("Gastronomia") && !["Gastronomia", "Restaurante"].includes(p.category)) return false;
      if (active.includes("Festa") && p.category !== "Festa") return false;
      return true;
    });
  }, [query, active]);

  return (
    <AppShell>
      <header className="sticky top-0 z-20 bg-background/95 px-5 pb-3 pt-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: "/home" })} className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-card">
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5 shadow-card">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar bares, festas, comida…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-card">
            <SlidersHorizontal className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filters.map((f) => {
            const sel = active.includes(f);
            return (
              <button
                key={f}
                onClick={() => setActive((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]))}
                className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  sel ? "bg-secondary text-secondary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {results.length} {results.length === 1 ? "resultado" : "resultados"} próximos
          </p>
          <div className="flex rounded-full bg-muted p-1">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                view === "list" ? "bg-card text-foreground shadow-card" : "text-muted-foreground"
              }`}
            >
              <List className="h-3.5 w-3.5" /> Lista
            </button>
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                view === "map" ? "bg-card text-foreground shadow-card" : "text-muted-foreground"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" /> Mapa
            </button>
          </div>
        </div>
      </header>

      {view === "list" ? (
        <div className="space-y-3 px-5 pt-4">
          {results.map((p) => {
            const saved = favs.places.includes(p.id);
            return (
              <Link
                key={p.id}
                to="/place/$id"
                params={{ id: p.id }}
                className="relative flex gap-3 overflow-hidden rounded-3xl bg-card p-2 shadow-card transition active:scale-[0.99]"
              >
                <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                  {p.promo && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-promo px-2 py-0.5 text-[9px] font-bold uppercase text-promo-foreground">
                      Promo
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-base font-bold">{p.name}</h3>
                    <button
                      onClick={(e) => { e.preventDefault(); toggle("places", p.id); }}
                      className="-mr-1 -mt-1 grid h-8 w-8 flex-shrink-0 place-items-center rounded-full"
                    >
                      <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    </button>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{p.tags.join(" · ")}</p>
                  <div className="mt-2 flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 font-semibold">
                      <Star className="h-3 w-3 fill-primary text-primary" /> {p.rating}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {p.distance}
                    </span>
                    <span className="text-muted-foreground">· {p.price}</span>
                  </div>
                  <span className="mt-2 w-fit rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground">
                    {p.category}
                  </span>
                </div>
              </Link>
            );
          })}
          {results.length === 0 && (
            <div className="rounded-3xl bg-card p-8 text-center shadow-card">
              <p className="text-sm font-semibold">Nada encontrado por aqui.</p>
              <p className="mt-1 text-xs text-muted-foreground">Tente remover alguns filtros.</p>
            </div>
          )}
        </div>
      ) : (
        <MapView results={results} />
      )}
    </AppShell>
  );
}

function MapView({ results }: { results: typeof places }) {
  return (
    <div className="relative mx-5 mt-4 h-[520px] overflow-hidden rounded-3xl bg-muted shadow-card">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "linear-gradient(120deg, #e8efe9 0%, #f4f1ec 40%, #ecefe6 100%), repeating-linear-gradient(45deg, transparent 0 38px, rgba(0,0,0,0.04) 38px 39px), repeating-linear-gradient(-45deg, transparent 0 38px, rgba(0,0,0,0.04) 38px 39px)",
          backgroundBlendMode: "multiply",
        }}
      />
      {results.slice(0, 6).map((p, i) => {
        const left = 15 + ((i * 37) % 70);
        const top = 12 + ((i * 53) % 70);
        return (
          <Link
            key={p.id}
            to="/place/$id"
            params={{ id: p.id }}
            className="absolute -translate-x-1/2 -translate-y-full rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-glow"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            {p.price} · {p.rating}★
          </Link>
        );
      })}
      <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-card/95 p-3 text-xs shadow-card backdrop-blur">
        <p className="font-semibold">{results.length} lugares no mapa</p>
        <p className="text-muted-foreground">Toque em um pin para abrir o estabelecimento.</p>
      </div>
    </div>
  );
}
