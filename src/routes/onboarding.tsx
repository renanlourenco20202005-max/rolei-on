import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { savePrefs } from "@/lib/store";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Personalize seus rolês — Rolei" }] }),
  component: Onboarding,
});

const steps = [
  {
    key: "company",
    title: "Com quem você costuma sair?",
    multi: false,
    options: ["Casal", "Amigos", "Família", "Sozinho"],
  },
  {
    key: "likes",
    title: "O que você gosta?",
    subtitle: "Escolha quantos quiser",
    multi: true,
    options: ["Bares", "Restaurantes", "Música ao vivo", "Festas", "Eventos", "Cafés", "Gastronomia"],
  },
  {
    key: "budget",
    title: "Qual sua faixa de orçamento?",
    multi: false,
    options: ["Até R$50", "Até R$100", "Até R$200", "Acima de R$200"],
  },
] as const;

function Onboarding() {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({ likes: [] });
  const step = steps[stepIdx];
  const value = answers[step.key];
  const canContinue = step.multi ? Array.isArray(value) && value.length > 0 : Boolean(value);

  const toggle = (opt: string) => {
    setAnswers((prev) => {
      if (step.multi) {
        const cur = (prev[step.key] as string[]) ?? [];
        return { ...prev, [step.key]: cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt] };
      }
      return { ...prev, [step.key]: opt };
    });
  };

  const next = () => {
    if (stepIdx < steps.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      savePrefs({
        company: answers.company as string,
        likes: (answers.likes as string[]) ?? [],
        budget: answers.budget as string,
        onboarded: true,
      });
      navigate({ to: "/home" });
    }
  };

  return (
    <div className="app-shell flex min-h-[100dvh] flex-col px-6 pb-8 pt-12">
      <div className="mb-8 flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= stepIdx ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Passo {stepIdx + 1} de {steps.length}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight">{step.title}</h1>
        {"subtitle" in step && step.subtitle && (
          <p className="mt-2 text-sm text-muted-foreground">{step.subtitle}</p>
        )}
      </div>

      <div className="flex-1 space-y-2.5">
        {step.options.map((opt) => {
          const selected = step.multi
            ? ((value as string[]) ?? []).includes(opt)
            : value === opt;
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`flex w-full items-center justify-between rounded-2xl border-2 px-5 py-4 text-left text-base font-semibold transition active:scale-[0.99] ${
                selected
                  ? "border-primary bg-accent text-foreground"
                  : "border-border bg-card text-foreground"
              }`}
            >
              {opt}
              <span
                className={`grid h-6 w-6 place-items-center rounded-full transition ${
                  selected ? "bg-primary text-primary-foreground" : "border-2 border-border bg-card"
                }`}
              >
                {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={next}
        disabled={!canContinue}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-glow transition active:scale-[0.98] disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
      >
        {stepIdx === steps.length - 1 ? "Salvar e começar" : "Continuar"}
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
