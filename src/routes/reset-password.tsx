import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Lock, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Nova senha — Rolei Parceiro" }] }),
  component: ResetPasswordPage,
});

const passwordSchema = z.string().min(8, "Mínimo 8 caracteres").max(72);

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Verify there is a recovery session in the URL hash
    const hash = window.location.hash;
    if (!hash.includes("type=recovery") && !hash.includes("access_token")) {
      toast.error("Link inválido ou expirado.");
      setChecking(false);
      return;
    }
    // Give Supabase a moment to parse the token from the hash
    const t = setTimeout(() => setChecking(false), 600);
    return () => clearTimeout(t);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const safePassword = passwordSchema.parse(password);
      if (password !== confirm) throw new Error("As senhas não coincidem");
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: safePassword });
      if (error) throw error;
      setDone(true);
      toast.success("Senha redefinida com sucesso!");
    } catch (err) {
      const message =
        err instanceof z.ZodError
          ? err.issues[0]?.message ?? "Dados inválidos"
          : err instanceof Error
            ? err.message
            : "Erro inesperado";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="app-shell shadow-card min-h-screen bg-background">
      <header className="bg-gradient-hero px-5 pb-10 pt-6 text-white">
        <Link to="/auth" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="mt-6 text-2xl font-extrabold leading-tight">
          {done ? "Senha redefinida!" : "Criar nova senha"}
        </h1>
        <p className="mt-1.5 text-sm opacity-85">
          {done
            ? "Sua senha foi atualizada. Agora você pode acessar o painel."
            : "Escolha uma nova senha segura para sua conta."}
        </p>
      </header>

      <main className="-mt-6 px-5">
        <div className="rounded-3xl bg-card p-5 shadow-card">
          {done ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-base font-bold text-foreground">Tudo certo!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sua senha foi alterada com sucesso.
              </p>
              <button
                onClick={() => navigate({ to: "/auth" })}
                className="mt-5 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow"
              >
                Ir para o login
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 focus-within:border-primary">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Nova senha (mín. 8)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent py-3 text-sm outline-none"
                  autoComplete="new-password"
                />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 focus-within:border-primary">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="flex-1 bg-transparent py-3 text-sm outline-none"
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar nova senha
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
