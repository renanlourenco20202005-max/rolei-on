import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calendar, MapPin, Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { events, type EventItem } from "@/lib/data";
import { useFavorites } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/events")({
  head: () => ({ meta: [{ title: "Eventos — Rolei" }] }),
  component: EventsPage,
});

const tabs = [
  { id: "todos", label: "Todos" },
  { id: "hoje", label: "Hoje" },
  { id: "amanha", label: "Amanhã" },
  { id: "fimDeSemana", label: "Fim de semana" },
  { id: "gratis", label: "Gratuito" },
  { id: "pago", label: "Pago" },
] as const;

function EventsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("todos");
  const { favs, toggle } = useFavorites();

  const list = useMemo(() => {
    return events.filter((e) => {
      if (tab === "todos") return true;
      if (tab === "gratis") return e.free;
      if (tab === "pago") return !e.free;
      return e.when === tab;
    });
  }, [tab]);

  return (
    <AppShell>
      <header className="px-5 pb-3 pt-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Agenda da cidade</p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight">Eventos perto de você</h1>
      </header>

      <div className="flex gap-2 overflow-x-auto px-5 pb-3 no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
              tab === t.id ? "bg-secondary text-secondary-foreground" : "bg-muted text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 px-5 pt-2">
        {list.map((e) => (
          <EventCard key={e.id} e={e} saved={favs.events.includes(e.id)} onToggle={() => toggle("events", e.id)} />
        ))}
        {list.length === 0 && (
          <div className="rounded-3xl bg-card p-8 text-center shadow-card">
            <p className="text-sm font-semibold">Sem eventos por aqui.</p>
            <p className="mt-1 text-xs text-muted-foreground">Volte mais tarde — novos rolês toda hora.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function EventCard({ e, saved, onToggle }: { e: EventItem; saved: boolean; onToggle: () => void }) {
  return (
    <article className="overflow-hidden rounded-3xl bg-card shadow-card">
      <div className="relative aspect-[16/10]">
        <img src={e.image} alt={e.title} loading="lazy" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-dark-overlay" />
        <div className="absolute left-3 top-3 flex gap-2">
          {e.sponsored && (
            <span className="rounded-full bg-secondary/85 px-2.5 py-1 text-[10px] font-bold uppercase text-secondary-foreground backdrop-blur">
              Patrocinado
            </span>
          )}
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase backdrop-blur ${e.free ? "bg-promo text-promo-foreground" : "bg-primary text-primary-foreground"}`}>
            {e.free ? "Grátis" : (e.price ?? "Pago")}
          </span>
        </div>
        <button
          onClick={onToggle}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/95 backdrop-blur"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
        </button>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-wider opacity-90">{e.category}</p>
          <h3 className="mt-0.5 text-lg font-bold leading-tight">{e.title}</h3>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-xs">
        <span className="flex items-center gap-1.5 font-semibold">
          <Calendar className="h-3.5 w-3.5 text-primary" /> {e.date}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {e.venue}
        </span>
      </div>
    </article>
  );
}
