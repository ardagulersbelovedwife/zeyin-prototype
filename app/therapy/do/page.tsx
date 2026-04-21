"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadTherapyDraft,
  saveTherapyDraft,
  type TherapySessionDraft,
} from "@/lib/therapyStore";
import {
  MicroInterventionModal,
  type MicroIntervention,
} from "@/app/components/MicroInterventionModal";
import { TherapyShell } from "@/app/components/TherapyShell";
import { useFocusSystem } from "@/app/lib/useFocusSystem";
import { useMonsterEngine } from "@/app/lib/useMonsterEngine";
import { useTimer } from "@/app/lib/useTimer";

const INTERVENTIONS: MicroIntervention[] = [
  {
    id: "breathing",
    title: "Breathing 4-6",
    description: "Slow the body down to reset attention.",
    prompt: "Breathe in for 4 seconds, out for 6. Repeat 4 cycles and notice your shoulders drop.",
  },
  {
    id: "remove-distraction",
    title: "Remove distraction",
    description: "Make the next 5 minutes easier by clearing one distraction.",
    prompt: "Close one extra tab, silence the phone, or move it away. Say what you removed.",
  },
  {
    id: "name-step",
    title: "Name the next step",
    description: "Clarify the immediate action to reduce mental load.",
    prompt: "Say out loud: “Next, I will ___.” Keep it to one verb and one object.",
  },
  {
    id: "posture-reset",
    title: "Posture reset",
    description: "Align posture to support focus and breathing.",
    prompt: "Feet on the floor, shoulders back, chin slightly tucked. Hold for 3 breaths.",
  },
  {
    id: "eyes",
    title: "20-20-20 eyes",
    description: "Reduce visual fatigue to keep attention steady.",
    prompt: "Look at something 20 feet away for 20 seconds. Then return to the task.",
  },
  {
    id: "if-then",
    title: "If-Then plan",
    description: "Pre-plan a response to distraction or stuck moments.",
    prompt: "If I feel stuck, then I will ___ (e.g., reread the last line or set a 2-minute mini timer).",
  },
];

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function TherapyDoPage() {
  const router = useRouter();
  const focus = useFocusSystem();
  const monsterEngine = useMonsterEngine();
  const [draft, setDraft] = useState<TherapySessionDraft | null>(null);

  const timer = useTimer(0);
  const { totalSec, leftSec, running } = timer;
  const [interventionsUsed, setInterventionsUsed] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIntervention, setCurrentIntervention] =
    useState<MicroIntervention | null>(null);

  const lastInterventionAtRef = useRef(0);
  const resumeAfterModalRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    const stored = loadTherapyDraft();
    if (!stored) return;
    setDraft(stored);
    timer.setTime(stored.minutes * 60);
    setInterventionsUsed(stored.interventionsUsed ?? []);
  }, []);

  useEffect(() => {
    if (!draft) return;
    saveTherapyDraft({
      ...draft,
      interventionsUsed,
    });
  }, [draft, interventionsUsed]);

  const intervalSec = useMemo(() => {
    if (totalSec <= 5 * 60) return 120;
    if (totalSec <= 10 * 60) return 180;
    return 240;
  }, [totalSec]);

  const progress = useMemo(() => {
    if (totalSec === 0) return 0;
    return Math.min(100, Math.max(0, ((totalSec - leftSec) / totalSec) * 100));
  }, [totalSec, leftSec]);

  const stopTimer = () => timer.stopTimer();
  const startTimer = () => timer.startTimer();

  useEffect(() => {
    if (!running) return;
    const elapsed = totalSec - leftSec;
    const sinceLast = elapsed - lastInterventionAtRef.current;

    if (!modalOpen && leftSec > 15 && sinceLast >= intervalSec) {
      lastInterventionAtRef.current = elapsed;
      const unused = INTERVENTIONS.filter(
        (item) => !interventionsUsed.includes(item.title)
      );
      const pickFrom = unused.length > 0 ? unused : INTERVENTIONS;
      const next = pickFrom[Math.floor(Math.random() * pickFrom.length)];
      setCurrentIntervention(next);
      resumeAfterModalRef.current = running;
      stopTimer();
      setModalOpen(true);
      monsterEngine.onMicroQuest();
    }
  }, [running, leftSec, totalSec, modalOpen, intervalSec, interventionsUsed]);

  useEffect(() => {
    if (leftSec === 0 && totalSec > 0 && !completedRef.current) {
      completedRef.current = true;
      router.push("/therapy/reflect");
    }
  }, [leftSec, totalSec, router]);

  const handleDoneIntervention = () => {
    if (currentIntervention) {
      setInterventionsUsed((prev) => [currentIntervention.title, ...prev]);
    }
    setModalOpen(false);
    setCurrentIntervention(null);
    focus.onBreathe();
    monsterEngine.runBreathe();
    if (leftSec > 0 && resumeAfterModalRef.current) {
      startTimer();
    }
  };

  const resetSession = () => {
    timer.resetTimer();
    setInterventionsUsed([]);
    setModalOpen(false);
    setCurrentIntervention(null);
    lastInterventionAtRef.current = 0;
    completedRef.current = false;
  };

  if (!draft) {
    return (
      <TherapyShell
        title="Do"
        subtitle="Start with a Plan step before the timer."
        backHref="/therapy/start"
      >
        <div style={{ background: "var(--color-card-bg)", padding: 24, borderRadius: 16, border: "1px solid var(--color-border)", color: "var(--color-text-secondary)", fontWeight: 300, fontSize: 15 }}>
          No active plan found. Start a new focus training session to continue.
        </div>
      </TherapyShell>
    );
  }

  return (
    <TherapyShell
      title="Do"
      subtitle="Follow the timer and complete each micro-intervention before resuming."
      backHref="/therapy/start"
      badge={`${draft.minutes} MIN. SCHEDULE`}
    >
      <div style={{ background: "var(--color-card-bg)", padding: 32, borderRadius: 20, border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Time Left</div>
            <div style={{ fontSize: 64, fontWeight: 300, color: "var(--color-text-primary)", lineHeight: 1, letterSpacing: "0.02em" }}>
              {formatTime(leftSec)}
            </div>
            <div style={{ display: "grid", gap: 6, marginTop: 24, fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 300 }}>
              <div>Goal: <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{draft.goal}</span></div>
              <div>Next step: <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{draft.nextStep}</span></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {!running ? (
              <button
                onClick={startTimer}
                style={{ padding: "12px 24px", background: "var(--color-text-primary)", color: "var(--color-bg)", borderRadius: 16, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase" }}
              >
                START
              </button>
            ) : (
              <button
                onClick={stopTimer}
                style={{ padding: "12px 24px", background: "white", border: "1px solid rgba(0,0,0,0.05)", color: "var(--color-sage)", borderRadius: 16, fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}
              >
                PAUSE
              </button>
            )}
            <button
              onClick={resetSession}
              style={{ padding: "12px 24px", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text-muted)", borderRadius: 16, fontSize: 14, fontWeight: 500, cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase" }}
            >
              RESET
            </button>
          </div>
        </div>

        <div style={{ height: 6, width: "100%", background: "rgba(0,0,0,0.05)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "var(--color-sage)", width: `${progress}%`, transition: "width 1s linear" }} />
        </div>

        <div style={{ padding: 20, background: "white", borderRadius: 16, border: "1px solid rgba(0,0,0,0.04)", fontSize: 13, color: "var(--color-text-primary)", fontWeight: 500, display: "grid", gap: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ color: "var(--color-text-muted)", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Plan Details</div>
          <div>Task: <span style={{ color: "var(--color-text-primary)" }}>{draft.task}</span></div>
          <div>Difficulty: <span style={{ color: "var(--color-text-primary)" }}>{draft.difficulty}</span></div>
          <div>Interventions completed: <span style={{ color: "var(--color-sage)", fontWeight: 600 }}>{interventionsUsed.length}</span></div>
        </div>
      </div>

      <div style={{ background: "var(--color-card-bg)", padding: 24, borderRadius: 20, border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ color: "var(--color-text-primary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 14 }}>Completed Micro-Interventions</div>
        {interventionsUsed.length === 0 ? (
          <div style={{ fontSize: 14, color: "var(--color-text-muted)", fontWeight: 300 }}>
            None yet. The first one will appear a few minutes into the session.
          </div>
        ) : (
          <ul style={{ paddingLeft: 20, fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 300, display: "grid", gap: 6, margin: 0 }}>
            {interventionsUsed.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        )}
      </div>

      <MicroInterventionModal
        open={modalOpen}
        intervention={currentIntervention}
        onDone={handleDoneIntervention}
      />
    </TherapyShell>
  );
}
