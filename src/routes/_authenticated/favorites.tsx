import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, MapPin, Calendar, Star } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { places, events } from "@/lib/data";
import { useFavorites } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/favorites")({
  head: () => ({ meta: [{ title: "Salvos — Rolei" }] }),
  component: Favorites,
});

function Favorites() {
  const { favs, toggle } = useFavorites();
  const [tab, setTab] = useState<"places" | "events">("places");

  const savedPlaces = places.filter((p) => favs.places.includes(p.id));
  const savedEvents = events.filter((e) => favs.events.includes(e.id));

  return (
    <AppShell>
      <header className="px-5 pb-3 pt-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Sua coleção</p>
        <h1 className="mt-1 text-3xl font-extrabold">Salvos</h1>
      </header>

      <div className="mx-5 flex rounded-full bg-muted p-1">
        <button
          onClick={() => setTab("places")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${tab === "places" ? "bg-card shadow-card text-foreground" : "text-muted-foreground"}`}
        >
          Locais ({savedPlaces.length})
        </button>
        <button
          onClick={() => setTab("events")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${tab === "events" ? "bg-card shadow-card text-foreground" : "text-muted-foreground"}`}
        >
          Eventos ({savedEvents.length})
        </button>
      </div>

      <div className="space-y-3 px-5 pt-5">
        {tab === "places" && (savedPlaces.length === 0 ? (
          <Empty title="Nenhum lugar salvo ainda" hint="Toque no coração nos cards para guardar aqui." />
        ) : savedPlaces.map((p) => (
          <Link key={p.id} to="/place/$id" params={{ id: p.id }} className="flex gap-3 rounded-3xl bg-card p-2 shadow-card">
            <img src={p.image} alt={p.name} loading="lazy" className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover" />
            <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-2">
              <p className="truncate text-base font-bold">{p.name}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{p.category} · {p.price}</p>
              <div className="mt-2 flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 font-semibold"><Star className="h-3 w-3 fill-primary text-primary" /> {p.rating}</span>
                <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> {p.distance}</span>
              </div>
            </div>
            <button onClick={(e) => { e.preventDefault(); toggle("places", p.id); }} className="grid h-9 w-9 flex-shrink-0 self-center place-items-center rounded-full">
              <Heart className="h-4 w-4 fill-primary text-primary" />
            </button>
          </Link>
        )))}

        {tab === "events" && (savedEvents.length === 0 ? (
          <Empty title="Nenhum evento salvo" hint="Salve eventos da aba Eventos para encontrá-los aqui." />
        ) : savedEvents.map((e) => (
          <div key={e.id} className="flex gap-3 rounded-3xl bg-card p-2 shadow-card">
            <img src={e.image} alt={e.title} loading="lazy" className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover" />
            <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-2">
              <p className="line-clamp-2 text-sm font-bold">{e.title}</p>
              <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-primary">
                <Calendar className="h-3 w-3" /> {e.date}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" /> {e.venue}
              </span>
            </div>
            <button onClick={() => toggle("events", e.id)} className="grid h-9 w-9 flex-shrink-0 self-center place-items-center rounded-full">
              <Heart className="h-4 w-4 fill-primary text-primary" />
            </button>
          </div>
        )))}
      </div>
    </AppShell>
  );
}

function Empty({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-3xl bg-card p-10 text-center shadow-card">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent">
        <Heart className="h-5 w-5 text-primary" />
      </div>
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
