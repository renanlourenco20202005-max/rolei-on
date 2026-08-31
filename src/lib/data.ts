import bar1 from "@/assets/bar-1.jpg";
import music1 from "@/assets/music-1.jpg";
import restaurant1 from "@/assets/restaurant-1.jpg";
import happyhour1 from "@/assets/happyhour-1.jpg";
import party1 from "@/assets/party-1.jpg";
import cafe1 from "@/assets/cafe-1.jpg";
import food1 from "@/assets/food-1.jpg";
import event1 from "@/assets/event-1.jpg";

// Imagens locais usadas em telas ilustrativas (onboarding, painel do parceiro).
// Os places/events reais vêm do Supabase com suas próprias image_url — ver
// src/lib/places-queries.ts.
export const images = { bar1, music1, restaurant1, happyhour1, party1, cafe1, food1, event1 };

export type Category = "Bar" | "Restaurante" | "Música ao vivo" | "Festa" | "Evento" | "Café" | "Gastronomia" | "After";

export interface Place {
  id: string;
  name: string;
  category: Category;
  image: string;
  distance: string;
  rating: number;
  reviews: number;
  price: "$" | "$$" | "$$$" | "$$$$";
  tags: string[];
  description: string;
  address: string;
  hours: string;
  whatsapp: string;
  instagram: string;
  promo?: string;
  sponsored?: boolean;
  vibes: string[];
}

export interface EventItem {
  id: string;
  title: string;
  image: string;
  date: string;
  when: "hoje" | "amanha" | "fimDeSemana";
  free: boolean;
  price?: string;
  venue: string;
  category: string;
  sponsored?: boolean;
}

// Agrupamentos usados na Home. Operam sobre os places reais vindos do
// Supabase (via usePlaces()), não sobre dados mockados.
export const sections = [
  { id: "trending", title: "🔥 Em alta hoje", filter: (p: Place) => p.rating >= 4.7 },
  { id: "happy", title: "🍻 Happy Hour", filter: (p: Place) => /happy hour/i.test(p.promo ?? "") || p.vibes.includes("happy hour") },
  { id: "music", title: "🎵 Música ao vivo", filter: (p: Place) => p.category === "Música ao vivo" },
  { id: "couple", title: "❤️ Para casais", filter: (p: Place) => p.vibes.includes("romântico") },
  { id: "gastro", title: "🍔 Gastronomia", filter: (p: Place) => p.category === "Gastronomia" || p.category === "Restaurante" },
  { id: "after", title: "🌙 After hours", filter: (p: Place) => p.category === "After" },
  { id: "near", title: "📍 Perto de você", filter: (_: Place) => true },
];
