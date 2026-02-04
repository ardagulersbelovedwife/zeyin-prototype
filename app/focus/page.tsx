"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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
  { id: "breath", title: "10 секунд дыхание", desc: "Вдох 4с → выдох 6с (1 цикл)." },
  { id: "posture", title: "Поза", desc: "Выпрями спину, опусти плечи." },
  { id: "reset", title: "Reset", desc: "Убери 1 отвлекающий фактор (телефон/вкладка)." },
  { id: "goal", title: "1 цель", desc: "Скажи себе: что я заканчиваю за эти минуты?" },
  { id: "eyes", title: "Глаза", desc: "20–20–20: 20 сек смотри вдаль." },
  { id: "micro", title: "Микро-шаг", desc: "Сделай самый маленький следующий шаг (30 сек)." },
];

export default function FocusPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // XP + активный квест
  const [activeQuest, setActiveQuest] = useState<ActiveQuest | null>(null);
  const [xpTotal, setXpTotal] = useState<number>(0);

  // таймер
  const [preset, setPreset] = useState<SessionPreset>(10);
  const [totalSec, setTotalSec] = useState<number>(preset * 60);
  const [leftSec, setLeftSec] = useState<number>(preset * 60);
  const [running, setRunning] = useState(false);

  // micro-quests внутри фокуса
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [questOpen, setQuestOpen] = useState(false);

  // reflection
  const [rating, setRating] = useState<number>(4);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  const tickRef = useRef<number | null>(null);
  const lastQuestAtRef = useRef<number>(0);
  const startedAtRef = useRef<number | null>(null);

  const progress = useMemo(() => {
    const spent = totalSec - leftSec;
    if (totalSec === 0) return 0;
    return Math.min(100, Math.max(0, (spent / totalSec) * 100));
  }, [totalSec, leftSec]);

  // как часто показывать micro-quest (сек)
  const questIntervalSec = useMemo(() => {
    if (totalSec <= 5 * 60) return 120;
    if (totalSec <= 10 * 60) return 180;
    return 240;
  }, [totalSec]);

  const stopTimer = () => {
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = null;
    setRunning(false);
  };

  const startTimer = () => {
    if (running) return;
    setRunning(true);
    if (!startedAtRef.current) startedAtRef.current = Date.now();

    tickRef.current = window.setInterval(() => {
      setLeftSec((prev) => {
        if (prev <= 1) {
          if (tickRef.current) window.clearInterval(tickRef.current);
          tickRef.current = null;
          setRunning(false);
          setDone(true);
          setQuestOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const reset = () => {
    stopTimer();
    setLeftSec(totalSec);
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
  };

  // init: XP, activeQuest, m из URL
  useEffect(() => {
    // XP
    try {
      const rawXp = localStorage.getItem(XP_KEY);
      setXpTotal(rawXp ? Number(rawXp) : 0);
    } catch {}

    // activeQuest
    try {
      const raw = localStorage.getItem(ACTIVE_QUEST_KEY);
      const q = raw ? (JSON.parse(raw) as ActiveQuest) : null;
      if (q) setActiveQuest(q);
    } catch {}

    // m from URL
    const mRaw = searchParams.get("m");
    const m = mRaw ? Number(mRaw) : null;

    // приоритет: m, иначе minutes из activeQuest (если есть)
    let minutes: number | null = null;
    if (m && Number.isFinite(m) && m > 0) minutes = m;

    // если m нет, попробуем взять minutes из localStorage activeQuest
    if (!minutes) {
      try {
        const raw = localStorage.getItem(ACTIVE_QUEST_KEY);
        const q = raw ? (JSON.parse(raw) as ActiveQuest) : null;
        if (q?.minutes && Number.isFinite(q.minutes) && q.minutes > 0) minutes = q.minutes;
      } catch {}
    }

    if (minutes) {
      const sec = Math.round(minutes * 60);
      setTotalSec(sec);
      setLeftSec(sec);
      setRunning(false);
      setDone(false);
      setQuestOpen(false);
      setCurrentQuest(null);
      lastQuestAtRef.current = 0;
      startedAtRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // если меняешь preset кнопками — сброс
  useEffect(() => {
    setTotalSec(preset * 60);
    setLeftSec(preset * 60);
    setRunning(false);
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

    // XP начисляем только если дошёл до 0
    if (activeQuest && leftSec === 0) {
      const newXp = xpTotal + activeQuest.xp;
      try {
        localStorage.setItem(XP_KEY, String(newXp));
      } catch {}
      setXpTotal(newXp);

      try {
        localStorage.removeItem(ACTIVE_QUEST_KEY);
      } catch {}
      setActiveQuest(null);
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
    <div className="min-h-[calc(100vh-80px)] px-6 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">Focus Therapy</h1>
            <p className="text-sm text-white/60">Таймер + micro-quests, без streak давления.</p>
          </div>
          <div className="text-white/70 text-sm">XP: {xpTotal}</div>
        </div>

        {activeQuest && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-white font-semibold">
                {activeQuest.title} • {activeQuest.minutes} min • +{activeQuest.xp} XP
              </div>
              <button
                onClick={clearQuest}
                className="px-3 py-2 rounded-lg bg-transparent text-white/70 text-sm border border-white/10 hover:border-white/20 hover:text-white"
              >
                Clear
              </button>
            </div>
            <ol className="list-decimal pl-5 text-white/70 text-sm space-y-1">
              {activeQuest.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Presets */}
        <div className="flex gap-2 flex-wrap">
          {[5, 10, 15, 25].map((m) => (
            <button
              key={m}
              onClick={() => setPreset(m as SessionPreset)}
              className={`px-3 py-2 rounded-lg text-sm border transition
                ${
                  preset === m
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-transparent border-white/10 text-white/70 hover:text-white hover:border-white/20"
                }
              `}
              disabled={running}
              title={running ? "Сначала поставь на паузу" : ""}
            >
              {m} min
            </button>
          ))}
          <button
            onClick={() => router.push("/quest")}
            className="px-3 py-2 rounded-lg text-sm border border-white/10 text-white/70 hover:text-white hover:border-white/20"
          >
            Quests →
          </button>
        </div>

        {/* Timer card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-white/60 text-sm">Time left</div>
              <div className="text-5xl font-semibold text-white tabular-nums">{formatTime(leftSec)}</div>
            </div>

            <div className="flex gap-2">
              {!running ? (
                <button
                  onClick={startTimer}
                  className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={stopTimer}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium border border-white/20"
                >
                  Pause
                </button>
              )}

              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg bg-transparent text-white/70 text-sm border border-white/10 hover:border-white/20 hover:text-white"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-white/60" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center justify-between text-sm text-white/60">
            <span>Active mode</span>
            <button
              onClick={() => {
                if (!questOpen) pickQuest();
              }}
              className="underline underline-offset-4 hover:text-white"
            >
              Trigger micro-quest
            </button>
          </div>
        </div>

        {/* Quest modal */}
        {questOpen && currentQuest && (
          <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-white text-lg font-semibold">{currentQuest.title}</div>
                <div className="text-white/70 text-sm mt-1">{currentQuest.desc}</div>
              </div>
              <button
                onClick={() => setQuestOpen(false)}
                className="px-3 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/20"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Finish / reflection */}
        {done && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
            <div className="text-white font-semibold">Session complete</div>

            <div className="flex items-center gap-3 text-sm text-white/70">
              <span>Rating:</span>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white"
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
              placeholder="1 строка: что помогло / что мешало?"
              className="w-full min-h-[90px] bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-white/40"
            />

            <div className="flex gap-2">
              <button
                onClick={saveResult}
                className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium"
              >
                Save reflection
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg bg-transparent text-white/70 text-sm border border-white/10 hover:border-white/20 hover:text-white"
              >
                New session
              </button>
            </div>

            <div className="text-xs text-white/50">
              XP начисляется только если таймер дошёл до 0 и активный квест был выбран из Quests.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

