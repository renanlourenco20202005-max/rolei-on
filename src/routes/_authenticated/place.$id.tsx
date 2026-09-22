import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Heart, Share2, Star, MapPin, Clock, Instagram, MessageCircle, Navigation, Calendar, Tag, X } from "lucide-react";
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

  const [routeOpen, setRouteOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("20:00");
  const [bookPeople, setBookPeople] = useState(2);
  const [bookName, setBookName] = useState("");

  useEffect(() => {
    recordVisit({ data: { kind: "places", itemId: place.id } }).catch(() => {});
  }, [place.id]);

  const phone = place.whatsapp.replace(/\D/g, "");
  const destination = `${placeRow.latitude},${placeRow.longitude}`;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=&travelmode=driving`;
  const wazeUrl = `https://waze.com/ul?ll=${destination}&navigate=yes`;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    `Olá, ${place.name}! Encontrei vocês no Rolei e queria saber mais sobre o rolê de hoje.`,
  )}`;

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: place.name,
      text: `${place.name} — ${place.category} em Curitiba. Achei no Rolei!`,
      url,
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
      toast.error("Não foi possível compartilhar agora.");
    }
  };

  const sendBooking = () => {
    if (!bookDate) {
      toast.error("Escolha a data da reserva.");
      return;
    }
    const prettyDate = new Date(`${bookDate}T00:00:00`).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    const text = `Olá, ${place.name}! Quero reservar uma mesa pelo Rolei.\n\n👤 Nome: ${bookName || "(a confirmar)"}\n📅 Data: ${prettyDate}\n🕗 Horário: ${bookTime}\n👥 Pessoas: ${bookPeople}\n\nTem disponibilidade?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    setBookOpen(false);
    toast.success("Pedido de reserva enviado no WhatsApp!");
  };

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
            <button
              onClick={handleShare}
              aria-label="Compartilhar lugar"
              className="grid h-10 w-10 place-items-center rounded-full bg-card/95 backdrop-blur shadow-card"
            >
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
          <button
            onClick={() => setRouteOpen(true)}
            aria-label="Como chegar"
            className="grid h-12 w-12 place-items-center rounded-2xl bg-muted active:scale-[0.98]"
          >
            <Navigation className="h-5 w-5" />
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-promo px-4 py-3 text-sm font-bold text-promo-foreground active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <button
            onClick={() => setBookOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow active:scale-[0.98]"
          >
            Reservar mesa
          </button>
        </div>
      </div>

      {routeOpen && (
        <Sheet title="Como chegar" onClose={() => setRouteOpen(false)}>
          <p className="text-xs text-muted-foreground">{place.address} · {place.distance} de você</p>
          <div className="mt-4 space-y-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setRouteOpen(false)}
              className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3 text-sm font-semibold active:scale-[0.99]"
            >
              <MapPin className="h-4.5 w-4.5 text-primary" /> Abrir no Google Maps
            </a>
            <a
              href={wazeUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setRouteOpen(false)}
              className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3 text-sm font-semibold active:scale-[0.99]"
            >
              <Navigation className="h-4.5 w-4.5 text-primary" /> Abrir no Waze
            </a>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(place.address);
                  toast.success("Endereço copiado!");
                } catch {
                  toast.error("Não foi possível copiar o endereço.");
                }
                setRouteOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-2xl bg-muted px-4 py-3 text-sm font-semibold active:scale-[0.99]"
            >
              <Tag className="h-4.5 w-4.5 text-primary" /> Copiar endereço
            </button>
          </div>
        </Sheet>
      )}

      {bookOpen && (
        <Sheet title="Reservar mesa" onClose={() => setBookOpen(false)}>
          <p className="text-xs text-muted-foreground">Enviamos seu pedido direto no WhatsApp de {place.name}.</p>
          <div className="mt-4 space-y-3">
            <Field label="Seu nome">
              <input
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
                placeholder="Como devemos chamar você?"
                className="w-full rounded-xl bg-muted px-3 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data">
                <input
                  type="date"
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  className="w-full rounded-xl bg-muted px-3 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2"
                />
              </Field>
              <Field label="Horário">
                <input
                  type="time"
                  value={bookTime}
                  onChange={(e) => setBookTime(e.target.value)}
                  className="w-full rounded-xl bg-muted px-3 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2"
                />
              </Field>
            </div>
            <Field label="Pessoas">
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setBookPeople(n)}
                    className={`h-9 min-w-9 rounded-xl px-3 text-sm font-semibold transition ${
                      bookPeople === n ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </Field>
            <button
              onClick={sendBooking}
              className="mt-1 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow active:scale-[0.98]"
            >
              Enviar pedido no WhatsApp
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-secondary/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[480px] rounded-t-3xl bg-card p-5 shadow-card"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-bold">{title}</h3>
          <button onClick={onClose} aria-label="Fechar" className="grid h-8 w-8 place-items-center rounded-full bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
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
