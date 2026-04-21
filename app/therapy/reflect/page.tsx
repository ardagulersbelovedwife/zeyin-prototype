"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  addQuestXp,
  clearTherapyDraft,
  loadTherapyDraft,
  saveTherapySession,
  type TherapySession,
  type TherapySessionDraft,
} from "@/lib/therapyStore";
import { TherapyShell } from "@/app/components/TherapyShell";
import { useFocusSystem } from "@/app/lib/useFocusSystem";

function uid() {
  return crypto.randomUUID();
}

export default function TherapyReflectPage() {
  const focus = useFocusSystem();
  const [draft, setDraft] = useState<TherapySessionDraft | null>(null);
  const [focusRating, setFocusRating] = useState(4);
  const [stressRating, setStressRating] = useState(2);
  const [helped, setHelped] = useState("");
  const [blocked, setBlocked] = useState("");
  const [changeNext, setChangeNext] = useState("");
  const [savedSession, setSavedSession] = useState<TherapySession | null>(null);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(loadTherapyDraft());
  }, []);

  const parentSummary = useMemo(() => {
    if (!savedSession) return "";
    const lines = [
      `What was practiced: ${savedSession.goal || "focus training"}.`,
      `Time spent: ${savedSession.minutes} minutes (${savedSession.difficulty} difficulty).`,
      `Positive reinforcement idea: “I saw you finish ${savedSession.nextStep}. That kind of effort builds focus skills.”`,
    ];
    return lines.join("\n");
  }, [savedSession]);

  const canSave = useMemo(() => {
    return (
      helped.trim().length >= 2 &&
      blocked.trim().length >= 2 &&
      changeNext.trim().length >= 2
    );
  }, [helped, blocked, changeNext]);

  const handleSave = async () => {
    if (!draft || !canSave || saving) return;
    setSaving(true);

    const session: TherapySession = {
      id: uid(),
      createdAt: new Date().toISOString(),
      goal: draft.goal,
      task: draft.task,
      nextStep: draft.nextStep,
      minutes: draft.minutes,
      difficulty: draft.difficulty,
      interventionsUsed: draft.interventionsUsed,
      focusRating,
      stressRating,
      helped: helped.trim(),
      blocked: blocked.trim(),
      changeNext: changeNext.trim(),
      completed: true,
      questTitle: draft.questTitle,
      questXp: draft.questXp,
    };

    await saveTherapySession(session);
    clearTherapyDraft();
    setSavedSession(session);
    focus.onReflectComplete();

    if (draft.startedFromQuest && draft.questXp) {
      const total = addQuestXp(draft.questXp);
      setXpAwarded(total);
    }

    setSaving(false);
  };

  const handleCopy = async () => {
    if (!parentSummary) return;
    try {
      await navigator.clipboard.writeText(parentSummary);
    } catch {
      // ignore clipboard issues
    }
  };

  if (!draft && !savedSession) {
    return (
      <TherapyShell
        title="Reflect"
        subtitle="Complete a session before reflecting."
        backHref="/therapy/start"
      >
        <div style={{ background: "var(--color-card-bg)", padding: 24, borderRadius: 16, border: "1px solid var(--color-border)", color: "var(--color-text-secondary)", fontWeight: 300, fontSize: 15 }}>
          No session data found. Start a focus training session first.
        </div>
      </TherapyShell>
    );
  }

  return (
    <TherapyShell
      title="Reflect"
      subtitle="Rate the session, capture what worked, and decide what to change."
      backHref="/therapy/do"
    >
      {!savedSession && draft && (
        <div style={{ background: "var(--color-card-bg)", padding: 32, borderRadius: 20, border: "1px solid var(--color-border)", display: "grid", gap: 12, fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 300 }}>
          <div style={{ color: "var(--color-text-primary)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Session summary</div>
          <div>Goal: <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{draft.goal}</span></div>
          <div>Task: <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{draft.task}</span></div>
          <div>Tiny next step: <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{draft.nextStep}</span></div>
          <div>Duration: <span style={{ color: "var(--color-text-primary)" }}>{draft.minutes} min</span></div>
          <div>Interventions: <span style={{ color: "var(--color-accent)", fontWeight: 500 }}>{draft.interventionsUsed.length}</span></div>
        </div>
      )}

      {!savedSession && draft && (
        <div style={{ background: "var(--color-card-bg)", padding: 32, borderRadius: 20, border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "grid", gap: 20 }}>
            <label style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500, display: "grid", gap: 8 }}>
              Focus rating (1-5)
              <select
                value={focusRating}
                onChange={(event) => setFocusRating(Number(event.target.value))}
                style={{ height: 44, borderRadius: 12, border: "1px solid rgba(0,0,0,0.05)", background: "white", padding: "0 16px", color: "var(--color-text-primary)", outline: "none", fontSize: 14, width: "100%", transition: "all 0.2s", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.01)" }}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value} style={{ color: "var(--color-text-primary)" }}>{value}</option>
                ))}
              </select>
            </label>
            <label style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500, display: "grid", gap: 8 }}>
              Stress rating (1-5)
              <select
                value={stressRating}
                onChange={(event) => setStressRating(Number(event.target.value))}
                style={{ height: 44, borderRadius: 12, border: "1px solid rgba(0,0,0,0.05)", background: "white", padding: "0 16px", color: "var(--color-text-primary)", outline: "none", fontSize: 14, width: "100%", transition: "all 0.2s", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.01)" }}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value} style={{ color: "var(--color-text-primary)" }}>{value}</option>
                ))}
              </select>
            </label>
            <label style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500, display: "grid", gap: 8 }}>
              What helped
              <input
                value={helped}
                onChange={(event) => setHelped(event.target.value)}
                placeholder="Breathing reset + clear desk"
                style={{ height: 44, borderRadius: 12, border: "1px solid rgba(0,0,0,0.05)", background: "white", padding: "0 16px", color: "var(--color-text-primary)", outline: "none", fontSize: 14, width: "100%", transition: "all 0.2s", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.01)" }}
                onFocus={e => e.currentTarget.style.borderColor = "var(--color-sage)"}
                onBlur={e => e.currentTarget.style.borderColor = "var(--color-border)"}
              />
            </label>
            <label style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500, display: "grid", gap: 8 }}>
              What blocked
              <input
                value={blocked}
                onChange={(event) => setBlocked(event.target.value)}
                placeholder="Phone notifications"
                style={{ height: 44, borderRadius: 12, border: "1px solid rgba(0,0,0,0.05)", background: "white", padding: "0 16px", color: "var(--color-text-primary)", outline: "none", fontSize: 14, width: "100%", transition: "all 0.2s", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.01)" }}
                onFocus={e => e.currentTarget.style.borderColor = "var(--color-sage)"}
                onBlur={e => e.currentTarget.style.borderColor = "var(--color-border)"}
              />
            </label>
            <label style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500, display: "grid", gap: 8 }}>
              Next time change
              <input
                value={changeNext}
                onChange={(event) => setChangeNext(event.target.value)}
                placeholder="Put phone in another room"
                style={{ height: 44, borderRadius: 12, border: "1px solid rgba(0,0,0,0.05)", background: "white", padding: "0 16px", color: "var(--color-text-primary)", outline: "none", fontSize: 14, width: "100%", transition: "all 0.2s", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.01)" }}
                onFocus={e => e.currentTarget.style.borderColor = "var(--color-sage)"}
                onBlur={e => e.currentTarget.style.borderColor = "var(--color-border)"}
              />
            </label>
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            style={{
              height: 48,
              borderRadius: 16,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              transition: "all 0.2s ease",
              cursor: (!canSave || saving) ? "not-allowed" : "pointer",
              background: (!canSave || saving) ? "rgba(0,0,0,0.05)" : "var(--color-sage)",
              color: (!canSave || saving) ? "var(--color-text-muted)" : "white",
              border: (!canSave || saving) ? "none" : "1px solid var(--color-sage)",
            }}
          >
            {saving ? "Saving..." : "Save Session"}
          </button>
        </div>
      )}

      {savedSession && (
        <div style={{ background: "var(--color-card-bg)", padding: 32, borderRadius: 20, border: "1px solid var(--color-border)", display: "grid", gap: 16 }}>
          <div style={{ color: "var(--color-text-primary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Parent summary</div>
          <div style={{ fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 300, whiteSpace: "pre-line", lineHeight: 1.6 }}>
            {parentSummary}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginTop: 8 }}>
            <button
              onClick={handleCopy}
              style={{ padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)", borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}
            >
              Copy summary
            </button>
            {xpAwarded !== null && (
              <span style={{ fontSize: 14, color: "var(--color-success)", fontWeight: 500 }}>
                +{savedSession.questXp} XP earned · Total XP: {xpAwarded}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 12, letterSpacing: "0.02em" }}>
            This summary is designed for routine support and skills practice. Avoid medical claims.
          </div>
          <Link
            href="/therapy"
            style={{ display: "inline-flex", alignItems: "center", fontSize: 13, color: "var(--color-text-secondary)", textDecoration: "none", marginTop: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}
          >
            Back to Therapy home →
          </Link>
        </div>
      )}
    </TherapyShell>
  );
}
