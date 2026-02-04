"use client";

import { createContext, useContext } from "react";
import { useAuthGuard, type Profile } from "@/lib/useAuthGuard";

type AuthGuardContextValue = { profile: Profile; logout: () => void };
const AuthGuardContext = createContext<AuthGuardContextValue | null>(null);

export function useAuthGuardContext(): AuthGuardContextValue {
  const ctx = useContext(AuthGuardContext);
  if (!ctx) throw new Error("useAuthGuardContext must be used inside AuthGate");
  return ctx;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { profile, loading, error, retry, logout } = useAuthGuard();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid rgba(255,255,255,.2)",
              borderTopColor: "#a855f7",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <div style={{ opacity: 0.8 }}>Проверка входа…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 400,
            padding: 24,
            borderRadius: 18,
            border: "1px solid rgba(239,68,68,.4)",
            background: "rgba(239,68,68,.08)",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Ошибка входа</div>
          <div style={{ opacity: 0.9, marginBottom: 20 }}>{error}</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={retry}
              style={{
                padding: "12px 20px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.2)",
                background: "#6d28d9",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Повторить
            </button>
            <button
              type="button"
              onClick={logout}
              style={{
                padding: "12px 20px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.2)",
                background: "transparent",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <AuthGuardContext.Provider value={{ profile, logout }}>
      {children}
    </AuthGuardContext.Provider>
  );
}
