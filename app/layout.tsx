"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isLogin = pathname?.startsWith("/login");

  return (
    <html lang="ru">
      <body>
        <div style={{ minHeight: "100vh", background: "#0b0f14", color: "#fff" }}>
          {!isLogin && (
            <>
              <header
                style={{
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "0 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  position: "sticky",
                  top: 0,
                  background: "#0b0f14",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #a855f7, #ec4899)",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                  }}
                >
                  Z
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontWeight: 800, lineHeight: 1 }}>Zeyin</div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>AR терапия для фокуса</div>
                </div>
              </header>

              <main style={{ padding: 20, paddingBottom: 92, maxWidth: 1100, margin: "0 auto" }}>
                {children}
              </main>

              <nav
                style={{
                  position: "fixed",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 72,
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  background: "#0b0f14",
                }}
              >
                <Link href="/focus" style={{ color: "white", opacity: 0.9, textDecoration: "none" }}>
                  Focus
                </Link>
                <Link href="/quest" style={{ color: "white", opacity: 0.9, textDecoration: "none" }}>
                  Quest
                </Link>
                <Link href="/community" style={{ color: "white", opacity: 0.9, textDecoration: "none" }}>
                  Community
                </Link>
                <Link href="/ar-live" style={{ color: "white", opacity: 0.9, textDecoration: "none" }}>
                  AR-Live
                </Link>
              </nav>
            </>
          )}
          {isLogin && <>{children}</>}
        </div>
      </body>
    </html>
  );
}
