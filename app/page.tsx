"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "Parent" | "Teacher" | "Relative";
type User = { name: string; role: Role };

const USER_KEY = "zeyin.user.v1";

function getUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
  }, [router]);

  if (!user) return null; // пока редиректится

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Zeyin</h1>
      <p style={{ opacity: 0.8, marginBottom: 18 }}>Подтверждение входа</p>

      <div
        style={{
          border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(255,255,255,.04)",
          borderRadius: 16,
          padding: 16,
          marginBottom: 18,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800 }}>
          ✅ Ты вошёл как: {user.name}
        </div>
        <div style={{ opacity: 0.85 }}>Роль: {user.role}</div>

        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <Link
            href="/focus"
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: "#6d28d9",
              color: "white",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Открыть Focus
          </Link>

          <Link
            href="/community"
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.16)",
              color: "white",
              textDecoration: "none",
              fontWeight: 800,
              opacity: 0.9,
            }}
          >
            Открыть Community
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem(USER_KEY);
              router.replace("/login");
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.16)",
              background: "transparent",
              color: "white",
              fontWeight: 800,
              cursor: "pointer",
              opacity: 0.9,
            }}
          >
            Выйти
          </button>
        </div>
      </div>

      <div style={{ opacity: 0.75 }}>
        Если обновишь страницу — вход сохранится (в localStorage).
      </div>
    </div>
  );
}
