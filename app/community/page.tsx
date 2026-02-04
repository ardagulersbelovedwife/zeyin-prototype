"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate, useAuthGuardContext } from "@/app/components/AuthGate";
import type { ProfileRole } from "@/lib/useAuthGuard";

type Post = {
  id: string;
  author: string;
  role: ProfileRole;
  text: string;
  createdAt: number;
};

const LS_POSTS = "zeyin.community.posts.v1";

function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  return `${d} дн назад`;
}

function safeAuthor(a: string) {
  const v = (a ?? "").trim();
  return v.length ? v : "Unknown";
}

function CommunityContent() {
  const { profile, logout } = useAuthGuardContext();
  const [author, setAuthor] = useState("");
  const [role, setRole] = useState<ProfileRole>("Parent");
  const [text, setText] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setAuthor(profile.name);
    setRole(profile.role);
  }, [profile]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_POSTS);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Post>[];
        setPosts(
          parsed.map((p) => ({
            id: String(p.id ?? crypto.randomUUID()),
            author: safeAuthor(String(p.author ?? "Unknown")),
            role: (p.role as ProfileRole) ?? "Parent",
            text: String(p.text ?? ""),
            createdAt: Number(p.createdAt ?? Date.now()),
          }))
        );
        return;
      }
    } catch {}

    const seed: Post[] = [
      {
        id: crypto.randomUUID(),
        author: "Мама",
        role: "Parent",
        text: "Я увидела, что ты сделал фокус-квест — дальше будет легче ❤️",
        createdAt: Date.now() - 1000 * 60 * 25,
      },
      {
        id: crypto.randomUUID(),
        author: "Учитель",
        role: "Teacher",
        text: "Завтра повтори 10 минут — это уже победа.",
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
      },
      {
        id: crypto.randomUUID(),
        author: "Тётя",
        role: "Relative",
        text: "Маленькие шаги каждый день дают большой результат.",
        createdAt: Date.now() - 1000 * 60 * 60 * 6,
      },
    ];
    setPosts(seed);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_POSTS, JSON.stringify(posts));
    } catch {}
  }, [posts]);

  const canPost = useMemo(() => text.trim().length >= 5, [text]);

  function addPost() {
    if (!canPost) return;
    const p: Post = {
      id: crypto.randomUUID(),
      author: safeAuthor(author),
      role,
      text: text.trim(),
      createdAt: Date.now(),
    };
    setPosts((prev) => [p, ...prev]);
    setText("");
  }

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    logout();
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 6 }}>
            Community
          </h1>
          <div style={{ opacity: 0.8, marginBottom: 18 }}>
            Поддержка вместо "ты опять забыл". Сообщения видит ребёнок внутри
            приложения.
          </div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>
            {profile.name} · {profile.role}
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            height: 40,
            padding: "0 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.15)",
            background: loggingOut
              ? "rgba(255,255,255,.08)"
              : "#ef4444",
            color: "white",
            fontWeight: 900,
            cursor: loggingOut ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {loggingOut ? "LOGGING OUT…" : "LOG OUT"}
        </button>
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(255,255,255,.04)",
          borderRadius: 18,
          padding: 16,
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Имя"
            style={{
              height: 40,
              padding: "0 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.15)",
              background: "rgba(0,0,0,.25)",
              color: "white",
              outline: "none",
              minWidth: 180,
            }}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as ProfileRole)}
            style={{
              height: 40,
              padding: "0 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.15)",
              background: "rgba(0,0,0,.25)",
              color: "white",
              outline: "none",
            }}
          >
            <option value="Parent">Parent</option>
            <option value="Teacher">Teacher</option>
            <option value="Relative">Relative</option>
          </select>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напиши поддерживающее сообщение…"
          rows={3}
          style={{
            width: "100%",
            marginTop: 10,
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.15)",
            background: "rgba(0,0,0,.25)",
            color: "white",
            outline: "none",
            resize: "vertical",
            lineHeight: 1.4,
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 10,
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ opacity: 0.7, fontSize: 13 }}>
            Совет: пиши про действие ("ты сделал 10 минут фокуса"), а не про
            личность.
          </div>
          <button
            onClick={addPost}
            disabled={!canPost}
            style={{
              height: 40,
              padding: "0 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.15)",
              background: canPost ? "#6d28d9" : "rgba(255,255,255,.08)",
              color: "white",
              fontWeight: 800,
              cursor: canPost ? "pointer" : "not-allowed",
              opacity: canPost ? 1 : 0.6,
              whiteSpace: "nowrap",
            }}
          >
            Опубликовать
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {posts.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid rgba(255,255,255,.12)",
              background: "rgba(255,255,255,.04)",
              borderRadius: 18,
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                    background: "rgba(124,58,237,.35)",
                    border: "1px solid rgba(124,58,237,.55)",
                  }}
                >
                  {safeAuthor(p.author).slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 900 }}>
                    {safeAuthor(p.author)}{" "}
                    <span style={{ opacity: 0.7, fontWeight: 600 }}>
                      · {p.role}
                    </span>
                  </div>
                  <div style={{ opacity: 0.65, fontSize: 13 }}>
                    {timeAgo(p.createdAt)}
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  setPosts((prev) => prev.filter((x) => x.id !== p.id))
                }
                style={{
                  height: 34,
                  padding: "0 10px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(255,255,255,.06)",
                  color: "white",
                  cursor: "pointer",
                }}
                title="Удалить (демо)"
              >
                ✕
              </button>
            </div>
            <div style={{ marginTop: 10, opacity: 0.92, lineHeight: 1.5 }}>
              {p.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <AuthGate>
      <CommunityContent />
    </AuthGate>
  );
}
