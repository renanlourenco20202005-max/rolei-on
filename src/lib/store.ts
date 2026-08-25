import { useEffect, useState } from "react";
import { listFavorites, setFavorite } from "@/lib/favorites.functions";

export interface Prefs {
  company?: string[];
  likes: string[];
  budget?: string;
  onboarded?: boolean;
  partnerSeen?: boolean;
  notifications?: { promos?: boolean; events?: boolean; news?: boolean };
}

const PREFS_KEY = "rolei.prefs.v1";
const FAVS_KEY = "rolei.favs.v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) ?? "") as T; } catch { return fallback; }
}

export function getPrefs(): Prefs {
  return read<Prefs>(PREFS_KEY, { likes: [] });
}
export function savePrefs(p: Prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("rolei:prefs"));
}

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>({ likes: [] });
  useEffect(() => {
    setPrefs(getPrefs());
    const h = () => setPrefs(getPrefs());
    window.addEventListener("rolei:prefs", h);
    return () => window.removeEventListener("rolei:prefs", h);
  }, []);
  return prefs;
}

type Favs = { places: string[]; events: string[] };
const EMPTY_FAVS: Favs = { places: [], events: [] };

export function useFavorites() {
  const [favs, setFavs] = useState<Favs>(EMPTY_FAVS);
  useEffect(() => {
    setFavs(read(FAVS_KEY, EMPTY_FAVS));
    const h = () => setFavs(read(FAVS_KEY, EMPTY_FAVS));
    window.addEventListener("rolei:favs", h);
    // Sync from cloud (cloud wins when available)
    listFavorites()
      .then((remote) => {
        localStorage.setItem(FAVS_KEY, JSON.stringify(remote));
        window.dispatchEvent(new Event("rolei:favs"));
      })
      .catch(() => { /* offline or signed out: keep local */ });
    return () => window.removeEventListener("rolei:favs", h);
  }, []);
  const toggle = (kind: "places" | "events", id: string) => {
    const current = read<Favs>(FAVS_KEY, EMPTY_FAVS);
    const set = new Set(current[kind]);
    set.has(id) ? set.delete(id) : set.add(id);
    const next = { ...current, [kind]: Array.from(set) };
    localStorage.setItem(FAVS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("rolei:favs"));
    setFavorite({ data: { kind, itemId: id, saved: set.has(id) } }).catch(() => { /* keep local only */ });
  };
  return { favs, toggle };
}
