import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { getPrefs } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { syncPrefsFromCloud } from "@/lib/user-profile";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Rolei — Descubra o que fazer hoje" }] }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!data.user) {
        navigate({ to: "/login", replace: true });
        return;
      }
      await syncPrefsFromCloud();
      if (cancelled) return;
      const p = getPrefs();
      navigate({ to: p.onboarded ? "/home" : "/onboarding", replace: true });
    }, 1200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [navigate]);

  return (
    <div className="app-shell relative overflow-hidden bg-gradient-hero text-white">
      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-between px-8 pb-12 pt-24 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 backdrop-blur-md">
            <Sparkles className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/80">app</p>
        </div>

        <div className="flex flex-col items-center gap-5">
          <h1 className="text-7xl font-extrabold tracking-tight">Rolei</h1>
          <p className="max-w-[18ch] text-2xl font-medium leading-tight text-white/95">
            Descubra o que fazer hoje.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-4">
          <Link
            to="/onboarding"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-bold text-secondary shadow-glow transition active:scale-[0.98]"
          >
            Começar
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
          </Link>
          <Link to="/home" className="text-xs font-medium text-white/80">
            Já tenho conta
          </Link>
        </div>
      </div>
    </div>
  );
}
