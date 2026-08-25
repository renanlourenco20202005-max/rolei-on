import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, MapPin, Calendar, Trash2, Star } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { places, events } from "@/lib/data";
import { listHistory, clearHistory } from "@/lib/history.functions";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "Histórico de rolês — Rolei" }] }),
  component: HistoryPage,
});

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " · " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function HistoryPage() {
  const fetchHistory = useServerFn(listHistory);
  const clear = useServerFn(clearHistory);
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: () => fetchHistory(),
  });

  const clearMutation = useMutation({
    mutationFn: () => clear(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["history"] }),
  });

  const items = history
    .map((h) => {
      if (h.kind === "places") {
        const p = places.find((x) => x.id === h.itemId);
        return p ? { h, kind: "places" as const, id: p.id, title: p.name, sub: `${p.category} · ${p.price}`, image: p.image, rating: p.rating } : null;
      }
      const e = events.find((x) => x.id === h.itemId);
      return e ? { h, kind: "events" as const, id: e.id, title: e.title, sub: e.venue, image: e.image, date: e.date } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <AppShell>
      <header className="flex items-end justify-between px-5 pb-3 pt-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Sua trajetória</p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight">Histórico de rolês</h1>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending}
            className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-2 text-[11px] font-semibold text-muted-foreground"
            aria-label="Limpar histórico"
          >
            <Trash2 className="h-3.5 w-3.5" /> Limpar
          </button>
        )}
      </header>

      <div className="space-y-3 px-5 pt-2">
        {isLoading && (
          <div className="rounded-3xl bg-card p-8 text-center shadow-card">
            <p className="text-sm text-muted-foreground">Carregando…</p>
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="rounded-3xl bg-card p-10 text-center shadow-card">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-bold">Nenhum rolê por aqui ainda</p>
            <p className="mt-1 text-xs text-muted-foreground">Os lugares e eventos que você abrir aparecem nesta lista.</p>
            <Link to="/home" className="mt-4 inline-block rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-glow">
              Descobrir rolês
            </Link>
          </div>
        )}

        {items.map((item) => {
          const inner = (
            <>
              <img src={item.image} alt={item.title} loading="lazy" className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover" />
              <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-2">
                <p className="truncate text-sm font-bold">{item.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  {item.kind === "places" ? <MapPin className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                  <span className="truncate">{item.sub}</span>
                  {item.kind === "places" && item.rating != null && (
                    <span className="flex items-center gap-0.5 font-semibold text-foreground">
                      · <Star className="h-3 w-3 fill-primary text-primary" /> {item.rating}
                    </span>
                  )}
                </p>
                <p className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  <Clock className="h-3 w-3" /> Visto {formatDate(item.h.visitedAt)}
                </p>
              </div>
            </>
          );
          return item.kind === "places" ? (
            <Link key={`${item.h.kind}-${item.h.itemId}`} to="/place/$id" params={{ id: item.id }} className="flex gap-3 rounded-3xl bg-card p-2 shadow-card">
              {inner}
            </Link>
          ) : (
            <div key={`${item.h.kind}-${item.h.itemId}`} className="flex gap-3 rounded-3xl bg-card p-2 shadow-card">
              {inner}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
