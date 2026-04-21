import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "zeyin_monster_v1";

function clamp(v: number, a = 0, b = 100) {
  return Math.max(a, Math.min(b, v));
}

export interface MonsterState {
  pressure: number;
  xp: number;
  streak: number;
  minimized: boolean;
  lastFocusStart: number | null;
  focusRunning: boolean;
}

const DEFAULT_STATE: MonsterState = {
  pressure: 30,
  xp: 0,
  streak: 0,
  minimized: false,
  lastFocusStart: null,
  focusRunning: false,
};

function loadState(): MonsterState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: MonsterState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export interface UseMonsterEngineReturn {
  pressure: number;
  xp: number;
  streak: number;
  minimized: boolean;
  focusRunning: boolean;
  setFocusRunning: (running: boolean) => void;
  onTimerStart: () => void;
  onTimerReset: () => void;
  onMicroQuest: () => void;
  runBreathe: () => void;
  submitTinyStep: (text: string) => void;
  resetDistraction: () => void;
  toggleMinimized: () => void;
}

export function useMonsterEngine(): UseMonsterEngineReturn {
  const [state, setState] = useState<MonsterState>(DEFAULT_STATE);
  const [isHydrated, setIsHydrated] = useState(false);
  const timerRef = useRef<number | null>(null);
  const timerStartTimeRef = useRef<number | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setIsHydrated(true);
  }, []);

  // Persist state changes
  useEffect(() => {
    if (!isHydrated) return;
    saveState(state);
  }, [state, isHydrated]);

  // Pressure loop: implement requested growth rules
  // - +1 every 30s while a focus session is RUNNING
  // - if user inactive for 90s -> +1 every 10s
  // - freeze growth after micro-intervention for 60s
  const freezeRef = useRef<number | null>(null);
  const inactiveRef = useRef(false);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isHydrated) return;

    // activity listeners
    const onUserActivity = () => {
      lastActivityRef.current = Date.now();
      if (inactiveRef.current) inactiveRef.current = false;
    };
    window.addEventListener("mousemove", onUserActivity);
    window.addEventListener("mousedown", onUserActivity);
    window.addEventListener("keydown", onUserActivity);
    window.addEventListener("touchstart", onUserActivity);

    // main loop tick every 1s to evaluate timers
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setState((prev) => {
        const now = Date.now();

        // check freeze
        if (freezeRef.current && now < freezeRef.current) {
          return prev; // frozen, no change
        }

        // detect inactivity
        const secondsSinceActivity = (now - lastActivityRef.current) / 1000;
        if (secondsSinceActivity >= 90) inactiveRef.current = true;

        // determine growth/decay rate
        let newPressure = prev.pressure;
        
        if (prev.focusRunning) {
          // When actively focusing: Monster presence shrinks rapidly over time
          newPressure = Math.max(0, prev.pressure - 0.5);
        } else {
          // Not focusing: Procrastination builds up.
          if (inactiveRef.current) {
            // Idle completely (browsing away or just staring): grows quickly!
            newPressure = clamp(prev.pressure + 0.3, 0, 100);
          } else {
            // Active on screen but avoiding the focus timer: grows moderately
            newPressure = clamp(prev.pressure + 0.1, 0, 100);
          }
        }

        // clamp and return
        newPressure = Math.round(clamp(newPressure, 0, 100));
        return { ...prev, pressure: newPressure };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener("mousemove", onUserActivity);
      window.removeEventListener("mousedown", onUserActivity);
      window.removeEventListener("keydown", onUserActivity);
      window.removeEventListener("touchstart", onUserActivity);
    };
  }, [isHydrated]);

  // helper to freeze growth for a duration (ms)
  const freezeGrowth = (durationMs: number) => {
    freezeRef.current = Date.now() + durationMs;
    // also schedule clearing
    setTimeout(() => {
      freezeRef.current = null;
    }, durationMs + 50);
  };

  const setFocusRunning = (running: boolean) => {
    setState((prev) => {
      let newState = { ...prev, focusRunning: running };

      if (running && !prev.lastFocusStart) {
        // Mark when user starts focusing
        newState.lastFocusStart = Date.now();
      } else if (!running && prev.lastFocusStart) {
        // Check if user completed at least 5 minutes for streak
        const focusedMs = Date.now() - prev.lastFocusStart;
        const focusedMin = focusedMs / 1000 / 60;

        if (focusedMin >= 5) {
          newState.streak = prev.streak + 1;
        }

        newState.lastFocusStart = null;
      }

      return newState;
    });
  };

  const onTimerStart = () => {
    // Immediate pressure drop when timer starts
    setState((prev) => ({
      ...prev,
      pressure: Math.max(0, prev.pressure - 10),
    }));
  };

  const onTimerReset = () => {
    // Penalty if reset quickly (<30s into a session)
    if (state.focusRunning && state.lastFocusStart) {
      const elapsedSec = (Date.now() - state.lastFocusStart) / 1000;
      if (elapsedSec < 30) {
        setState((prev) => ({
          ...prev,
          pressure: Math.min(100, prev.pressure + 5),
        }));
      }
    }
  };

  const onMicroQuest = () => {
    // Micro-quest triggers a pressure drop and freeze growth for 60s
    setState((prev) => ({ ...prev, pressure: Math.max(0, prev.pressure - 5) }));
    freezeGrowth(1000 * 60);
  };

  const runBreathe = () => {
    // 20s breathing reduces pressure and grants XP, freeze growth for 60s
    setState((prev) => ({ ...prev, pressure: Math.max(0, prev.pressure - 15), xp: prev.xp + 2 }));
    freezeGrowth(1000 * 60);
  };

  const submitTinyStep = (text: string) => {
    // Submitting a tiny step reduces pressure and grants XP
    if (text.trim()) {
      setState((prev) => ({ ...prev, pressure: Math.max(0, prev.pressure - 10), xp: prev.xp + 1 }));
      freezeGrowth(1000 * 60);
    }
  };

  const resetDistraction = () => {
    // One-click distraction reset reduces pressure and grants XP
    setState((prev) => ({ ...prev, pressure: Math.max(0, prev.pressure - 8), xp: prev.xp + 1 }));
    freezeGrowth(1000 * 60);
  };

  const toggleMinimized = () => {
    setState((prev) => ({
      ...prev,
      minimized: !prev.minimized,
    }));
  };

  return {
    pressure: state.pressure,
    xp: state.xp,
    streak: state.streak,
    minimized: state.minimized,
    focusRunning: state.focusRunning,
    setFocusRunning,
    onTimerStart,
    onTimerReset,
    onMicroQuest,
    runBreathe,
    submitTinyStep,
    resetDistraction,
    toggleMinimized,
  };
}
