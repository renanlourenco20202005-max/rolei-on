import { Link } from "@tanstack/react-router";
import { Star, MapPin, Heart } from "lucide-react";
import type { Place } from "@/lib/data";
import { useFavorites } from "@/lib/store";

export function PlaceCard({ place, size = "lg" }: { place: Place; size?: "lg" | "sm" }) {
  const { favs, toggle } = useFavorites();
  const saved = favs.places.includes(place.id);
  const wide = size === "lg";
  return (
    <Link
      to="/place/$id"
      params={{ id: place.id }}
      className={`group relative block flex-shrink-0 overflow-hidden rounded-3xl bg-card shadow-card ${
        wide ? "w-[78vw] max-w-[360px]" : "w-[60vw] max-w-[260px]"
      }`}
    >
      <div className={`relative ${wide ? "aspect-[4/5]" : "aspect-[4/5]"} overflow-hidden`}>
        <img
          src={place.image}
          alt={place.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-dark-overlay" />
        <div className="absolute left-3 top-3 flex gap-2">
          {place.sponsored && (
            <span className="rounded-full bg-secondary/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground backdrop-blur">
              Patrocinado
            </span>
          )}
          {place.promo && (
            <span className="rounded-full bg-promo px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-promo-foreground">
              Promo
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); toggle("places", place.id); }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90 backdrop-blur transition active:scale-90"
          aria-label="Salvar"
        >
          <Heart className={`h-4.5 w-4.5 ${saved ? "fill-primary text-primary" : "text-secondary"}`} />
        </button>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider opacity-90">
            <span>{place.category}</span>
            <span>·</span>
            <span>{place.price}</span>
          </div>
          <h3 className="mt-1 text-lg font-bold leading-tight">{place.name}</h3>
          <div className="mt-1.5 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="font-semibold">{place.rating}</span>
              <span className="opacity-70">({place.reviews})</span>
            </span>
            <span className="flex items-center gap-1 opacity-90">
              <MapPin className="h-3.5 w-3.5" />
              {place.distance}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
