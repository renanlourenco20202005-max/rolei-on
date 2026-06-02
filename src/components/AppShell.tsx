import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Calendar, Heart, User } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/home", label: "Início", icon: Home },
  { to: "/search", label: "Explorar", icon: Search },
  { to: "/events", label: "Eventos", icon: Calendar },
  { to: "/favorites", label: "Salvos", icon: Heart },
  { to: "/profile", label: "Perfil", icon: User },
] as const;

export function AppShell({ children, hideTabs }: { children: ReactNode; hideTabs?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="app-shell shadow-card">
      <div className={hideTabs ? "" : "safe-bottom"}>{children}</div>
      {!hideTabs && (
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t border-border bg-card/95 backdrop-blur-md"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <ul className="grid grid-cols-5">
            {tabs.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || (to !== "/home" && pathname.startsWith(to));
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
