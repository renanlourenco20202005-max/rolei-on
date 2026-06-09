import { useRouter } from "@tanstack/react-router";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function RouteErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <h1 className="mt-6 text-xl font-bold text-foreground">
          Ops, algo deu errado
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Não conseguimos carregar esta página. Tente novamente ou volte para o início.
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 rounded-xl bg-muted p-3 text-left">
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
              Detalhes técnicos
            </summary>
            <pre className="mt-2 overflow-auto rounded-lg bg-card p-2 text-[11px] text-destructive">
              {error.message}
            </pre>
          </details>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow transition active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground transition active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RouteNotFoundFallback() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-muted">
          <span className="text-2xl font-extrabold text-muted-foreground">404</span>
        </div>

        <h1 className="mt-6 text-xl font-bold text-foreground">
          Página não encontrada
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          O endereço que você acessou não existe ou foi movido.
        </p>

        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow transition active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}
