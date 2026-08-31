import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, Heart, Share2, Star, MapPin, Clock, Instagram, MessageCircle, Navigation, Calendar, Tag } from "lucide-react";
import { useFavorites } from "@/lib/store";
import { recordVisit } from "@/lib/history.functions";
import { RouteErrorFallback, RouteNotFoundFallback } from "@/components/RouteFallbacks";
import { supabase } from "@/integrations/supabase/client";
import { mapPlace, useUserLocation, type PlaceRow } from "@/lib/places-queries";

export const Route = createFileRoute("/_authenticated/place/$id")({
  loader: async ({ params }) => {
    const { data, error } = await supabase.from("places").select("*").eq("id", params.id).single();
    if (error || !data) throw notFound();
    return { placeRow: data as unknown as PlaceRow };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.placeRow.name ?? "Estabelecimento"} — Rolei` },
      { name: "description", content: loaderData?.placeRow.description ?? "" },
    ],
  }),
  errorComponent: ({ error, reset }) => <RouteErrorFallback error={error} reset={reset} />,
  notFoundComponent: RouteNotFoundFallback,
  component: PlaceDetail,
});

const reviews = [
  { name: "Marina C.", rating: 5, text: "Atendimento impecável e drinks autorais incríveis. Voltarei!" },
  { name: "Pedro L.", rating: 5, text: "Lugar perfeito pra um date. Música baixa e iluminação certa." },
  { name: "Ana R.", rating: 4, text: "Adorei a vibe, só achei a espera um pouco longa em dia de show." },
];

function PlaceDetail() {
  const { placeRow } = Route.useLoaderData();
  const { latitude, longitude } = useUserLocation();
  const place = mapPlace(placeRow, latitude, longitude);
  const navigate = useNavigate();
  const { favs, toggle } = useFavorites();
  const saved = favs.places.includes(place.id);

  useEffect(() => {
    recordVisit({ data: { kind: "places", itemId: place.id } }).catch(() => {});
  }, [place.id]);

  return (
    <div className="app-shell pb-32">
      <div className="relative">
        <img src={place.image} alt={place.name} className="h-[55vh] max-h-[460px] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-transparent to-secondary/80" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-6">
          <button onClick={() => navigate({ to: "/home" })} className="grid h-10 w-10 place-items-center rounded-full bg-card/95 backdrop-blur shadow-card">
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div className="flex gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-full bg-card/95 backdrop-blur shadow-card">
              <Share2 className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => toggle("places", place.id)}
              className="grid h-10 w-10 place-items-center rounded-full bg-card/95 backdrop-blur shadow-card"
            >
              <Heart className={`h-4.5 w-4.5 ${saved ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-card/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur">
              {place.category}
            </span>
            <span className="rounded-full bg-card/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">{place.price}</span>
            {place.promo && (
              <span className="rounded-full bg-promo px-2.5 py-1 text-[11px] font-semibold uppercase text-promo-foreground">
                Promo
              </span>
            )}
          </div>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight">{place.name}</h1>
          <div className="mt-1.5 flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold">{place.rating}</span>
              <span className="opacity-80">({place.reviews})</span>
            </span>
            <span className="flex items-center gap-1 opacity-90">
              <MapPin className="h-4 w-4" /> {place.distance}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 pt-5">
        {place.promo && (
          <div className="flex items-start gap-3 rounded-2xl bg-promo/10 p-4 ring-1 ring-promo/30">
            <Tag className="mt-0.5 h-5 w-5 text-promo" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-promo">Promoção ativa</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{place.promo}</p>
            </div>
          </div>
        )}

        <section>
          <h2 className="mb-2 text-base font-bold">Sobre o lugar</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{place.description}</p>
        </section>

        <section className="space-y-3">
          <InfoRow icon={Clock} label="Horário" value={place.hours} />
          <InfoRow icon={MapPin} label="Endereço" value={place.address} />
          <InfoRow icon={MessageCircle} label="WhatsApp" value={place.whatsapp} />
          <InfoRow icon={Instagram} label="Instagram" value={place.instagram} />
        </section>

        <section>
          <h2 className="mb-3 text-base font-bold">Cardápio em destaque</h2>
          <div className="grid grid-cols-2 gap-2">
            {["Drink autoral · R$ 38", "Tábua de petiscos · R$ 62", "Vinho da casa · R$ 45", "Sobremesa · R$ 28"].map((item) => (
              <div key={item} className="rounded-2xl bg-card p-3 text-xs shadow-card">{item}</div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
            <Calendar className="h-4 w-4 text-primary" /> Próximos eventos
          </h2>
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <p className="text-sm font-bold">Quinta acústica · com Lia Faria</p>
            <p className="mt-1 text-xs text-muted-foreground">Quinta · 21h · entrada R$ 30</p>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold">Avaliações</h2>
            <span className="flex items-center gap-1 text-xs font-semibold">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {place.rating} · {place.reviews}
            </span>
          </div>
          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.name} className="rounded-2xl bg-card p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{r.name}</p>
                  <div className="flex">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{r.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div
        className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-border bg-card/95 p-3 backdrop-blur"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      >
        <div className="flex gap-2">
          <button className="grid h-12 w-12 place-items-center rounded-2xl bg-muted">
            <Navigation className="h-5 w-5" />
          </button>
          <a
            href={`https://wa.me/${place.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-promo px-4 py-3 text-sm font-bold text-promo-foreground active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow active:scale-[0.98]">
            Reservar mesa
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-card p-3 shadow-card">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-muted">
        <Icon className="h-4 w-4 text-secondary" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
