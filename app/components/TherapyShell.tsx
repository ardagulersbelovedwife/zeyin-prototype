"use client";

import Link from "next/link";
import FocusKeeperBar from "@/app/components/FocusKeeperBar";
import { MonsterWidget } from "@/app/components/MonsterWidget";

type TherapyShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  backHref?: string;
  badge?: string;
};

export function TherapyShell({
  title,
  subtitle,
  children,
  backHref,
  badge,
}: TherapyShellProps) {
  return (
    <>
      <div style={{ minHeight: "calc(100vh - 80px)", padding: "32px 24px", paddingBottom: 100 }}>
        <div style={{ maxWidth: 750, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          {backHref && (
            <Link href={backHref} style={{ color: "var(--color-text-muted)", fontSize: 13, textDecoration: "none", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              ← Return
            </Link>
          )}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <h1 style={{ fontSize: 32, fontWeight: 400, color: "var(--color-text-primary)", letterSpacing: "0.02em", margin: 0 }}>{title}</h1>
                {badge && (
                  <span style={{ padding: "4px 12px", border: "1px solid var(--color-accent)", background: "var(--color-accent-dim)", color: "var(--color-accent)", borderRadius: 16, fontSize: 13, fontWeight: 500, letterSpacing: "0.05em" }}>{badge}</span>
                )}
              </div>
              {subtitle && <p style={{ fontSize: 15, color: "var(--color-text-secondary)", margin: 0, fontWeight: 300, lineHeight: 1.5 }}>{subtitle}</p>}
            </div>
          </div>

          <FocusKeeperBar />
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {children}
          </div>
        </div>
      </div>
      <MonsterWidget />
    </>
  );
}
