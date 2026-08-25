import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  MapPin,
  Sparkles,
  TrendingUp,
  Store,
  Users,
  CreditCard,
  Rocket,
  ArrowDown,
  BarChart3,
  Target,
  HeartHandshake,
  Calendar,
  Star,
  CheckCircle2,
  Map,
  Globe2,
  Crown,
  Check,
  X,
  Minus,
} from "lucide-react";
import hero1 from "@/assets/happyhour-1.jpg";
import bar1 from "@/assets/bar-1.jpg";
import music1 from "@/assets/music-1.jpg";
import food1 from "@/assets/food-1.jpg";

export const Route = createFileRoute("/pitch")({
  head: () => ({
    meta: [
      { title: "Rolei — Apresentação para Investidores" },
      {
        name: "description",
        content:
          "Rolei é o app que responde 'o que fazer hoje?': descoberta de bares, restaurantes, eventos e experiências com IA. Começando por Curitiba, com expansão nacional e receita recorrente de parceiros.",
      },
      { property: "og:title", content: "Rolei — O que fazer hoje?" },
      {
        property: "og:description",
        content:
          "Descoberta de experiências com IA, lançamento em Curitiba, expansão nacional e monetização via planos para parceiros e eventos patrocinados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PitchPage,
});

/* ---------- scroll reveal ---------- */
function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
      <span className="h-px w-6 bg-primary" />
      {children}
    </p>
  );
}

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    suffix: null as string | null,
    desc: "Presença básica no app",
    features: [
      "Perfil do estabelecimento",
      "Aparece nas buscas",
      "1 foto de capa",
      "Métricas básicas de views",
    ],
    highlight: false,
    tag: null as string | null,
  },
  {
    name: "Destaque",
    price: "R$ 199",
    suffix: "/mês",
    desc: "Visibilidade e conversão",
    features: [
      "Destaque nas seções da home",
      "Promoções ilimitadas",
      "Métricas de views e cliques",
      "Prioridade no Guia Rolei",
    ],
    highlight: true,
    tag: "Carro-chefe",
  },
  {
    name: "Premium",
    price: "R$ 399",
    suffix: "/mês",
    desc: "Domínio de categoria e bairro",
    features: [
      "Tudo do plano Destaque",
      "Topo da categoria e do bairro",
      "Destaque prioritário no Guia IA",
      "Relatórios avançados e exportação",
      "Selo Premium verificado",
    ],
    highlight: false,
    tag: "Maior margem",
  },
  {
    name: "Eventos Patrocinados",
    price: "R$ 49",
    suffix: "/evento",
    desc: "Empurrão pontual",
    features: [
      "Topo da tela de eventos",
      "Selo 'Patrocinado'",
      "Alcance segmentado por bairro",
    ],
    highlight: false,
    tag: null,
  },
];

const revenueRows = [
  {
    year: "Ano 1",
    coverage: "Curitiba",
    partners: "300",
    events: "120",
    mrr: "R$ 84 mil",
    arr: "R$ 720 mil",
  },
  {
    year: "Ano 2",
    coverage: "6 cidades (Sul + SP)",
    partners: "1.100",
    events: "450",
    mrr: "R$ 307 mil",
    arr: "R$ 3,2 mi",
  },
  {
    year: "Ano 3",
    coverage: "15 cidades (nacional)",
    partners: "3.200",
    events: "1.300",
    mrr: "R$ 893 mil",
    arr: "R$ 9,5 mi",
  },
];

const funnel = [
  { label: "Indicação e prospecção ativa bairro a bairro", icon: Target },
  { label: "Cadastro gratuito em 5 minutos pelo painel parceiro", icon: Store },
  { label: "Onboarding com fotos, promoção de lançamento e métricas", icon: BarChart3 },
  { label: "Upgrade para Destaque/Premium ao ver ROI no painel", icon: TrendingUp },
];

const roadmap = [
  {
    icon: MapPin,
    phase: "Fase 1 · 2026",
    title: "Curitiba",
    desc: "Provar retenção e ROI do parceiro em Batel, Água Verde e Centro. Custo de aquisição baixo, cena gastronômica forte e público early-adopter.",
    goal: "Meta: 300 parceiros pagantes",
  },
  {
    icon: Map,
    phase: "Fase 2 · 2027",
    title: "Sul + São Paulo",
    desc: "Florianópolis, Porto Alegre, São Paulo e Campinas com o playbook validado em Curitiba, replicado cidade a cidade.",
    goal: "Meta: 1.100 parceiros pagantes",
  },
  {
    icon: Globe2,
    phase: "Fase 3 · 2028",
    title: "Nacional",
    desc: "Rio, BH, Brasília, Salvador, Recife e Fortaleza. Marca consolidada como a resposta padrão para 'o que fazer hoje?'.",
    goal: "Meta: 3.200 parceiros pagantes",
  },
];

type Mark = "yes" | "no" | "partial";
const comparison: { label: string; values: [Mark, Mark, Mark, Mark] }[] = [
  { label: "Responde “o que fazer hoje?”", values: ["yes", "no", "no", "no"] },
  { label: "Recomendação por vibe com IA", values: ["yes", "no", "no", "no"] },
  { label: "Eventos do dia hiperlocal", values: ["yes", "partial", "partial", "no"] },
  { label: "Canal de aquisição mensurável p/ parceiro", values: ["yes", "no", "no", "partial"] },
  { label: "Foco em experiência, não em delivery", values: ["yes", "no", "no", "no"] },
];
const competitors = ["Rolei", "Google", "Instagram", "iFood"];

function MarkIcon({ mark }: { mark: Mark }) {
  if (mark === "yes")
    return (
      <span className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-promo/15 text-promo">
        <Check className="h-4 w-4" />
      </span>
    );
  if (mark === "partial")
    return (
      <span className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-secondary-foreground/10 text-secondary-foreground/70">
        <Minus className="h-4 w-4" />
      </span>
    );
  return (
    <span className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-secondary-foreground/5 text-secondary-foreground/40">
      <X className="h-4 w-4" />
    </span>
  );
}

function PitchPage() {
  return (
    <div className="bg-background text-foreground">
      {/* HERO */}
      <section className="relative flex min-h-[100dvh] flex-col justify-between overflow-hidden bg-secondary text-secondary-foreground">
        <img src={hero1} alt="Rooftop movimentado ao pôr do sol" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-secondary/40 to-secondary" />
        <div className="relative mx-auto w-full max-w-4xl px-6 pt-10">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-hero text-white font-extrabold text-lg shadow-glow">R</div>
            <span className="text-lg font-extrabold tracking-tight">Rolei</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-4xl px-6 pb-16">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">Apresentação comercial · 2026</p>
            <h1 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              O que fazer <span className="bg-gradient-hero bg-clip-text text-transparent">hoje?</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-secondary-foreground/80">
              O Rolei responde a pergunta que milhões de pessoas fazem toda semana — e conecta
              quem quer sair a quem quer encher a casa. Lançamento em Curitiba, expansão nacional.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#problema" className="rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition active:scale-95">
                Ver a oportunidade
              </a>
              <a href="#modelo" className="rounded-xl border border-secondary-foreground/25 px-6 py-3.5 text-sm font-bold transition hover:bg-secondary-foreground/10">
                Modelo de negócio
              </a>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-14 flex justify-center">
              <ArrowDown className="h-5 w-5 animate-bounce text-secondary-foreground/50" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROBLEMA */}
      <section id="problema" className="mx-auto max-w-4xl px-6 py-24">
        <Reveal>
          <Kicker>O problema</Kicker>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
            Descobrir um rolê bom hoje é trabalhoso demais.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: MapPin, t: "Busca fragmentada", d: "Google, Instagram e grupos de WhatsApp — nenhum responde 'o que fazer hoje' de verdade." },
            { icon: Users, t: "Decisão em grupo", d: "Casal, amigos, sozinho: cada rolê tem um clima, e as ferramentas atuais ignoram isso." },
            { icon: Store, t: "Casas vazias", d: "Bares e eventos não têm canal direto, mensurável e barato para atrair público no dia." },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 120}>
              <div className="h-full rounded-3xl bg-card p-6 shadow-card">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="bg-secondary py-24 text-secondary-foreground">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <Kicker>A solução</Kicker>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
              Um app que recomenda <span className="bg-gradient-hero bg-clip-text text-transparent">experiências</span>, não estabelecimentos.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <Reveal>
              <div className="space-y-4">
                {[
                  { icon: Sparkles, t: "Guia Rolei (IA)", d: "O usuário diz 'quero um lugar romântico com vinho até R$150' e recebe um roteiro pronto: bar, jantar e o que rolar depois." },
                  { icon: Calendar, t: "Eventos do dia", d: "Hoje, amanhã e fim de semana — com filtros de gratuidade, preço e distância." },
                  { icon: Star, t: "Curadoria por vibe", d: "Em alta, happy hour, música ao vivo, para casais: seções pensadas por momento, não por categoria fria." },
                  { icon: MapPin, t: "Hiperlocal", d: "Foco em bairro e distância real a pé ou de carro curto — onde o rolê realmente acontece." },
                ].map((f) => (
                  <div key={f.t} className="flex gap-4 rounded-2xl bg-secondary-foreground/5 p-5">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-hero text-white">
                      <f.icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="font-bold">{f.t}</h3>
                      <p className="mt-1 text-sm text-secondary-foreground/70">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="grid grid-cols-2 gap-3">
                <img src={bar1} alt="Bar com coquetelaria autoral" className="h-48 w-full rounded-3xl object-cover" />
                <img src={music1} alt="Show de música ao vivo" className="mt-8 h-48 w-full rounded-3xl object-cover" />
                <img src={food1} alt="Prato de gastronomia artesanal" className="-mt-4 h-48 w-full rounded-3xl object-cover" />
                <div className="mt-4 flex h-48 flex-col justify-center rounded-3xl bg-gradient-hero p-6 text-white shadow-glow">
                  <p className="text-4xl font-extrabold">7</p>
                  <p className="mt-1 text-sm font-semibold text-white/90">categorias de experiência em um só lugar</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* MERCADO */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <Reveal>
          <Kicker>Mercado</Kicker>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
            Experiências fora de casa são um mercado gigante e sem dono.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { v: "R$ 500+ bi", l: "movimentados por ano pelo food service fora do lar no Brasil" },
            { v: "70%", l: "das decisões de saída acontecem no mesmo dia" },
            { v: "12 mil+", l: "bares, restaurantes e casas de evento na região metropolitana de Curitiba" },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 120}>
              <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-card">
                <p className="bg-gradient-hero bg-clip-text text-4xl font-extrabold text-transparent">{s.v}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.l}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* TAM / SAM / SOM */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { k: "TAM", v: "R$ 500 bi", d: "Food service fora do lar no Brasil — o guarda-chuva inteiro do mercado." },
            { k: "SAM", v: "R$ 4,2 bi", d: "Marketing e visibilidade digital de bares, restaurantes e eventos nas 15 capitais-alvo." },
            { k: "SOM", v: "R$ 9,5 mi", d: "Receita no Ano 3 com 3.200 parceiros pagantes — menos de 0,3% do SAM." },
          ].map((s, i) => (
            <Reveal key={s.k} delay={i * 120}>
              <div className="h-full rounded-3xl bg-card p-6 shadow-card">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{s.k}</p>
                <p className="mt-2 text-3xl font-extrabold">{s.v}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <p className="mt-8 rounded-2xl bg-accent p-5 text-sm leading-relaxed text-accent-foreground">
            <strong>Praia inicial:</strong> Curitiba — Batel, Água Verde e Centro. Capital com 3,2 mi
            de pessoas na região metropolitana, uma das cenas gastronômicas mais fortes do país e
            custo de aquisição muito menor que São Paulo. O playbook validado aqui é replicado
            bairro a bairro, cidade a cidade.
          </p>
        </Reveal>
      </section>

      {/* MODELO DE RECEITA */}
      <section id="modelo" className="bg-secondary py-24 text-secondary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <Kicker>Como ganhamos dinheiro</Kicker>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
              Receita recorrente do lado do parceiro. Grátis para o usuário, sempre.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((p, i) => (
              <Reveal key={p.name} delay={i * 120}>
                <div
                  className={`flex h-full flex-col rounded-3xl p-6 ${
                    p.highlight
                      ? "bg-gradient-hero text-white shadow-glow"
                      : "bg-secondary-foreground/5"
                  }`}
                >
                  {p.tag && (
                    <span
                      className={`mb-3 flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        p.highlight ? "bg-white/20" : "bg-promo/15 text-promo"
                      }`}
                    >
                      {!p.highlight && <Crown className="h-3 w-3" />}
                      {p.tag}
                    </span>
                  )}
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <p className="mt-1 whitespace-nowrap text-3xl font-extrabold">
                    {p.price}
                    {p.suffix && <span className="text-base font-bold opacity-70">{p.suffix}</span>}
                  </p>
                  <p className={`mt-1 text-xs ${p.highlight ? "text-white/80" : "text-secondary-foreground/60"}`}>{p.desc}</p>
                  <ul className="mt-5 space-y-2.5 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${p.highlight ? "text-white" : "text-promo"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <p className="mt-8 text-sm text-secondary-foreground/70">
              Receitas futuras: comissão em reservas e ingressos, plano Enterprise para redes e
              franquias, destaque no Guia Rolei e dados de tendência de consumo para marcas
              (sempre anonimizados).
            </p>
          </Reveal>
        </div>
      </section>

      {/* COMO VENDEMOS */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <Reveal>
          <Kicker>Como vendemos</Kicker>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
            Máquina de aquisição de parceiros, bairro a bairro.
          </h2>
        </Reveal>
        <div className="mt-10 space-y-4">
          {funnel.map((f, i) => (
            <Reveal key={f.label} delay={i * 100}>
              <div className="flex items-center gap-4 rounded-2xl bg-card p-5 shadow-card">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary font-extrabold">
                  {i + 1}
                </div>
                <f.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                <p className="text-sm font-semibold">{f.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-card p-6 shadow-card">
              <HeartHandshake className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-bold">Venda consultiva</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                O parceiro vê no próprio painel quantas pessoas viram o perfil e clicaram —
                a renovação se vende sozinha com dados.
              </p>
            </div>
            <div className="rounded-3xl bg-card p-6 shadow-card">
              <CreditCard className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-bold">Self-service</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Cadastro, fotos, promoções e eventos criados pelo próprio estabelecimento,
                sem depender de equipe comercial para operar.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* PROJEÇÃO */}
      <section className="bg-secondary py-24 text-secondary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <Kicker>Projeção de faturamento</Kicker>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
              De Curitiba para o Brasil: R$ 9,5 mi de receita no Ano 3.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-secondary-foreground/70">
              Cenário conservador, considerando apenas planos mensais (mix Destaque + Premium) e
              eventos patrocinados — sem comissões em reservas, ingressos ou receita de dados.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <div className="mt-10 overflow-x-auto rounded-3xl bg-secondary-foreground/5">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-secondary-foreground/10 text-[11px] uppercase tracking-widest text-secondary-foreground/60">
                    <th className="px-5 py-4 font-bold">Período</th>
                    <th className="px-5 py-4 font-bold">Cobertura</th>
                    <th className="px-5 py-4 font-bold">Parceiros pagantes</th>
                    <th className="px-5 py-4 font-bold">Eventos patroc./mês</th>
                    <th className="px-5 py-4 font-bold">MRR</th>
                    <th className="px-5 py-4 font-bold">Receita anual</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueRows.map((r) => (
                    <tr key={r.year} className="border-b border-secondary-foreground/5 last:border-0">
                      <td className="px-5 py-4 font-bold">{r.year}</td>
                      <td className="px-5 py-4">{r.coverage}</td>
                      <td className="px-5 py-4">{r.partners}</td>
                      <td className="px-5 py-4">{r.events}</td>
                      <td className="px-5 py-4 font-bold text-promo">{r.mrr}</td>
                      <td className="px-5 py-4 font-extrabold text-primary">{r.arr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <Reveal delay={250}>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { v: "R$ 259", l: "ticket médio mensal (mix de 70% Destaque + 30% Premium)" },
                { v: "~5%", l: "conversão estimada de cadastros gratuitos para pagantes" },
                { v: "SaaS B2B2C", l: "margem alta: o custo marginal por parceiro tende a zero" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-secondary-foreground/5 p-5">
                  <p className="text-2xl font-extrabold text-promo">{s.v}</p>
                  <p className="mt-1 text-xs text-secondary-foreground/70">{s.l}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[11px] text-secondary-foreground/50">
              * Projeções ilustrativas baseadas em premissas de penetração nos bairros-alvo de
              Curitiba e nas cidades do roadmap. Não incluem receitas de comissão em
              reservas/ingressos, plano Enterprise nem dados de tendência.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ROADMAP DE EXPANSÃO */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <Reveal>
          <Kicker>Roadmap de expansão</Kicker>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
            Um playbook, quinze cidades.
          </h2>
        </Reveal>
        <div className="mt-10 space-y-4">
          {roadmap.map((r, i) => (
            <Reveal key={r.phase} delay={i * 120}>
              <div className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-card sm:flex-row sm:items-center sm:gap-6">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-hero text-white shadow-glow">
                  <r.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{r.phase}</p>
                  <h3 className="mt-1 text-lg font-extrabold">{r.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
                </div>
                <span className="w-fit shrink-0 rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-foreground">
                  {r.goal}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CONCORRÊNCIA */}
      <section className="bg-secondary py-24 text-secondary-foreground">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <Kicker>Cenário competitivo</Kicker>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
              Ninguém responde “o que fazer hoje?”. Nós sim.
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <div className="mt-10 overflow-x-auto rounded-3xl bg-secondary-foreground/5">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-secondary-foreground/10 text-[11px] uppercase tracking-widest text-secondary-foreground/60">
                    <th className="px-5 py-4 text-left font-bold">Capacidade</th>
                    {competitors.map((c) => (
                      <th
                        key={c}
                        className={`px-4 py-4 text-center font-bold ${c === "Rolei" ? "text-primary" : ""}`}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.label} className="border-b border-secondary-foreground/5 last:border-0">
                      <td className="px-5 py-4 font-semibold">{row.label}</td>
                      {row.values.map((v, i) => (
                        <td key={i} className="px-4 py-4 text-center">
                          <MarkIcon mark={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <Reveal delay={250}>
            <p className="mt-6 text-sm text-secondary-foreground/70">
              Google lista endereços, Instagram mostra o que já é hype e iFood entrega em casa.
              O Rolei ocupa o espaço vazio entre os três: a decisão de sair, no dia, com IA.
            </p>
          </Reveal>
        </div>
      </section>

      {/* DIFERENCIAIS + CTA */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <Reveal>
          <Kicker>Por que agora</Kicker>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
            Produto pronto, IA embarcada e monetização desenhada desde o dia um.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            { icon: Rocket, t: "App funcional", d: "Home, busca, eventos, favoritos, perfil, painel do parceiro e autenticação já implementados." },
            { icon: Sparkles, t: "IA nativa", d: "Guia Rolei com linguagem natural conectado ao catálogo real — diferencial que nenhum concorrente local tem." },
            { icon: BarChart3, t: "Métricas para o parceiro", d: "Painel com visualizações e cliques: prova de ROI que sustenta retenção e upsell." },
            { icon: Target, t: "Tese de sociedade", d: "Buscamos um sócio para acelerar aquisição de parceiros e a expansão a partir de Curitiba." },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 100}>
              <div className="h-full rounded-3xl bg-card p-6 shadow-card">
                <c.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-bold">{c.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-hero p-8 text-center text-white shadow-glow sm:p-12">
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              Vamos encher os rolês do Brasil juntos?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/85">
              O produto está no ar, Curitiba é a praia e a oportunidade é de quem chega primeiro.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-xl bg-white px-8 py-3.5 text-sm font-extrabold text-primary transition active:scale-95"
            >
              Ver o app funcionando
            </Link>
          </div>
        </Reveal>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Rolei · Apresentação comercial · Material confidencial para fins de sociedade
        </p>
      </section>
    </div>
  );
}
