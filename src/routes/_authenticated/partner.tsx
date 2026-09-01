import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft, BarChart3, Image as ImageIcon, Megaphone, CalendarPlus,
  Eye, MousePointerClick, MapPin, MessageCircle, Plus, Trash2, Upload, Save,
  Sparkles, Store, LogOut, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { images } from "@/lib/data";
import { getPartnerProfile, savePartnerProfile, type PartnerProfileInput } from "@/lib/partner.functions";

export const Route = createFileRoute("/_authenticated/partner")({
  head: () => ({ meta: [{ title: "Painel parceiro — Rolei" }] }),
  component: PartnerPanel,
  errorComponent: ({ error }) => (
    <div className="grid min-h-screen place-items-center px-6 text-center text-sm text-muted-foreground">
      Não foi possível carregar o painel: {error.message}
    </div>
  ),
});

type Tab = "metrics" | "profile" | "photos" | "promos" | "events";
const TABS: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: "metrics", label: "Métricas", icon: BarChart3 },
  { id: "profile", label: "Perfil", icon: Store },
  { id: "photos", label: "Fotos", icon: ImageIcon },
  { id: "promos", label: "Promoções", icon: Megaphone },
  { id: "events", label: "Eventos", icon: CalendarPlus },
];

interface Promo {
  id: string; title: string; description: string; validUntil: string; active: boolean;
}
interface EventItem {
  id: string; title: string; date: string; free: boolean; price: string; description: string;
}

function emptyProfile(): PartnerProfileInput {
  return {
    name: "", category: "Bar", description: "", address: "", hours: "",
    whatsapp: "", instagram: "", price: "$$", cover: "", photos: [], promos: [], events: [],
    latitude: null, longitude: null,
  };
}

function PartnerPanel() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getPartnerProfile);
  const saveProfile = useServerFn(savePartnerProfile);
  const [tab, setTab] = useState<Tab>("metrics");

  const { data: row, isLoading } = useQuery({
    queryKey: ["partner-profile"],
    queryFn: () => fetchProfile(),
  });

  const profile: PartnerProfileInput = row
    ? {
        name: row.name ?? "",
        category: row.category ?? "Bar",
        description: row.description ?? "",
        address: row.address ?? "",
        hours: row.hours ?? "",
        whatsapp: row.whatsapp ?? "",
        instagram: row.instagram ?? "",
        price: (row.price as PartnerProfileInput["price"]) ?? "$$",
        cover: row.cover ?? "",
        photos: (row.photos as string[]) ?? [],
        promos: (row.promos as unknown as Promo[]) ?? [],
        events: (row.events as unknown as EventItem[]) ?? [],
        latitude: row.latitude ?? null,
        longitude: row.longitude ?? null,
      }
    : emptyProfile();

  const mutation = useMutation({
    mutationFn: (next: PartnerProfileInput) => saveProfile({ data: next }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partner-profile"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao salvar"),
  });

  const save = (next: PartnerProfileInput) => mutation.mutate(next);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

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
          <button
            onClick={logout}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <img
            src={profile.cover || images.bar1}
            alt=""
            className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white/40"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{profile.category}</p>
            <h1 className="truncate text-xl font-extrabold">
              {profile.name || "Meu estabelecimento"}
            </h1>
            <p className={`mt-0.5 flex items-center gap-1 text-[10px] font-bold ${
              profile.latitude !== null ? "text-white/90" : "text-white/70"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${profile.latitude !== null ? "bg-green-400" : "bg-white/50"}`} />
              {profile.latitude !== null ? "Visível no app" : "Não publicado — defina a localização"}
            </p>
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
        {tab === "profile" && <ProfileTab profile={profile} onSave={save} saving={mutation.isPending} />}
        {tab === "photos" && <PhotosTab profile={profile} onSave={save} />}
        {tab === "promos" && <PromosTab profile={profile} onSave={save} />}
        {tab === "events" && <EventsTab profile={profile} onSave={save} />}
      </main>
    </div>
  );
}

/* -------- Métricas (mock, pronto p/ trocar por dados reais) -------- */
function MetricsTab() {
  const m = useMockMetrics();
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

function useMockMetrics() {
  const [m] = useState(() => {
    const today = new Date();
    const history = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        views: 180 + Math.round(Math.random() * 220),
        clicks: 40 + Math.round(Math.random() * 90),
      };
    });
    return {
      views: history.reduce((a, b) => a + b.views, 0),
      clicks: history.reduce((a, b) => a + b.clicks, 0),
      routes: 184,
      whatsapp: 97,
      history,
    };
  });
  return m;
}

/* -------- Perfil -------- */
function ProfileTab({
  profile, onSave, saving,
}: { profile: PartnerProfileInput; onSave: (p: PartnerProfileInput) => void; saving: boolean }) {
  const [form, setForm] = useState(profile);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  useEffect(() => setForm(profile), [profile]);
  const set = <K extends keyof PartnerProfileInput>(k: K, v: PartnerProfileInput[K]) =>
    setForm({ ...form, [k]: v });

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Seu navegador não suporta geolocalização.");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setLocating(false);
      },
      () => {
        setLocError("Não foi possível pegar sua localização. Verifique a permissão do navegador.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold">Localização do estabelecimento</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {form.latitude !== null
                ? `Capturada · ${form.latitude.toFixed(5)}, ${form.longitude!.toFixed(5)}`
                : "Sem localização — seu local não aparece no app até isso ser definido."}
            </p>
          </div>
        </div>
        <button
          onClick={captureLocation}
          disabled={locating}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary/10 py-3 text-sm font-bold text-primary disabled:opacity-60"
        >
          <MapPin className="h-4 w-4" />
          {locating ? "Localizando..." : form.latitude !== null ? "Atualizar localização atual" : "Usar minha localização atual"}
        </button>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Toque nesse botão estando fisicamente no estabelecimento, pra registrar o ponto certo no mapa.
        </p>
        {locError && <p className="mt-2 text-[11px] font-semibold text-destructive">{locError}</p>}
      </div>

      <Field label="Nome do estabelecimento" value={form.name} onChange={(v) => set("name", v)} />
      <Field label="Categoria" value={form.category} onChange={(v) => set("category", v)} />
      <Field label="Descrição" value={form.description} onChange={(v) => set("description", v)} textarea />
      <Field label="Endereço" value={form.address} onChange={(v) => set("address", v)} />
      <Field label="Horário" value={form.hours} onChange={(v) => set("hours", v)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => set("whatsapp", v)} />
        <Field label="Instagram" value={form.instagram} onChange={(v) => set("instagram", v)} />
      </div>
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Faixa de preço
        </span>
        <div className="grid grid-cols-4 gap-2">
          {(["$", "$$", "$$$", "$$$$"] as const).map((p) => (
            <button
              key={p}
              onClick={() => set("price", p)}
              className={`rounded-2xl py-2.5 text-sm font-bold ${
                form.price === p ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </label>
      <button
        onClick={() => { onSave(form); toast.success(form.latitude !== null ? "Perfil atualizado e publicado" : "Perfil salvo (defina a localização pra publicar)"); }}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Salvar alterações
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
          value={value} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
      ) : (
        <input
          value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
      )}
    </label>
  );
}

/* -------- Fotos -------- */
function PhotosTab({ profile, onSave }: { profile: PartnerProfileInput; onSave: (p: PartnerProfileInput) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const onUpload = async (files: FileList | null) => {
    if (!files) return;
    const urls = await Promise.all(
      Array.from(files).slice(0, 6).map(
        (f) => new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(String(r.result));
          r.onerror = rej;
          r.readAsDataURL(f);
        }),
      ),
    );
    const photos = [...urls, ...profile.photos].slice(0, 12);
    onSave({ ...profile, photos, cover: profile.cover || photos[0] || "" });
  };
  const remove = (i: number) => onSave({ ...profile, photos: profile.photos.filter((_, idx) => idx !== i) });
  const setCover = (src: string) => onSave({ ...profile, cover: src });
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
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => onUpload(e.target.files)} />
      <div className="grid grid-cols-2 gap-3">
        {profile.photos.map((src, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl shadow-card">
            <img src={src} alt={`Foto ${i + 1}`} className="h-36 w-full object-cover" />
            {src === profile.cover && (
              <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                Capa
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex gap-1.5 bg-gradient-to-t from-black/70 to-transparent p-2">
              <button onClick={() => setCover(src)} className="flex-1 rounded-lg bg-white/90 py-1 text-[10px] font-bold text-secondary">
                Definir capa
              </button>
              <button onClick={() => remove(i)} className="grid h-7 w-7 place-items-center rounded-lg bg-destructive/90 text-destructive-foreground">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {profile.photos.length === 0 && (
          <p className="col-span-2 rounded-2xl bg-muted py-6 text-center text-xs text-muted-foreground">
            Nenhuma foto adicionada.
          </p>
        )}
      </div>
    </div>
  );
}

/* -------- Promoções -------- */
function PromosTab({ profile, onSave }: { profile: PartnerProfileInput; onSave: (p: PartnerProfileInput) => void }) {
  const [draft, setDraft] = useState<Promo>({ id: "", title: "", description: "", validUntil: "", active: true });
  const add = () => {
    if (!draft.title.trim()) return;
    onSave({ ...profile, promos: [{ ...draft, id: crypto.randomUUID() }, ...profile.promos] });
    setDraft({ id: "", title: "", description: "", validUntil: "", active: true });
  };
  const toggle = (id: string) =>
    onSave({ ...profile, promos: profile.promos.map((p) => p.id === id ? { ...p, active: !p.active } : p) });
  const remove = (id: string) =>
    onSave({ ...profile, promos: profile.promos.filter((p) => p.id !== id) });
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-card p-4 shadow-card">
        <h3 className="text-sm font-bold">Nova promoção</h3>
        <div className="mt-3 space-y-3">
          <Field label="Título" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
          <Field label="Descrição" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} textarea />
          <Field label="Válido até" value={draft.validUntil} onChange={(v) => setDraft({ ...draft, validUntil: v })} />
          <button onClick={add} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-promo py-3 text-sm font-bold text-promo-foreground">
            <Plus className="h-4 w-4" /> Publicar promoção
          </button>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Promoções ativas ({profile.promos.length})
        </h3>
        {profile.promos.map((p) => (
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
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                p.active ? "bg-promo/15 text-promo" : "bg-muted text-muted-foreground"
              }`}>
                {p.active ? "Ativa" : "Pausada"}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => toggle(p.id)} className="flex-1 rounded-xl bg-muted py-2 text-xs font-bold">
                {p.active ? "Pausar" : "Ativar"}
              </button>
              <button onClick={() => remove(p.id)} className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {profile.promos.length === 0 && (
          <p className="rounded-2xl bg-muted py-6 text-center text-xs text-muted-foreground">Nenhuma promoção publicada.</p>
        )}
      </div>
    </div>
  );
}

/* -------- Eventos -------- */
function EventsTab({ profile, onSave }: { profile: PartnerProfileInput; onSave: (p: PartnerProfileInput) => void }) {
  const [draft, setDraft] = useState<EventItem>({ id: "", title: "", date: "", free: true, price: "", description: "" });
  const add = () => {
    if (!draft.title.trim()) return;
    onSave({ ...profile, events: [{ ...draft, id: crypto.randomUUID() }, ...profile.events] });
    setDraft({ id: "", title: "", date: "", free: true, price: "", description: "" });
  };
  const remove = (id: string) =>
    onSave({ ...profile, events: profile.events.filter((e) => e.id !== id) });
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
                type="checkbox" checked={draft.free}
                onChange={(e) => setDraft({ ...draft, free: e.target.checked, price: e.target.checked ? "" : draft.price })}
                className="h-4 w-4 accent-primary"
              />
              Evento gratuito
            </label>
            {!draft.free && (
              <input
                placeholder="R$ 40"
                value={draft.price ?? ""}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                className="flex-1 rounded-xl border border-border bg-card px-3 py-1.5 text-xs"
              />
            )}
          </div>
          <button onClick={add} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-glow">
            <CalendarPlus className="h-4 w-4" /> Publicar evento
          </button>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Próximos eventos ({profile.events.length})
        </h3>
        {profile.events.map((e) => (
          <div key={e.id} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{e.date}</p>
                <p className="mt-1 text-sm font-bold">{e.title}</p>
                {e.description && <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>}
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                e.free ? "bg-promo/15 text-promo" : "bg-accent text-accent-foreground"
              }`}>
                {e.free ? "Grátis" : e.price}
              </span>
            </div>
            <button onClick={() => remove(e.id)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 py-2 text-xs font-bold text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Remover
            </button>
          </div>
        ))}
        {profile.events.length === 0 && (
          <p className="rounded-2xl bg-muted py-6 text-center text-xs text-muted-foreground">Nenhum evento publicado.</p>
        )}
      </div>
    </div>
  );
}
