import { useEffect, useState } from "react";
import { images } from "./data";

export interface PartnerPromo {
  id: string;
  title: string;
  description: string;
  validUntil: string;
  active: boolean;
}

export interface PartnerEvent {
  id: string;
  title: string;
  date: string;
  free: boolean;
  price?: string;
  description: string;
}

export interface PartnerMetrics {
  views: number;
  clicks: number;
  routes: number;
  whatsapp: number;
  history: { date: string; views: number; clicks: number }[];
}

export interface PartnerProfile {
  name: string;
  category: string;
  description: string;
  address: string;
  hours: string;
  whatsapp: string;
  instagram: string;
  cover: string;
  photos: string[];
  promos: PartnerPromo[];
  events: PartnerEvent[];
  metrics: PartnerMetrics;
}

const KEY = "rolei.partner.v1";

function seed(): PartnerProfile {
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
    name: "Lapidado Bar",
    category: "Bar",
    description:
      "Coquetelaria autoral em um ambiente intimista, com drinks assinados e trilha sonora analógica.",
    address: "R. Aspicuelta, 421 — Vila Madalena",
    hours: "Ter–Dom · 18h–02h",
    whatsapp: "+55 11 99999-1234",
    instagram: "@lapidadobar",
    cover: images.bar1,
    photos: [images.bar1, images.happyhour1, images.music1],
    promos: [
      {
        id: "p1",
        title: "2x1 em drinks autorais",
        description: "Válido de terça a quinta, até as 20h.",
        validUntil: "30/06/2026",
        active: true,
      },
    ],
    events: [
      {
        id: "e1",
        title: "Noite de Jazz · Marina Reis Trio",
        date: "Hoje · 21h",
        free: false,
        price: "R$ 40",
        description: "Show ao vivo com trio autoral.",
      },
    ],
    metrics: {
      views: history.reduce((a, b) => a + b.views, 0),
      clicks: history.reduce((a, b) => a + b.clicks, 0),
      routes: 184,
      whatsapp: 97,
      history,
    },
  };
}

export function getPartner(): PartnerProfile {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as PartnerProfile;
  } catch { /* empty */ }
  const s = seed();
  localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}

export function savePartner(p: PartnerProfile) {
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("rolei:partner"));
}

export function usePartner() {
  const [p, setP] = useState<PartnerProfile>(seed);
  useEffect(() => {
    setP(getPartner());
    const h = () => setP(getPartner());
    window.addEventListener("rolei:partner", h);
    return () => window.removeEventListener("rolei:partner", h);
  }, []);
  return p;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
