import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Sun, Moon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { theme, toggle } = useTheme();
  return (
    <div className="relative min-h-dvh bg-background">
      <div className="pointer-events-none absolute inset-0 bp-dots opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bp-glow" />
      <div className="relative flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-4 py-5 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">BrevetAI</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Ganti tema">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-sm">
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}

// dummy route registration is not needed — this file is a component only.
// Prevent TanStack from treating it as a route:
export const Route = createFileRoute as unknown as never;
