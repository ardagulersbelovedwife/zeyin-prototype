"use client";

import { useState, useEffect } from "react";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthGate } from "@/app/components/AuthGate";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isLogin = pathname?.startsWith("/login");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.setAttribute('data-theme', "dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "dark") {
      document.documentElement.setAttribute('data-theme', "dark");
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  return (
    <html lang="ru" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-bg)", transition: "background 0.3s ease" }}>
          {!isLogin && (
            <AuthGate>
              <header
                style={{
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 20px",
                  borderBottom: "1px solid var(--color-border)",
                  position: "sticky",
                  top: 0,
                  background: "var(--color-card-bg)",
                  backdropFilter: "blur(24px)",
                  zIndex: 10,
                  transition: "background 0.3s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "var(--color-accent)",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 600,
                      color: "#020617",
                      fontSize: 16,
                    }}
                  >
                    Z
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontWeight: 800, lineHeight: 1, color: "var(--color-text-primary)" }}>Zeyin</div>
                    <div style={{ opacity: 0.6, fontSize: 12, color: "var(--color-text-secondary)" }}>Focus training</div>
                  </div>
                </div>

                <button
                  onClick={toggleTheme}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--color-border)",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    color: "var(--color-text-primary)",
                  }}
                  title="Toggle Theme"
                >
                  {theme === "light" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                  )}
                </button>
              </header>

              <main style={{ flex: 1, padding: "20px", paddingBottom: 92, maxWidth: 1100, margin: "0 auto", width: "100%" }}>
                {children}
              </main>

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 84,
          paddingBottom: "env(safe-area-inset-bottom)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          borderTop: "1px solid var(--color-border)",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(24px)",
          zIndex: 100,
        }}
      >
        {[
          { 
            href: "/focus", 
            label: "Focus", 
            Icon: (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            )
          },
          { 
            href: "/quest", 
            label: "Quest",
            Icon: (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            )
          },
          { 
            href: "/therapy", 
            label: "Therapy",
            Icon: (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            )
          },
          { 
            href: "/community", 
            label: "Community",
            Icon: (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            )
          }
        ].map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                width: 64,
                height: 64,
                color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
                transition: "all 0.2s ease",
              }}
            >
              <div 
                style={{ 
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: isActive ? 1 : 0.6,
                  filter: isActive ? "drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))" : "none"
                }}
              >
                {item.Icon}
                <span style={{ fontSize: "10px", fontWeight: isActive ? 600 : 400, marginTop: 4, letterSpacing: "0.02em" }}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </AuthGate>
  )}
  {isLogin && <>{children}</>}
</div>
      </body>
    </html>
  );
}
