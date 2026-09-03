import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIsStaff } from "@/hooks/useIsStaff";

interface DemoLabShellProps {
  children: ReactNode;
  /** Program theme scope class, e.g. "program-cyberfoundations". */
  themeClass?: string;
  /** Hidden chrome for full-screen presentation. */
  bare?: boolean;
}

const nav = [
  { to: "/", label: "Demo Lab" },
  { to: "/cyberfoundations", label: "CyberFoundations" },
  { to: "/pki", label: "PKI" },
];

export function DemoLabShell({ children, themeClass, bare }: DemoLabShellProps) {
  return (
    <div className={cn("atmosphere min-h-screen bg-background", themeClass)}>
      {!bare && (
        <header className="border-b border-border/60 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4 sm:px-8">
            <Link
              to="/"
              className="group flex items-baseline gap-3"
              aria-label="CVI Demo Lab home"
            >
              <span className="font-display text-base font-semibold tracking-[0.24em] text-foreground uppercase">
                CVI
              </span>
              <span className="text-sm tracking-[0.18em] text-muted-foreground uppercase">
                Demo Lab
              </span>
            </Link>
            <nav aria-label="Primary" className="flex flex-wrap items-center gap-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{
                    className: "text-foreground border-primary/70 bg-primary/10",
                  }}
                  inactiveProps={{ className: "text-muted-foreground border-transparent" }}
                  className="rounded-md border px-3 py-2 text-sm transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              to="/instructor"
              className="ml-auto rounded-md border border-border px-3 py-2 text-xs tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:border-primary/60 hover:text-foreground"
            >
              Instructor Console
            </Link>
          </div>
        </header>
      )}
      <main>{children}</main>
      {!bare && (
        <footer className="border-t border-border/60 px-5 py-8 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span>CyberVisionaries Institute — CVI Demo Lab</span>
            <span>
              Interactive teaching environment. Simulated infrastructure values only.
            </span>
          </div>
        </footer>
      )}
    </div>
  );
}
