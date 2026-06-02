import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  ArrowLeft, BarChart3, Image as ImageIcon, Megaphone, CalendarPlus,
  Eye, MousePointerClick, MapPin, MessageCircle, Plus, Trash2, Upload, Save, Sparkles, Store,
} from "lucide-react";
import { usePartner, savePartner, fileToDataUrl, type PartnerPromo, type PartnerEvent } from "@/lib/partner";

export const Route = createFileRoute("/partner")({
  head: () => ({ meta: [{ title: "Painel parceiro — Rolei" }] }),
  component: PartnerPanel,
});

type Tab = "metrics" | "profile" | "photos" | "promos" | "events";

const TABS: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: "metrics", label: "Métricas", icon: BarChart3 },
  { id: "profile", label: "Perfil", icon: Store },
  { id: "photos", label: "Fotos", icon: ImageIcon },
  { id: "promos", label: "Promoções", icon: Megaphone },
  { id: "events", label: "Eventos", icon: CalendarPlus },
];

function PartnerPanel() {
  const partner = usePartner();
  const [tab, setTab] = useState<Tab>("metrics");

  return (
    <div className="app-shell shadow-card min-h-screen bg-background">
      <header className="bg-gradient-hero px-5 pb-6 pt-6 text-white">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur">
            Painel parceiro
          </span>
          <div className="w-9" />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <img src={partner.cover} alt="" className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white/40" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{partner.category}</p>
            <h1 className="truncate text-xl font-extrabold">{partner.name}</h1>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-10 -mt-1 overflow-x-auto border-b border-border bg-card/95 backdrop-blur">
        <ul className="flex min-w-max gap-1 px-3 py-2">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <li key={t.id}>
                <button
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
                    active ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <main className="px-5 py-5 pb-16">
        {tab === "metrics" && <MetricsTab />}
        {tab === "profile" && <ProfileTab />}
        {tab === "photos" && <PhotosTab />}
        {tab === "promos" && <PromosTab />}
        {tab === "events" && <EventsTab />}
      </main>
    </div>
  );
}

/* -------- Métricas -------- */
function MetricsTab() {
  const p = usePartner();
  const m = p.metrics;
  const max = Math.max(...m.history.map((h) => h.views));
  const stats = [
    { label: "Visualizações", value: m.views, icon: Eye, color: "bg-primary/10 text-primary" },
    { label: "Cliques no perfil", value: m.clicks, icon: MousePointerClick, color: "bg-secondary/10 text-secondary" },
    { label: "Rotas abertas", value: m.routes, icon: MapPin, color: "bg-accent text-accent-foreground" },
    { label: "Cliques WhatsApp", value: m.whatsapp, icon: MessageCircle, color: "bg-promo/15 text-promo" },
  ];
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-primary to-secondary p-5 text-primary-foreground shadow-glow">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-90">
          <Sparkles className="h-3.5 w-3.5" /> Últimos 7 dias
        </div>
        <p className="mt-1.5 text-4xl font-extrabold">{m.views.toLocaleString("pt-BR")}</p>
        <p className="text-xs opacity-80">visualizações no seu perfil</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card p-4 shadow-card">
            <div className={`grid h-9 w-9 place-items-center rounded-xl ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-extrabold">{s.value.toLocaleString("pt-BR")}</p>
            <p className="text-[11px] font-semibold text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-card p-5 shadow-card">
        <h3 className="text-sm font-bold">Desempenho diário</h3>
        <p className="text-xs text-muted-foreground">Visualizações vs cliques</p>
        <div className="mt-4 flex h-36 items-end gap-2">
          {m.history.map((h) => (
            <div key={h.date} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-full w-full items-end gap-0.5">
                <div className="flex-1 rounded-t bg-primary/80" style={{ height: `${(h.views / max) * 100}%` }} />
                <div className="flex-1 rounded-t bg-secondary/70" style={{ height: `${(h.clicks / max) * 100}%` }} />
              </div>
              <span className="text-[9px] font-semibold text-muted-foreground">{h.date}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-[10px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Views</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-secondary" /> Cliques</span>
        </div>
      </div>

      <div className="rounded-3xl bg-secondary p-5 text-secondary-foreground">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Plano Destaque</p>
        <h3 className="mt-1 text-lg font-extrabold">Apareça 3x mais nas buscas.</h3>
        <p className="mt-1 text-xs text-secondary-foreground/70">
          Conteúdo patrocinado, prioridade nas seções e badge de destaque.
        </p>
        <button className="mt-3 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground">
          Fazer upgrade
        </button>
      </div>
    </div>
  );
}

/* -------- Perfil -------- */
function ProfileTab() {
  const partner = usePartner();
  const [form, setForm] = useState(partner);
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm({ ...form, [k]: v });
  const submit = () => {
    savePartner(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };
  return (
    <div className="space-y-4">
      <Field label="Nome do estabelecimento" value={form.name} onChange={(v) => set("name", v)} />
      <Field label="Categoria" value={form.category} onChange={(v) => set("category", v)} />
      <Field label="Descrição" value={form.description} onChange={(v) => set("description", v)} textarea />
      <Field label="Endereço" value={form.address} onChange={(v) => set("address", v)} />
      <Field label="Horário" value={form.hours} onChange={(v) => set("hours", v)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => set("whatsapp", v)} />
        <Field label="Instagram" value={form.instagram} onChange={(v) => set("instagram", v)} />
      </div>
      <button
        onClick={submit}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow"
      >
        <Save className="h-4 w-4" /> {saved ? "Salvo!" : "Salvar alterações"}
      </button>
    </div>
  );
}

function Field({
  label, value, onChange, textarea,
}: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
      )}
    </label>
  );
}

/* -------- Fotos -------- */
function PhotosTab() {
  const partner = usePartner();
  const ref = useRef<HTMLInputElement>(null);
  const onUpload = async (files: FileList | null) => {
    if (!files) return;
    const urls = await Promise.all(Array.from(files).slice(0, 6).map(fileToDataUrl));
    savePartner({ ...partner, photos: [...urls, ...partner.photos].slice(0, 12) });
  };
  const remove = (i: number) =>
    savePartner({ ...partner, photos: partner.photos.filter((_, idx) => idx !== i) });
  const setCover = (src: string) => savePartner({ ...partner, cover: src });
  return (
    <div className="space-y-4">
      <button
        onClick={() => ref.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 py-10 text-primary"
      >
        <Upload className="h-6 w-6" />
        <span className="text-sm font-bold">Enviar novas fotos</span>
        <span className="text-[11px] text-muted-foreground">JPG ou PNG · até 6 por vez</span>
      </button>
      <input
        ref={ref} type="file" accept="image/*" multiple hidden
        onChange={(e) => onUpload(e.target.files)}
      />

      <div className="grid grid-cols-2 gap-3">
        {partner.photos.map((src, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl shadow-card">
            <img src={src} alt={`Foto ${i + 1}`} className="h-36 w-full object-cover" />
            {src === partner.cover && (
              <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                Capa
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex gap-1.5 bg-gradient-to-t from-black/70 to-transparent p-2">
              <button
                onClick={() => setCover(src)}
                className="flex-1 rounded-lg bg-white/90 py-1 text-[10px] font-bold text-secondary"
              >
                Definir capa
              </button>
              <button
                onClick={() => remove(i)}
                className="grid h-7 w-7 place-items-center rounded-lg bg-destructive/90 text-destructive-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------- Promoções -------- */
function PromosTab() {
  const partner = usePartner();
  const [draft, setDraft] = useState<PartnerPromo>({
    id: "", title: "", description: "", validUntil: "", active: true,
  });
  const add = () => {
    if (!draft.title.trim()) return;
    const promo = { ...draft, id: crypto.randomUUID() };
    savePartner({ ...partner, promos: [promo, ...partner.promos] });
    setDraft({ id: "", title: "", description: "", validUntil: "", active: true });
  };
  const toggle = (id: string) =>
    savePartner({
      ...partner,
      promos: partner.promos.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    });
  const remove = (id: string) =>
    savePartner({ ...partner, promos: partner.promos.filter((p) => p.id !== id) });
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-card p-4 shadow-card">
        <h3 className="text-sm font-bold">Nova promoção</h3>
        <div className="mt-3 space-y-3">
          <Field label="Título" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
          <Field label="Descrição" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} textarea />
          <Field label="Válido até" value={draft.validUntil} onChange={(v) => setDraft({ ...draft, validUntil: v })} />
          <button
            onClick={add}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-promo py-3 text-sm font-bold text-promo-foreground"
          >
            <Plus className="h-4 w-4" /> Publicar promoção
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Promoções ativas ({partner.promos.length})
        </h3>
        {partner.promos.map((p) => (
          <div key={p.id} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold">{p.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>
                {p.validUntil && (
                  <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                    Válido até {p.validUntil}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  p.active ? "bg-promo/15 text-promo" : "bg-muted text-muted-foreground"
                }`}
              >
                {p.active ? "Ativa" : "Pausada"}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => toggle(p.id)}
                className="flex-1 rounded-xl bg-muted py-2 text-xs font-bold"
              >
                {p.active ? "Pausar" : "Ativar"}
              </button>
              <button
                onClick={() => remove(p.id)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/10 text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {partner.promos.length === 0 && (
          <p className="rounded-2xl bg-muted py-6 text-center text-xs text-muted-foreground">
            Nenhuma promoção publicada.
          </p>
        )}
      </div>
    </div>
  );
}

/* -------- Eventos -------- */
function EventsTab() {
  const partner = usePartner();
  const [draft, setDraft] = useState<PartnerEvent>({
    id: "", title: "", date: "", free: true, price: "", description: "",
  });
  const add = () => {
    if (!draft.title.trim()) return;
    const ev = { ...draft, id: crypto.randomUUID() };
    savePartner({ ...partner, events: [ev, ...partner.events] });
    setDraft({ id: "", title: "", date: "", free: true, price: "", description: "" });
  };
  const remove = (id: string) =>
    savePartner({ ...partner, events: partner.events.filter((e) => e.id !== id) });

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-card p-4 shadow-card">
        <h3 className="text-sm font-bold">Criar evento</h3>
        <div className="mt-3 space-y-3">
          <Field label="Título" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
          <Field label="Data e hora" value={draft.date} onChange={(v) => setDraft({ ...draft, date: v })} />
          <Field label="Descrição" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} textarea />
          <div className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3">
            <label className="flex items-center gap-2 text-xs font-bold">
              <input
                type="checkbox"
                checked={draft.free}
                onChange={(e) => setDraft({ ...draft, free: e.target.checked, price: e.target.checked ? "" : draft.price })}
                className="h-4 w-4 accent-primary"
              />
              Evento gratuito
            </label>
            {!draft.free && (
              <input
                placeholder="R$ 40"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                className="flex-1 rounded-xl border border-border bg-card px-3 py-1.5 text-xs"
              />
            )}
          </div>
          <button
            onClick={add}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-glow"
          >
            <CalendarPlus className="h-4 w-4" /> Publicar evento
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Próximos eventos ({partner.events.length})
        </h3>
        {partner.events.map((e) => (
          <div key={e.id} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{e.date}</p>
                <p className="mt-1 text-sm font-bold">{e.title}</p>
                {e.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>
                )}
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                e.free ? "bg-promo/15 text-promo" : "bg-accent text-accent-foreground"
              }`}>
                {e.free ? "Grátis" : e.price}
              </span>
            </div>
            <button
              onClick={() => remove(e.id)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 py-2 text-xs font-bold text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remover
            </button>
          </div>
        ))}
        {partner.events.length === 0 && (
          <p className="rounded-2xl bg-muted py-6 text-center text-xs text-muted-foreground">
            Nenhum evento publicado.
          </p>
        )}
      </div>
    </div>
  );
}
