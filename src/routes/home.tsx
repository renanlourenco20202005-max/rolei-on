import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Sparkles, MapPin, Bell } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PlaceCard } from "@/components/PlaceCard";
import { GuiaRolei } from "@/components/GuiaRolei";
import { places, sections } from "@/lib/data";
import { usePrefs } from "@/lib/store";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Rolei — Início" }] }),
  component: Home,
});

const suggestions = [
  "Quero um lugar romântico",
  "Bar com happy hour",
  "Música ao vivo hoje",
  "Restaurante até R$150",
];

function Home() {
  const prefs = usePrefs();
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInitial, setAiInitial] = useState<string | undefined>();

  return (
    <AppShell>
      <header className="px-5 pb-4 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Vila Madalena · São Paulo
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-card">
            <Bell className="h-4.5 w-4.5 text-secondary" />
          </button>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight">
          O que fazer{" "}
          <span className="bg-gradient-hero bg-clip-text text-transparent">hoje?</span>
        </h1>
        {prefs.company && prefs.company.length > 0 && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            Selecionado pra um rolê em {prefs.company.map(c => c.toLowerCase()).join(" e ")}.
          </p>
        )}
      </header>

      <div className="px-5">
        <button
          onClick={() => { setAiInitial(undefined); setAiOpen(true); }}
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-left shadow-card transition active:scale-[0.99]"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-white">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Pergunte ao Guia Rolei</p>
            <p className="truncate text-[11px] text-muted-foreground">"Quero um lugar romântico até R$150"</p>
          </div>
          <Search className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => { setAiInitial(s); setAiOpen(true); }}
              className="flex-shrink-0 rounded-full bg-muted px-4 py-2 text-xs font-medium text-foreground transition active:scale-95"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 space-y-7 pt-4">
        {sections.map((sec) => {
          const items = places.filter(sec.filter);
          if (items.length === 0) return null;
          return (
            <section key={sec.id}>
              <div className="mb-3 flex items-center justify-between px-5">
                <h2 className="text-lg font-bold">{sec.title}</h2>
                <button
                  onClick={() => navigate({ to: "/search", search: { q: sec.title } as never })}
                  className="text-xs font-semibold text-primary"
                >
                  Ver tudo
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto px-5 pb-2 no-scrollbar">
                {items.map((p) => (
                  <PlaceCard key={p.id} place={p} />
                ))}
              </div>
            </section>
          );
        })}

        <section className="px-5">
          <div className="overflow-hidden rounded-3xl bg-secondary p-6 text-secondary-foreground">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Para você
            </div>
            <h3 className="mt-2 text-2xl font-bold leading-tight">
              Deixa o Guia Rolei montar seu rolê de hoje.
            </h3>
            <p className="mt-2 text-sm text-secondary-foreground/70">
              Conte com quem, o orçamento e o clima — a gente sugere bar, jantar e o que rolar depois.
            </p>
            <button
              onClick={() => { setAiInitial(undefined); setAiOpen(true); }}
              className="mt-4 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow active:scale-95"
            >
              Conversar com o Guia
            </button>
          </div>
        </section>

        <p className="px-5 pt-2 text-center text-[11px] text-muted-foreground">
          É parceiro Rolei? <Link to="/profile" className="font-semibold text-primary">Acesse a área parceiro</Link>
        </p>
      </div>

      <GuiaRolei open={aiOpen} onClose={() => setAiOpen(false)} initial={aiInitial} />
    </AppShell>
  );
}
