import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Settings, Clock, Heart, Sparkles, Store, LogOut, Edit3 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { usePrefs, savePrefs } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Perfil — Rolei" }] }),
  component: Profile,
});

function Profile() {
  const prefs = usePrefs();
  const navigate = useNavigate();

  const reset = () => {
    savePrefs({ likes: [], onboarded: false });
    navigate({ to: "/" });
  };

  return (
    <AppShell>
      <header className="bg-gradient-hero px-5 pb-8 pt-10 text-white">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 text-2xl font-extrabold backdrop-blur">
            R
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Bem-vindo</p>
            <h1 className="truncate text-2xl font-extrabold">Visitante Rolei</h1>
          </div>
        </div>

        <button className="mt-5 flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur">
          <Edit3 className="h-3.5 w-3.5" /> Editar perfil
        </button>
      </header>

      <section className="-mt-5 px-5">
        <div className="rounded-3xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Suas preferências
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Companhia" value={prefs.company ?? "—"} />
            <Row label="Gosta de" value={prefs.likes.length ? prefs.likes.join(", ") : "—"} />
            <Row label="Orçamento" value={prefs.budget ?? "—"} />
          </dl>
          <Link
            to="/onboarding"
            className="mt-4 block w-full rounded-xl bg-muted py-2.5 text-center text-xs font-semibold text-foreground"
          >
            Refazer onboarding
          </Link>
        </div>
      </section>

      <section className="mt-5 px-5">
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">Atalhos</h2>
        <div className="overflow-hidden rounded-3xl bg-card shadow-card">
          <Item icon={Clock} label="Histórico de rolês" badge="12" />
          <Item icon={Heart} label="Salvos" to="/favorites" />
          <Item icon={Store} label="Sou parceiro Rolei" badge="Novo" highlight />
          <Item icon={Settings} label="Configurações" />
        </div>
      </section>

      <section className="mt-5 px-5">
        <div className="rounded-3xl bg-secondary p-5 text-secondary-foreground">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Painel parceiro</p>
          <h3 className="mt-1.5 text-xl font-bold leading-tight">Seu estabelecimento no Rolei.</h3>
          <p className="mt-2 text-xs text-secondary-foreground/70">
            Edite seu perfil, publique promoções, crie eventos e acompanhe visualizações, cliques no WhatsApp e abertura de rota.
          </p>
          <button className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-glow">
            Acessar painel
          </button>
        </div>
      </section>

      <section className="mt-5 px-5">
        <button
          onClick={reset}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-3.5 text-sm font-semibold text-destructive shadow-card"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </section>

      <p className="mt-6 px-5 text-center text-[11px] text-muted-foreground">Rolei v1.0 · feito para descobrir o que fazer hoje.</p>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function Item({
  icon: Icon, label, to, badge, highlight,
}: { icon: typeof Settings; label: string; to?: string; badge?: string; highlight?: boolean }) {
  const inner = (
    <div className={`flex items-center gap-3 px-4 py-3.5 transition active:bg-muted ${highlight ? "bg-accent/40" : ""}`}>
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${highlight ? "bg-primary text-primary-foreground" : "bg-muted text-secondary"}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <span className="flex-1 text-sm font-semibold">{label}</span>
      {badge && (
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${highlight ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
          {badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : <button className="block w-full text-left">{inner}</button>;
}
