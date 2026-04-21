"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useFocusSystem } from "@/app/lib/useFocusSystem";
import { useTimer } from "@/app/lib/useTimer";
import FocusKeeperBar from "@/app/components/FocusKeeperBar";
import { MonsterWidget } from "@/app/components/MonsterWidget";
import { useMonsterEngine } from "@/app/lib/useMonsterEngine";

type ActiveQuest = {
  title: string;
  level: string;
  minutes: number;
  xp: number;
  steps: string[];
};

type Quest = {
  id: string;
  title: string;
  desc: string;
};

type SessionPreset = 5 | 10 | 15 | 25;

const ACTIVE_QUEST_KEY = "zeyin.activeQuest.v1";
const XP_KEY = "zeyin.xp.v1";
const LS_KEY = "zeyin.focus.sessions.v1";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const QUESTS: Quest[] = [
  { id: "breath", title: "10-second breathing", desc: "Inhale 4s → exhale 6s (1 cycle)." },
  { id: "posture", title: "Posture", desc: "Straighten your back, drop your shoulders." },
  { id: "reset", title: "Reset", desc: "Remove 1 distraction (phone/tab)." },
  { id: "goal", title: "1 goal", desc: "Ask yourself: what am I finishing in these minutes?" },
  { id: "eyes", title: "Eyes", desc: "20–20–20: look far away for 20 seconds." },
  { id: "micro", title: "Micro-step", desc: "Take the tiniest next step (30 sec)." },
];

export default function FocusPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Focus system (centralized logic)
  const focus = useFocusSystem();
  const monsterEngine = useMonsterEngine();

  // XP + active quest (legacy storage for other parts of the app)
  const [activeQuest, setActiveQuest] = useState<ActiveQuest | null>(null);

  // timer
  const [preset, setPreset] = useState<SessionPreset>(10);
  const timer = useTimer(preset * 60);
  const { totalSec, leftSec, running } = timer;

  // micro-quests during focus session
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [questOpen, setQuestOpen] = useState(false);

  // reflection
  const [rating, setRating] = useState<number>(4);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  const lastQuestAtRef = useRef<number>(0);
  const startedAtRef = useRef<number | null>(null);

  const progress = useMemo(() => {
    const spent = totalSec - leftSec;
    if (totalSec === 0) return 0;
    return Math.min(100, Math.max(0, (spent / totalSec) * 100));
  }, [totalSec, leftSec]);

  // how often to show micro-quest (sec)
  const questIntervalSec = useMemo(() => {
    if (totalSec <= 5 * 60) return 120;
    if (totalSec <= 10 * 60) return 180;
    return 240;
  }, [totalSec]);

  const stopTimer = () => timer.stopTimer();

  const startTimer = () => {
    if (!startedAtRef.current) startedAtRef.current = Date.now();
    timer.startTimer(() => {
      setDone(true);
      setQuestOpen(false);
    });
  };

  const reset = () => {
    timer.stopTimer();
    // If a running session was interrupted before completion, mark as missed
    if (running && leftSec > 0) {
      focus.onSessionMissed();
    }
    monsterEngine.onTimerReset();
    timer.resetTimer();
    setDone(false);
    setQuestOpen(false);
    setCurrentQuest(null);
    lastQuestAtRef.current = 0;
    startedAtRef.current = null;
    setNote("");
    setRating(4);
  };

  const pickQuest = () => {
    const q = QUESTS[Math.floor(Math.random() * QUESTS.length)];
    setCurrentQuest(q);
    setQuestOpen(true);
    focus.onMicroTask();
    // inform monster engine
    monsterEngine.onMicroQuest();
  };

  // init: XP, activeQuest, m из URL
  useEffect(() => {
    // legacy XP key is no longer primary (focus system manages XP)

    // activeQuest
    try {
      const raw = localStorage.getItem(ACTIVE_QUEST_KEY);
      const q = raw ? (JSON.parse(raw) as ActiveQuest) : null;
      if (q) setActiveQuest(q);
    } catch {}

    // m from URL
    const mRaw = searchParams.get("m");
    const m = mRaw ? Number(mRaw) : null;

    // priority: m, otherwise minutes from activeQuest (if present)
    let minutes: number | null = null;
    if (m && Number.isFinite(m) && m > 0) minutes = m;

    // if no m, try to get minutes from localStorage activeQuest
    if (!minutes) {
      try {
        const raw = localStorage.getItem(ACTIVE_QUEST_KEY);
        const q = raw ? (JSON.parse(raw) as ActiveQuest) : null;
        if (q?.minutes && Number.isFinite(q.minutes) && q.minutes > 0) minutes = q.minutes;
      } catch {}
    }

    if (minutes) {
      const sec = Math.round(minutes * 60);
      timer.setTime(sec);
      setDone(false);
      setQuestOpen(false);
      setCurrentQuest(null);
      lastQuestAtRef.current = 0;
      startedAtRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // if you change preset with buttons — reset
  useEffect(() => {
    timer.setTime(preset * 60);
    setDone(false);
    setQuestOpen(false);
    setCurrentQuest(null);
    lastQuestAtRef.current = 0;
    startedAtRef.current = null;
  }, [preset]);

  // micro-quests logic
  useEffect(() => {
    if (!running) return;

    const elapsed = totalSec - leftSec;
    const sinceLast = elapsed - lastQuestAtRef.current;

    if (!questOpen && leftSec > 15 && sinceLast >= questIntervalSec) {
      lastQuestAtRef.current = elapsed;
      pickQuest();
    }
  }, [running, leftSec, totalSec, questIntervalSec, questOpen]);

  // Read derived values from the centralized focus system
  const { state: focusState, xpNext } = focus;

  const saveResult = () => {
    const spent = totalSec - leftSec;
    const payload = {
      id: uid(),
      createdAt: new Date().toISOString(),
      presetMin: totalSec / 60,
      spentSec: spent,
      rating,
      note: note.trim(),
      quest: activeQuest ? { title: activeQuest.title, xp: activeQuest.xp, minutes: activeQuest.minutes } : null,
    };

    try {
      const raw = localStorage.getItem(LS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift(payload);
      localStorage.setItem(LS_KEY, JSON.stringify(arr.slice(0, 50)));
    } catch {}

    // Inform focus system about completion/missed
    if (leftSec === 0) {
      // complete session
      focus.onSessionComplete(totalSec / 60);
      // also award legacy quest XP if present
      if (activeQuest) {
        focus.gainXp && focus.gainXp(activeQuest.xp);
        try { localStorage.removeItem(ACTIVE_QUEST_KEY); } catch {}
        setActiveQuest(null);
      }
      // reflect completion to monster engine
      monsterEngine.setFocusRunning(false);
    } else {
      // not finished -> counted as missed
      focus.onSessionMissed();
      monsterEngine.setFocusRunning(false);
    }

    setDone(true);
  };

  const clearQuest = () => {
    try {
      localStorage.removeItem(ACTIVE_QUEST_KEY);
    } catch {}
    setActiveQuest(null);
  };

  return (
    <>
      {/* Top: title + FocusKeeperBar */}
      <div style={{ minHeight: "120px", padding: "16px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: 6 }}>Focus Therapy</h1>
              <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: 0 }}>Timer + micro-quests, no streak pressure.</p>
            </div>
            <div style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>XP: {focusState.xp}</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <FocusKeeperBar />
          </div>
        </div>
      </div>

      <div style={{ minHeight: "calc(100vh - 80px)", padding: "32px 24px" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", display: "grid", gap: "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: 6 }}>Focus Therapy</h1>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: 0 }}>Timer + micro-quests, no streak pressure.</p>
          </div>
          <div style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>XP: {focusState.xp}</div>
        </div>

        <div className="card card-lg" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>Need a structured focus plan?</div>
            <div style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
              Try the Plan → Do → Reflect flow for focus training and routine support.
            </div>
          </div>
          <Link
            href="/therapy/start"
            className="btn btn-primary btn-sm"
          >
            Start therapy
          </Link>
        </div>

        {activeQuest && (
          <div className="card card-lg">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                {activeQuest.title} • {activeQuest.minutes} min • +{activeQuest.xp} XP
              </div>
              <button
                onClick={clearQuest}
                className="btn btn-ghost btn-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Clear
              </button>
            </div>
            <ol style={{ listStylePosition: "inside", margin: 0, paddingLeft: "12px", display: "grid", gap: "4px", fontSize: "14px", color: "var(--color-text-secondary)" }}>
              {activeQuest.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Presets */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[5, 10, 15, 25].map((m) => (
            <button
              key={m}
              onClick={() => setPreset(m as SessionPreset)}
              disabled={running}
              title={running ? "Pause first" : ""}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                border: "1px solid",
                background: preset === m ? "rgba(56,189,248,0.1)" : "transparent",
                borderColor: preset === m ? "rgba(56,189,248,0.3)" : "var(--color-border)",
                color: preset === m ? "var(--color-primary)" : "var(--color-text-secondary)",
                cursor: running ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: running ? 0.5 : 1,
              }}
            >
              {m} min
            </button>
          ))}
          <button
            onClick={() => router.push("/quest")}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              border: "1px solid var(--color-border)",
              background: "transparent",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Quests →
          </button>
        </div>

        {/* Sleek Soft Glassmorphic Focus Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px", maxWidth: 400, margin: "0 auto", gap: 32, textAlign: "center", background: "rgba(255,255,255,0.7)" }}>
           
           <div style={{ width: 140, height: 140, borderRadius: "50%", background: "var(--color-sage-bg)", display: "grid", placeItems: "center", position: "relative", boxShadow: "inset 0 0 20px rgba(158, 179, 159, 0.4), 0 10px 30px rgba(158, 179, 159, 0.15)" }}>
              <img src="https://api.dicebear.com/7.x/fun-emoji/svg?seed=felix&backgroundColor=b4c7b5" alt="Focus Guardian" style={{ width: 140, height: 140, objectFit: "cover", borderRadius: "50%", mixBlendMode: "multiply", animation: running ? "breathe 3s ease-in-out infinite alternate" : "none" }} />
              <div style={{ position: "absolute", bottom: -8, right: -12, background: "white", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700, color: "var(--color-sage)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)" }}>Lvl {(focusState as any)?.level || 1}</div>
           </div>
           
           <div style={{ position: "relative", width: 220, height: 220, display: "grid", placeItems: "center" }}>
              <svg width="220" height="220" style={{ transform: "rotate(-90deg)", position: "absolute" }}>
                <circle cx="110" cy="110" r="100" stroke="rgba(0,0,0,0.03)" strokeWidth="6" fill="none" />
                <circle cx="110" cy="110" r="100" stroke="var(--color-slate-blue)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * 100} strokeDashoffset={2 * Math.PI * 100 - (progress / 100) * (2 * Math.PI * 100)} style={{ transition: "stroke-dashoffset 1s linear" }} />
              </svg>
              <div style={{ display: "grid", gap: 4 }}>
                 <div style={{ fontSize: "56px", fontWeight: "300", color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>{formatTime(leftSec)}</div>
                 <div style={{ fontSize: "12px", color: "var(--color-slate-blue)", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>Focus Session</div>
              </div>
           </div>

            <div style={{ display: "flex", gap: "16px", marginTop: "8px", alignItems: "center" }}>
              {!running ? (
                 <button onClick={startTimer} className="btn btn-primary" style={{ width: "160px", background: "var(--color-slate-blue)", boxShadow: "0 8px 24px var(--color-slate-blue-bg)" }}>Start Focus</button>
              ) : (
                 <button onClick={stopTimer} className="btn btn-secondary" style={{ width: "160px", color: "var(--color-terracotta)", borderColor: "var(--color-terracotta-bg)" }}>Pause</button>
              )}
              <button onClick={reset} style={{ width: "48px", height: "48px", borderRadius: "50%", background: "white", color: "var(--color-text-secondary)", display: "grid", placeItems: "center", border: "1px solid var(--color-border)", cursor: "pointer", boxShadow: "var(--shadow-sm)" }} title="Reset">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
              </button>
            </div>
        </div>

        {/* Quest modal */}
        {questOpen && currentQuest && (
          <div className="card card-lg" style={{ backgroundColor: "rgba(56, 189, 248, 0.05)", borderColor: "rgba(56, 189, 248, 0.2)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)" }}>{currentQuest.title}</div>
                <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "4px" }}>{currentQuest.desc}</div>
              </div>
              <button
                onClick={() => setQuestOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Finish / reflection */}
        {done && (
          <div className="card card-lg" style={{ display: "grid", gap: "12px" }}>
            <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>Session complete</div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}>
              <label style={{ color: "var(--color-text-secondary)" }}>Rating:</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="input"
                style={{ width: "auto", maxWidth: "120px" }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="One line: what helped / what hindered?"
              className="textarea"
            />

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={saveResult}
                className="btn btn-primary btn-sm"
              >
                Save reflection
              </button>
              <button
                onClick={reset}
                className="btn btn-ghost btn-sm"
              >
                New session
              </button>
            </div>

            <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              XP is awarded only if timer reached 0 and active quest was selected from Quests.
            </div>
          </div>
        )}
        </div>
      </div>
      {/* Floating Monster widget */}
      <MonsterWidget />
    </>
  );
}
