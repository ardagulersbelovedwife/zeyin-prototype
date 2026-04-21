"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadTherapySessions, type TherapySession } from "@/lib/therapyStore";
import { TherapyShell } from "@/app/components/TherapyShell";

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TherapyLandingPage() {
  const [sessions, setSessions] = useState<TherapySession[]>([]);

  useEffect(() => {
    setSessions(loadTherapySessions());
  }, []);

  const recent = useMemo(() => sessions.slice(0, 10), [sessions]);

  return (
    <TherapyShell
      title="Focus Therapy"
      subtitle="Guided focus training with a Plan → Do → Reflect structure."
    >
      <div style={{ background: "var(--color-card-bg)", padding: 24, borderRadius: 16, border: "1px solid var(--color-border)", backdropFilter: "blur(12px)", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8, letterSpacing: "0.02em" }}>Plan → Do → Reflect</div>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: 0, fontWeight: 300, lineHeight: 1.5 }}>
              A structured flow for focus training, routine support, and skills practice.
            </p>
          </div>
          <Link
            href="/therapy/start"
            style={{ padding: "12px 24px", background: "white", border: "1px solid rgba(0,0,0,0.05)", color: "var(--color-sage)", borderRadius: 20, fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textDecoration: "none", textTransform: "uppercase", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}
          >
            Start Session
          </Link>
        </div>
        <div style={{ display: "grid", gap: 12, fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 300, letterSpacing: "0.02em" }}>
          <div><strong style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>1) Plan:</strong> set goal, pick task, define the tiny next step.</div>
          <div><strong style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>2) Do:</strong> timer + micro-interventions to reset attention.</div>
          <div><strong style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>3) Reflect:</strong> rate focus + decide what to change next time.</div>
        </div>
      </div>

      <div style={{ background: "var(--color-card-bg)", padding: 24, borderRadius: 16, border: "1px solid var(--color-border)", backdropFilter: "blur(12px)", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontWeight: 500, color: "var(--color-text-primary)", letterSpacing: "0.02em" }}>Recent sessions</div>
          <Link href="/focus" style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Back to Focus
          </Link>
        </div>
        {recent.length === 0 ? (
          <div style={{ fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 300 }}>
            No sessions yet. Start your first focus training session to see progress here.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 0 }}>
            {recent.map((session, idx) => (
              <div
                key={session.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "16px 0",
                  borderTop: idx > 0 ? "1px solid var(--color-border-light)" : "none",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", letterSpacing: "0.02em" }}>
                    {formatDate(session.createdAt)} · {session.minutes} min
                  </div>
                  <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4, fontWeight: 300 }}>
                    {session.goal || session.task || "Focus training"}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <span>Focus: <strong style={{ color: "var(--color-accent)", fontWeight: 500 }}>{session.focusRating}/5</strong></span>
                  <span>Completion: <strong style={{ color: "var(--color-success)", fontWeight: 500 }}>{session.completed ? "Yes" : "No"}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Link
          href="/quest"
          style={{ background: "var(--color-card-bg)", padding: 24, borderRadius: 16, border: "1px solid var(--color-border)", backdropFilter: "blur(12px)", boxShadow: "var(--shadow-sm)", textDecoration: "none" }}
        >
          <div style={{ fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8, letterSpacing: "0.02em" }}>Quests</div>
          <div style={{ fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 300, lineHeight: 1.5 }}>Start from a quest and prefill the therapy plan.</div>
        </Link>
        <Link
          href="/focus"
          style={{ background: "var(--color-card-bg)", padding: 24, borderRadius: 16, border: "1px solid var(--color-border)", backdropFilter: "blur(12px)", boxShadow: "var(--shadow-sm)", textDecoration: "none" }}
        >
          <div style={{ fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8, letterSpacing: "0.02em" }}>Focus timer</div>
          <div style={{ fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 300, lineHeight: 1.5 }}>Need a quick timer? Jump back to Focus mode.</div>
        </Link>
        <Link
          href="/community"
          style={{ background: "var(--color-card-bg)", padding: 24, borderRadius: 16, border: "1px solid var(--color-border)", backdropFilter: "blur(12px)", boxShadow: "var(--shadow-sm)", textDecoration: "none" }}
        >
          <div style={{ fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8, letterSpacing: "0.02em" }}>Community</div>
          <div style={{ fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 300, lineHeight: 1.5 }}>Share parent-friendly summaries and encouragement.</div>
        </Link>
      </div>
    </TherapyShell>
  );
}
