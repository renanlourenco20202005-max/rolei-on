import { supabase } from "@/integrations/supabase/client";
import { getPrefs, savePrefs, type Prefs } from "@/lib/store";

export async function syncPrefsFromCloud() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  const { data } = await supabase
    .from("user_profiles")
    .select("prefs, onboarded")
    .eq("user_id", u.user.id)
    .maybeSingle();
  if (!data) return;
  const remote = (data.prefs ?? {}) as unknown as Partial<Prefs>;
  savePrefs({ likes: [], ...remote, onboarded: data.onboarded });
}

export async function pushPrefsToCloud(prefs: Prefs) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase
    .from("user_profiles")
    .update({ prefs: prefs as unknown as Record<string, unknown>, onboarded: !!prefs.onboarded })
    .eq("user_id", u.user.id);
}

export async function savePrefsEverywhere(prefs: Prefs) {
  savePrefs(prefs);
  try { await pushPrefsToCloud(prefs); } catch { /* noop */ }
}

export function getMergedPrefs() {
  return getPrefs();
}
