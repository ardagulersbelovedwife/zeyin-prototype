"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function safeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/community";
  if (next.startsWith("/login")) return "/community";
  if (next.startsWith("/auth")) return "/community";
  return next;
}

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const nextPath = useMemo(() => safeNext(sp.get("next")), [sp]);

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSent(false);

    const v = email.trim();
    if (!v) {
      setError("Введите email");
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: v,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
              : undefined,
        },
      });

      if (err) {
        setError(err.message);
        return;
      }

      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(255,255,255,.04)",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Login</h1>
        <p style={{ opacity: 0.8, marginBottom: 18 }}>
          Введите email, мы отправим magic link для входа.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              height: 44,
              padding: "0 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.18)",
              background: "rgba(0,0,0,.35)",
              color: "white",
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 44,
              borderRadius: 12,
              border: "none",
              background: loading ? "rgba(255,255,255,.18)" : "#6d28d9",
              color: "white",
              fontWeight: 800,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Отправляем…" : "Отправить magic link"}
          </button>

          {error && <div style={{ color: "#f97373", fontSize: 14 }}>{error}</div>}
          {sent && (
            <div style={{ color: "#4ade80", fontSize: 14 }}>
              Письмо отправлено. Проверь почту.
            </div>
          )}
        </form>

        <button
          onClick={() => router.push("/community")}
          style={{ marginTop: 14, opacity: 0.7, fontSize: 12, background: "transparent", color: "white", border: "none", cursor: "pointer" }}
        >
          (debug) открыть community
        </button>
      </div>
    </div>
  );
}
