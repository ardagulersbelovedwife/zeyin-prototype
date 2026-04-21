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
  const { profile, loading, logout } = useAuthGuard();

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
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <div style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>Checking authentication…</div>
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
