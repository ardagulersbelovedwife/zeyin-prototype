"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "zeyin.focus.system.v1";

type Mood = "calm" | "focused" | "tired";

export type FocusState = {
  level: number; // 1..N
  xp: number; // 0..(xpToNext-1)
  energy: number; // 0-100
  mood: Mood;
  streakDays: number; // consecutive days with >=1 session
  lastFocusAt: number | null;
  lastActivityAt: number | null;
  missedTasks: number;
  productiveDays: number;
};

function clamp(v: number, a = 0, b = 100) {
  return Math.max(a, Math.min(b, v));
}

function xpToNext(level: number) {
  return 100; // fixed 100 XP per level for simplicity
}

function computeMood(energy: number): Mood {
  if (energy <= 30) return "tired";
  if (energy <= 70) return "calm";
  return "focused";
}

export function useFocusSystem() {
  const [state, setState] = useState<FocusState>({
    level: 1,
    xp: 0,
    energy: 100,
    mood: "focused",
    streakDays: 0,
    lastFocusAt: null,
    lastActivityAt: Date.now(),
    missedTasks: 0,
    productiveDays: 0,
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState(JSON.parse(raw) as FocusState);
      }
    } catch {}
    setIsHydrated(true);
  }, []);

  const sessionRunningRef = useRef(false);
  const sessionSecondsRef = useRef(0);
  const tickerRef = useRef<number | null>(null);

  // persist
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, isHydrated]);

  // fine-grained tick (5s) to handle energy drain while session runs and to update derived props
  useEffect(() => {
    function tick() {
      setState((s) => {
        const now = Date.now();
        const hoursSinceActivity = s.lastActivityAt ? (now - s.lastActivityAt) / (1000 * 60 * 60) : 9999;
        let energy = s.energy;

        // energy decay if no activity for 24h
        if (hoursSinceActivity >= 24) {
          const days = Math.floor(hoursSinceActivity / 24);
          energy = clamp(s.energy - days * 8, 0, 100);
        }

        // handle session running energy drain: -1 every 2 minutes
        if (sessionRunningRef.current) {
          sessionSecondsRef.current += 5;
          if (sessionSecondsRef.current >= 120) {
            sessionSecondsRef.current = 0;
            energy = clamp(energy - 1, 0, 100);
          }
        }

        const mood = computeMood(energy);
        return { ...s, energy, mood };
      });
    }

    tick();
    tickerRef.current = window.setInterval(tick, 5000);
    return () => {
      if (tickerRef.current) window.clearInterval(tickerRef.current);
    };
  }, []);

  const gainXp = (amount: number) => {
    setState((s) => {
      let xp = s.xp + amount;
      let level = s.level;
      while (xp >= xpToNext(level)) {
        xp -= xpToNext(level);
        level += 1;
      }
      return { ...s, xp, level, lastActivityAt: Date.now() } as FocusState & { level: number };
    });
  };

  const onSessionStart = () => {
    sessionRunningRef.current = true;
    sessionSecondsRef.current = 0;
    setState((s) => ({ ...s, lastActivityAt: Date.now() }));
  };

  const onSessionStop = () => {
    sessionRunningRef.current = false;
    sessionSecondsRef.current = 0;
    setState((s) => ({ ...s, lastActivityAt: Date.now() }));
  };

  const onMicroTask = () => {
    gainXp(5);
    setState((s) => ({ ...s, lastActivityAt: Date.now() }));
  };

  const onBreathe = () => {
    // +5 energy, small XP
    setState((s) => ({ ...s, energy: clamp(s.energy + 5, 0, 100), lastActivityAt: Date.now() }));
    gainXp(1);
  };

  const onReflectComplete = () => {
    setState((s) => ({ ...s, energy: clamp(s.energy + 10, 0, 100), lastActivityAt: Date.now() }));
    gainXp(2);
  };

  const onSessionComplete = (minutes: number) => {
    // XP mapping per spec
    const map = new Map<number, number>([[5, 5], [10, 12], [15, 20], [25, 35]]);
    const rounded = Math.round(minutes);
    const base = map.get(rounded) ?? Math.round((minutes / 25) * 35);
    gainXp(base);

    setState((s) => {
      const now = Date.now();
      const lastFocusDay = s.lastFocusAt ? new Date(s.lastFocusAt).toDateString() : null;
      const today = new Date(now).toDateString();
      let streakDays = s.streakDays;
      if (lastFocusDay !== today) {
        // increment streak if yesterday was last focus
        const yesterday = new Date(now - 24 * 60 * 60 * 1000).toDateString();
        streakDays = lastFocusDay === yesterday ? s.streakDays + 1 : 1;
      }

      // reduce missed tasks and reset lastFocusAt
      const missedTasks = Math.max(0, s.missedTasks - 1);
      const productiveDays = s.productiveDays + 1;

      // bonus XP if pressure < 40 (read from local storage/derived later)
      const bonus = (() => {
        try {
          const raw = localStorage.getItem("zeyin_monster_v1");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (typeof parsed.pressure === "number" && parsed.pressure < 40) return 5;
          }
        } catch {}
        return 0;
      })();

      if (bonus > 0) gainXp(bonus);

      return {
        ...s,
        lastFocusAt: now,
        lastActivityAt: now,
        missedTasks,
        productiveDays,
        streakDays,
      } as FocusState;
    });
  };

  const onSessionMissed = () => {
    setState((s) => ({ ...s, missedTasks: s.missedTasks + 1, lastActivityAt: Date.now() }));
  };

  const resetSystem = () => {
    const now = Date.now();
    const base: FocusState = {
      level: 1,
      xp: 0,
      energy: 100,
      mood: "focused",
      streakDays: 0,
      lastFocusAt: now,
      lastActivityAt: now,
      missedTasks: 0,
      productiveDays: 0,
    };
    setState(base);
  };

  const xpNext = useMemo(() => xpToNext(state.level), [state.level]);

  return {
    state,
    gainXp,
    onMicroTask,
    onSessionStart,
    onSessionStop,
    onSessionComplete,
    onSessionMissed,
    onBreathe,
    onReflectComplete,
    resetSystem,
    xpNext,
  } as const;
}
