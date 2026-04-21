"use client";

import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function safeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/community";
  if (next.startsWith("/login")) return "/community";
  return next;
}

function AuthForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const nextPath = safeNext(sp.get("next"));
  const errorParam = sp.get("error");
  const descParam = sp.get("description");

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam || null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canSubmit = email.trim() && password && !loading;

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError(null);
    setSuccessMsg(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: emailTrimmed,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
        } else {
          // Check if session exists right away (auto-login is enabled)
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            router.replace(nextPath);
          } else {
            // Tell user to verify their email if require_email_confirmation is strictly enforced
            setSuccessMsg("Account created! You can now log in.");
            setMode("login");
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: emailTrimmed,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setError("Session not created. Please check Supabase settings.");
          return;
        }

        router.replace(nextPath);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 8, letterSpacing: "-0.02em" }}>
          Zeyin
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 16 }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </p>
      </div>

      {(error || descParam) && (
        <div style={{ padding: "14px 18px", background: "rgba(222, 147, 130, 0.15)", color: "#c53030", borderRadius: 12, marginBottom: 24, fontSize: 14 }}>
          {error || descParam}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: "14px 18px", background: "rgba(158, 179, 159, 0.15)", color: "#2f855a", borderRadius: 12, marginBottom: 24, fontSize: 14 }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8 }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px 20px",
              border: "1px solid var(--color-border)",
              borderRadius: "16px",
              background: "var(--color-input-bg)",
              color: "var(--color-text-primary)",
              fontSize: "16px",
              outline: "none",
              boxSizing: "border-box",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
              transition: "border-color 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--color-sage)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(0, 0, 0, 0.1)"}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8 }}>
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px 20px",
              border: "1px solid var(--color-border)",
              borderRadius: "16px",
              background: "var(--color-input-bg)",
              color: "var(--color-text-primary)",
              fontSize: "16px",
              outline: "none",
              boxSizing: "border-box",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
              transition: "border-color 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--color-sage)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(0, 0, 0, 0.1)"}
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "16px 20px",
            background: canSubmit ? "var(--color-sage)" : "rgba(158, 179, 159, 0.4)",
            color: "white",
            border: "none",
            borderRadius: "16px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            boxShadow: canSubmit ? "0 8px 24px rgba(158, 179, 159, 0.3)" : "none"
          }}
        >
          {loading ? "Processing..." : (mode === "login" ? "Sign In" : "Create Account")}
        </button>
      </form>

      <div style={{ marginTop: 24, textAlign: "center", fontSize: 15, color: "var(--color-text-muted)" }}>
        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={toggleMode}
          disabled={loading}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-sage)",
            fontWeight: 700,
            cursor: "pointer",
            padding: 0,
            fontSize: 15
          }}
        >
          {mode === "login" ? "Sign Up" : "Log In"}
        </button>
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Link href="/" style={{ color: "var(--color-slate-blue)", fontSize: 13, textDecoration: "none", fontWeight: 500, opacity: 0.8 }}>
          Cancel & Return Home
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-bg)",
      padding: 20
    }}>
      <div style={{
        width: "100%",
        maxWidth: 440,
        background: "var(--color-card-bg)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: "1px solid var(--color-border-light)",
        borderRadius: 32,
        padding: "48px 36px",
        boxShadow: "var(--shadow-glass)"
      }}>
        <Suspense fallback={<div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>Loading Authentication...</div>}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
