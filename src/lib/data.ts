import bar1 from "@/assets/bar-1.jpg";
import music1 from "@/assets/music-1.jpg";
import restaurant1 from "@/assets/restaurant-1.jpg";
import happyhour1 from "@/assets/happyhour-1.jpg";
import party1 from "@/assets/party-1.jpg";
import cafe1 from "@/assets/cafe-1.jpg";
import food1 from "@/assets/food-1.jpg";
import event1 from "@/assets/event-1.jpg";

export const images = { bar1, music1, restaurant1, happyhour1, party1, cafe1, food1, event1 };

export type Category = "Bar" | "Restaurante" | "Música ao vivo" | "Festa" | "Evento" | "Café" | "Gastronomia";

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

export const places: Place[] = [
  {
    id: "lapidado",
    name: "Lapidado Bar",
    category: "Bar",
    image: bar1,
    distance: "0,8 km",
    rating: 4.8,
    reviews: 1243,
    price: "$$",
    tags: ["Coquetelaria", "Ambiente intimista"],
    description: "Coquetelaria autoral em um ambiente intimista, com drinks assinados pelo bartender Caio Souza e trilha sonora analógica.",
    address: "R. Aspicuelta, 421 — Vila Madalena",
    hours: "Ter–Dom · 18h–02h",
    whatsapp: "+55 11 99999-1234",
    instagram: "@lapidadobar",
    promo: "2x1 em drinks autorais até 20h",
    vibes: ["romântico", "casal", "drinks", "intimista"],
  },
  {
    id: "vinil-club",
    name: "Vinil Music Club",
    category: "Música ao vivo",
    image: music1,
    distance: "1,2 km",
    rating: 4.7,
    reviews: 892,
    price: "$$$",
    tags: ["Jazz", "Blues", "Show ao vivo"],
    description: "Casa de shows independente com programação semanal de jazz, blues e MPB instrumental.",
    address: "R. Augusta, 1508 — Consolação",
    hours: "Qua–Sáb · 20h–03h",
    whatsapp: "+55 11 99988-7766",
    instagram: "@vinilmusicclub",
    sponsored: true,
    vibes: ["música", "show", "amigos"],
  },
  {
    id: "fogo-lenha",
    name: "Fogo & Lenha",
    category: "Restaurante",
    image: restaurant1,
    distance: "2,1 km",
    rating: 4.9,
    reviews: 2104,
    price: "$$$",
    tags: ["Cozinha de fogo", "Vinhos naturais"],
    description: "Cozinha brasileira contemporânea no fogo de chão, com carta de vinhos naturais selecionada pela sommelier Marina Reis.",
    address: "R. Joaquim Antunes, 204 — Pinheiros",
    hours: "Ter–Dom · 19h–00h",
    whatsapp: "+55 11 98877-6655",
    instagram: "@fogoelenha",
    vibes: ["romântico", "casal", "vinho", "jantar"],
  },
  {
    id: "rooftop-sol",
    name: "Sol Rooftop",
    category: "Bar",
    image: happyhour1,
    distance: "0,4 km",
    rating: 4.6,
    reviews: 1567,
    price: "$$",
    tags: ["Rooftop", "Happy Hour"],
    description: "Rooftop com vista 360º da cidade, especializado em chopes artesanais e petiscos compartilháveis.",
    address: "Av. Paulista, 2073 — 22º andar",
    hours: "Seg–Dom · 17h–01h",
    whatsapp: "+55 11 91234-5678",
    instagram: "@solrooftop",
    promo: "Happy Hour 17h–20h · chope pela metade",
    vibes: ["happy hour", "amigos", "rooftop", "chope"],
  },
  {
    id: "neon-club",
    name: "Neon Underground",
    category: "Festa",
    image: party1,
    distance: "3,5 km",
    rating: 4.5,
    reviews: 980,
    price: "$$$",
    tags: ["House", "Techno", "Open Bar"],
    description: "Pista subterrânea com line-up internacional de house e techno. Open bar até meia-noite às sextas.",
    address: "R. dos Pinheiros, 612 — Pinheiros",
    hours: "Sex–Sáb · 23h–06h",
    whatsapp: "+55 11 95555-2222",
    instagram: "@neonunderground",
    vibes: ["festa", "balada", "amigos", "música"],
  },
  {
    id: "morro-cafe",
    name: "Morro Café",
    category: "Café",
    image: cafe1,
    distance: "0,6 km",
    rating: 4.9,
    reviews: 3450,
    price: "$",
    tags: ["Especialidade", "Brunch"],
    description: "Café de origem com grãos torrados na casa e brunch servido o dia inteiro.",
    address: "R. Harmonia, 88 — Vila Madalena",
    hours: "Seg–Dom · 08h–20h",
    whatsapp: "+55 11 97777-3333",
    instagram: "@morrocafe",
    vibes: ["café", "sozinho", "trabalhar", "brunch"],
  },
  {
    id: "tora-burger",
    name: "Tora Burger",
    category: "Gastronomia",
    image: food1,
    distance: "1,5 km",
    rating: 4.7,
    reviews: 2890,
    price: "$$",
    tags: ["Burger", "Cerveja artesanal"],
    description: "Smash burgers de carne maturada e mais de 30 rótulos de cerveja artesanal.",
    address: "R. Fradique Coutinho, 1402",
    hours: "Ter–Dom · 18h–00h",
    whatsapp: "+55 11 96666-1111",
    instagram: "@toraburger",
    promo: "Combo burger + chope por R$ 49",
    vibes: ["amigos", "burger", "cerveja", "gastronomia"],
  },
];

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

export const events: EventItem[] = [
  {
    id: "feira-noturna",
    title: "Feira Noturna do Beco",
    image: event1,
    date: "Hoje · 19h",
    when: "hoje",
    free: true,
    venue: "Beco do Batman — Vila Madalena",
    category: "Cultural",
  },
  {
    id: "jazz-trio",
    title: "Marina Reis Trio · Jazz ao vivo",
    image: music1,
    date: "Hoje · 21h",
    when: "hoje",
    free: false,
    price: "R$ 40",
    venue: "Vinil Music Club",
    category: "Música",
    sponsored: true,
  },
  {
    id: "rooftop-sunset",
    title: "Sunset Sessions · DJ Lia",
    image: happyhour1,
    date: "Amanhã · 17h",
    when: "amanha",
    free: true,
    venue: "Sol Rooftop",
    category: "Música",
  },
  {
    id: "festival-burger",
    title: "Festival do Burger Artesanal",
    image: food1,
    date: "Sábado · 12h",
    when: "fimDeSemana",
    free: true,
    venue: "Praça Benedito Calixto",
    category: "Gastronomia",
  },
  {
    id: "noite-house",
    title: "Noite House · open bar",
    image: party1,
    date: "Sábado · 23h",
    when: "fimDeSemana",
    free: false,
    price: "R$ 80",
    venue: "Neon Underground",
    category: "Festa",
  },
];

export const sections = [
  { id: "trending", title: "🔥 Em alta hoje", filter: (p: Place) => p.rating >= 4.7 },
  { id: "happy", title: "🍻 Happy Hour", filter: (p: Place) => /happy hour/i.test(p.promo ?? "") || p.vibes.includes("happy hour") },
  { id: "music", title: "🎵 Música ao vivo", filter: (p: Place) => p.category === "Música ao vivo" },
  { id: "couple", title: "❤️ Para casais", filter: (p: Place) => p.vibes.includes("romântico") },
  { id: "gastro", title: "🍔 Gastronomia", filter: (p: Place) => p.category === "Gastronomia" || p.category === "Restaurante" },
  { id: "near", title: "📍 Perto de você", filter: (_: Place) => true },
];
