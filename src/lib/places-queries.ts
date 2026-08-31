import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Place, EventItem } from "@/lib/data";

// Centro de Vila Madalena — usado como fallback enquanto a geolocalização
// do navegador não responde ou é negada pelo usuário.
const FALLBACK_COORDS = { latitude: -23.5558, longitude: -46.6896 };

export function useUserLocation() {
  const [coords, setCoords] = useState(FALLBACK_COORDS);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setCoords(FALLBACK_COORDS),
      { timeout: 5000 }
    );
  }, []);

  return coords;
}

// Distância em km entre dois pontos (fórmula de Haversine)
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace(".", ",")} km`;
}

export interface PlaceRow {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  latitude: number;
  longitude: number;
  address: string;
  hours: string;
  whatsapp: string;
  instagram: string;
  price: string;
  rating: number;
  reviews_count: number;
  tags: string[];
  vibes: string[];
  promo_text: string | null;
  is_sponsored: boolean;
}

export function mapPlace(row: PlaceRow, userLat: number, userLon: number): Place {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Category,
    image: row.image_url,
    distance: formatDistance(distanceKm(userLat, userLon, row.latitude, row.longitude)),
    rating: row.rating,
    reviews: row.reviews_count,
    price: row.price as Place["price"],
    tags: row.tags ?? [],
    description: row.description,
    address: row.address,
    hours: row.hours,
    whatsapp: row.whatsapp,
    instagram: row.instagram,
    promo: row.promo_text ?? undefined,
    sponsored: row.is_sponsored,
    vibes: row.vibes ?? [],
  };
}

export function usePlaces() {
  const { latitude, longitude } = useUserLocation();

  return useQuery({
    queryKey: ["places"],
    queryFn: async () => {
      const { data, error } = await supabase.from("places").select("*");
      if (error) throw error;
      return data as unknown as PlaceRow[];
    },
    select: (rows) => rows.map((r) => mapPlace(r, latitude, longitude)),
    staleTime: 60_000,
  });
}

export function usePlace(id: string | undefined) {
  const { latitude, longitude } = useUserLocation();

  return useQuery({
    queryKey: ["places", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("places").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as unknown as PlaceRow;
    },
    select: (row) => mapPlace(row, latitude, longitude),
    enabled: !!id,
  });
}

interface EventRow {
  id: string;
  title: string;
  category: string;
  image_url: string;
  venue_name: string;
  starts_at: string;
  is_free: boolean;
  price_text: string | null;
  is_sponsored: boolean;
}

function whenBucket(startsAt: string): EventItem["when"] {
  const start = new Date(startsAt);
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfDay(start).getTime() - startOfDay(now).getTime()) / 86_400_000);
  if (diffDays <= 0) return "hoje";
  if (diffDays === 1) return "amanha";
  return "fimDeSemana";
}

function formatEventDate(startsAt: string): string {
  const d = new Date(startsAt);
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const bucket = whenBucket(startsAt);
  const label = bucket === "hoje" ? "Hoje" : bucket === "amanha" ? "Amanhã" : d.toLocaleDateString("pt-BR", { weekday: "long" });
  return `${label} · ${time}`;
}

function mapEvent(row: EventRow): EventItem {
  return {
    id: row.id,
    title: row.title,
    image: row.image_url,
    date: formatEventDate(row.starts_at),
    when: whenBucket(row.starts_at),
    free: row.is_free,
    price: row.price_text ?? undefined,
    venue: row.venue_name,
    category: row.category,
    sponsored: row.is_sponsored,
  };
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("starts_at", { ascending: true });
      if (error) throw error;
      return data as unknown as EventRow[];
    },
    select: (rows) => rows.map(mapEvent),
    staleTime: 60_000,
  });
}
