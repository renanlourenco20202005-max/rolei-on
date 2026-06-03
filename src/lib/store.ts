import { useEffect, useState } from "react";

export interface Prefs {
  company?: string[];
  likes: string[];
  budget?: string;
  onboarded?: boolean;
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

export function useFavorites() {
  const [favs, setFavs] = useState<{ places: string[]; events: string[] }>({ places: [], events: [] });
  useEffect(() => {
    setFavs(read(FAVS_KEY, { places: [], events: [] }));
    const h = () => setFavs(read(FAVS_KEY, { places: [], events: [] }));
    window.addEventListener("rolei:favs", h);
    return () => window.removeEventListener("rolei:favs", h);
  }, []);
  const toggle = (kind: "places" | "events", id: string) => {
    const current = read<{ places: string[]; events: string[] }>(FAVS_KEY, { places: [], events: [] });
    const set = new Set(current[kind]);
    set.has(id) ? set.delete(id) : set.add(id);
    const next = { ...current, [kind]: Array.from(set) };
    localStorage.setItem(FAVS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("rolei:favs"));
  };
  return { favs, toggle };
}
