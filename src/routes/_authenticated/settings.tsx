import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, KeyRound, LogOut, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { usePrefs, savePrefs } from "@/lib/store";
import { deleteAccount } from "@/lib/settings.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Configurações — Rolei" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const prefs = usePrefs();
  const deleteAccountFn = useServerFn(deleteAccount);

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase
      .from("user_profiles")
      .select("display_name")
      .maybeSingle()
      .then(({ data }) => setName(data?.display_name ?? ""));
  }, []);

  const notif = prefs.notifications ?? {};

  const toggleNotif = (key: "promos" | "events" | "news") => {
    savePrefs({ ...prefs, notifications: { ...notif, [key]: !notif[key] } });
  };

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSavingName(true);
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      const { error } = await supabase
        .from("user_profiles")
        .update({ display_name: trimmed })
        .eq("user_id", u.user.id);
      if (error) toast.error("Não foi possível salvar o nome.");
      else toast.success("Nome atualizado!");
    }
    setSavingName(false);
  };

  const sendReset = async () => {
    setSendingReset(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user?.email) {
      toast.error("Não encontramos seu e-mail.");
      setSendingReset(false);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(u.user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error("Erro ao enviar e-mail de redefinição.");
    else toast.success("Enviamos o link de redefinição para seu e-mail.");
    setSendingReset(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const removeAccount = async () => {
    if (!window.confirm("Tem certeza? Sua conta, favoritos e histórico serão apagados permanentemente.")) return;
    setDeleting(true);
    try {
      await deleteAccountFn();
      await supabase.auth.signOut();
      localStorage.clear();
      navigate({ to: "/login" });
    } catch {
      toast.error("Não foi possível excluir a conta. Tente novamente.");
      setDeleting(false);
    }
  };

  return (
    <AppShell>
      <header className="flex items-center gap-3 px-5 pb-3 pt-8">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-card"
          aria-label="Voltar ao perfil"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Sua conta</p>
          <h1 className="text-2xl font-extrabold leading-tight">Configurações</h1>
        </div>
      </header>

      <div className="space-y-5 px-5 pt-2">
        <section className="rounded-3xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <User className="h-3.5 w-3.5 text-primary" /> Perfil
          </div>
          <label htmlFor="display-name" className="mt-4 block text-xs font-semibold text-muted-foreground">
            Nome de exibição
          </label>
          <input
            id="display-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="Como quer ser chamado?"
            className="mt-1.5 w-full rounded-xl bg-muted px-4 py-3 text-sm font-semibold outline-none ring-primary focus:ring-2"
          />
          <button
            onClick={saveName}
            disabled={savingName || !name.trim()}
            aria-busy={savingName}
            className="mt-3 w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-50"
          >
            {savingName ? "Salvando…" : "Salvar nome"}
          </button>
        </section>

        <section className="rounded-3xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Bell className="h-3.5 w-3.5 text-primary" /> Notificações
          </div>
          <div className="mt-3 space-y-1">
            <Toggle label="Promoções perto de mim" checked={!!notif.promos} onChange={() => toggleNotif("promos")} />
            <Toggle label="Novos eventos na cidade" checked={!!notif.events} onChange={() => toggleNotif("events")} />
            <Toggle label="Novidades do Rolei" checked={!!notif.news} onChange={() => toggleNotif("news")} />
          </div>
        </section>

        <section className="rounded-3xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <KeyRound className="h-3.5 w-3.5 text-primary" /> Segurança
          </div>
          <button
            onClick={sendReset}
            disabled={sendingReset}
            aria-busy={sendingReset}
            className="mt-3 w-full rounded-xl bg-muted py-3 text-xs font-bold text-foreground disabled:opacity-50"
          >
            {sendingReset ? "Enviando…" : "Trocar senha por e-mail"}
          </button>
        </section>

        <section className="space-y-2">
          <button
            onClick={signOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-3.5 text-sm font-semibold text-foreground shadow-card"
          >
            <LogOut className="h-4 w-4" /> Sair da conta
          </button>
          <button
            onClick={removeAccount}
            disabled={deleting}
            aria-busy={deleting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-3.5 text-sm font-semibold text-destructive shadow-card disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> {deleting ? "Excluindo…" : "Excluir minha conta"}
          </button>
        </section>
      </div>
    </AppShell>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex w-full items-center justify-between rounded-xl px-1 py-2.5"
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
