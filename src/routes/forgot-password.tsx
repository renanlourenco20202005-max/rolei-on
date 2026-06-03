import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Mail, ArrowRight } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Recuperar senha — Rolei Parceiro" }] }),
  component: ForgotPasswordPage,
});

const emailSchema = z.string().trim().email("Email inválido").max(255);

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const resendBtnRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sent) {
      emailInputRef.current?.focus();
    } else {
      // Pequeno delay para garantir que o DOM foi atualizado
      const t = setTimeout(() => {
        resendBtnRef.current?.focus();
        statusRef.current?.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [sent]);

  const sendReset = async (targetEmail: string) => {
    const safeEmail = emailSchema.parse(targetEmail);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(safeEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    setSent(true);
    toast.success("Link enviado! Verifique seu email.");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendReset(email);
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

  const resend = async () => {
    try {
      await sendReset(email);
      toast.success("Novo link de recuperação enviado!");
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

  return (
    <div className="app-shell shadow-card min-h-screen bg-background">
      <header className="bg-gradient-hero px-5 pb-10 pt-6 text-white">
        <Link
          to="/auth"
          aria-label="Voltar para a tela de login"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <h1 className="mt-6 text-2xl font-extrabold leading-tight">
          Recuperar senha
        </h1>
        <p className="mt-1.5 text-sm opacity-85">
          {sent
            ? "Enviamos um link para o seu email. Clique nele para criar uma nova senha."
            : "Informe o email da sua conta e enviaremos um link seguro para redefinir sua senha."}
        </p>
      </header>

      <main className="-mt-6 px-5">
        <div className="rounded-3xl bg-card p-5 shadow-card">
          {sent ? (
            <div className="py-8 text-center">
              <div
                ref={statusRef}
                tabIndex={-1}
                aria-live="polite"
                aria-atomic="true"
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 outline-none"
              >
                <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-base font-bold text-foreground">
                Email enviado!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Verifique sua caixa de entrada (e a pasta de spam) e siga as
                instruções do email.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Enviado para:{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
              <button
                ref={resendBtnRef}
                onClick={resend}
                disabled={loading}
                aria-busy={loading}
                className="mt-4 inline-flex items-center gap-1.5 rounded-2xl border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-accent disabled:opacity-60"
              >
                {loading && (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Reenviar link
              </button>
              <button
                onClick={() => navigate({ to: "/auth" })}
                className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary"
              >
                Voltar para o login{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3" noValidate>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 focus-within:border-primary">
                <Mail
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <label htmlFor="forgot-email" className="sr-only">
                  Email da conta
                </label>
                <input
                  id="forgot-email"
                  ref={emailInputRef}
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent py-3 text-sm outline-none"
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={email.length > 0 && !emailSchema.safeParse(email).success ? "true" : "false"}
                  aria-describedby="forgot-email-help"
                />
              </div>
              <p id="forgot-email-help" className="text-xs text-muted-foreground">
                Insira o email associado à sua conta de parceiro.
              </p>
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
              >
                {loading && (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Enviar link de recuperação
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
