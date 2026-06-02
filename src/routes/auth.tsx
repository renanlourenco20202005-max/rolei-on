import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Mail, Lock, Store, Sparkles } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar no Rolei Parceiro" }] }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

const emailSchema = z.string().trim().email("Email inválido").max(255);
const passwordSchema = z.string().min(8, "Mínimo 8 caracteres").max(72);
const businessSchema = z.string().trim().min(2, "Informe o nome").max(120);

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [business, setBusiness] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);

  // Redirect if already signed in
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) navigate({ to: "/partner", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) navigate({ to: "/partner", replace: true });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const safeEmail = emailSchema.parse(email);
      const safePassword = passwordSchema.parse(password);
      setLoading(true);
      if (mode === "signup") {
        const safeBusiness = businessSchema.parse(business);
        const { error } = await supabase.auth.signUp({
          email: safeEmail,
          password: safePassword,
          options: {
            emailRedirectTo: `${window.location.origin}/partner`,
            data: { business_name: safeBusiness },
          },
        });
        if (error) throw error;
        toast.success("Cadastro realizado! Entrando...");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: safeEmail,
          password: safePassword,
        });
        if (error) throw error;
      }
    } catch (err) {
      const message = err instanceof z.ZodError
        ? err.issues[0]?.message ?? "Dados inválidos"
        : err instanceof Error ? err.message : "Erro inesperado";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const oauth = async (provider: "google" | "apple") => {
    try {
      setOauthLoading(provider);
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin + "/partner",
      });
      if (result.error) throw result.error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no login social");
      setOauthLoading(null);
    }
  };

  return (
    <div className="app-shell shadow-card min-h-screen bg-background">
      <header className="bg-gradient-hero px-5 pb-10 pt-6 text-white">
        <Link to="/profile" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-90">
          <Sparkles className="h-3.5 w-3.5" /> Rolei Parceiro
        </div>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight">
          {mode === "signin" ? "Entrar no painel." : "Cadastre seu estabelecimento."}
        </h1>
        <p className="mt-1.5 text-sm opacity-85">
          {mode === "signin"
            ? "Gerencie fotos, promoções, eventos e métricas em um só lugar."
            : "Em segundos seu rolê aparece para quem está procurando o que fazer hoje."}
        </p>
      </header>

      <main className="-mt-6 px-5">
        <div className="rounded-3xl bg-card p-5 shadow-card">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1 text-xs font-bold">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-xl py-2 transition ${
                  mode === m ? "bg-card text-foreground shadow-card" : "text-muted-foreground"
                }`}
              >
                {m === "signin" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-5 space-y-3">
            {mode === "signup" && (
              <FormField icon={Store} placeholder="Nome do estabelecimento" value={business} onChange={setBusiness} />
            )}
            <FormField icon={Mail} type="email" placeholder="email@exemplo.com" value={email} onChange={setEmail} />
            <FormField icon={Lock} type="password" placeholder="Senha (mín. 8)" value={password} onChange={setPassword} />
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> ou continue com <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2.5">
            <OAuthButton
              loading={oauthLoading === "google"}
              onClick={() => oauth("google")}
              label="Continuar com Google"
              variant="light"
              icon={<GoogleIcon />}
            />
            <OAuthButton
              loading={oauthLoading === "apple"}
              onClick={() => oauth("apple")}
              label="Continuar com Apple"
              variant="dark"
              icon={<AppleIcon />}
            />
          </div>
        </div>

        <p className="mt-5 px-2 text-center text-[11px] text-muted-foreground">
          Ao continuar você concorda com os Termos do Rolei e nossa Política de Privacidade.
        </p>
      </main>
    </div>
  );
}

function FormField({
  icon: Icon, type = "text", placeholder, value, onChange,
}: {
  icon: typeof Mail;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 focus-within:border-primary">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent py-3 text-sm outline-none"
        autoComplete={type === "password" ? "current-password" : type}
      />
    </div>
  );
}

function OAuthButton({
  loading, onClick, label, variant, icon,
}: {
  loading: boolean;
  onClick: () => void;
  label: string;
  variant: "light" | "dark";
  icon: React.ReactNode;
}) {
  const styles = variant === "dark"
    ? "bg-secondary text-secondary-foreground"
    : "bg-card text-foreground border border-border";
  return (
    <button
      onClick={onClick}
      disabled={loading}
      type="button"
      className={`flex w-full items-center justify-center gap-2.5 rounded-2xl py-3 text-sm font-bold transition disabled:opacity-60 ${styles}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.48 12c0-.73.13-1.45.36-2.11V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.15-3.15A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M16.36 12.6c0-2.43 1.98-3.6 2.07-3.66-1.13-1.65-2.89-1.88-3.52-1.9-1.5-.15-2.92.88-3.68.88-.76 0-1.93-.86-3.18-.83-1.63.02-3.14.95-3.98 2.41-1.7 2.94-.43 7.29 1.22 9.68.81 1.17 1.77 2.48 3.03 2.43 1.22-.05 1.68-.79 3.16-.79 1.47 0 1.89.79 3.18.76 1.32-.02 2.15-1.19 2.95-2.36.93-1.36 1.32-2.68 1.34-2.75-.03-.01-2.58-.99-2.6-3.92zM14.05 5.38c.67-.82 1.13-1.96 1-3.09-.97.04-2.15.65-2.85 1.46-.63.72-1.18 1.88-1.04 2.99 1.09.08 2.21-.55 2.89-1.36z" />
    </svg>
  );
}
