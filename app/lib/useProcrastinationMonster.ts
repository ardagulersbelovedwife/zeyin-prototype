import { useEffect, useRef, useState } from "react";
import type { MonsterState } from "@/app/components/ProcrastinationMonster";

export interface UseProcrastinationMonsterReturn {
  state: MonsterState;
  message: string;
}

interface UseProcrastinationMonsterOptions {
  /** Whether the focus timer is currently running */
  timerRunning: boolean;
  /** Pressure threshold in seconds (default: 45) */
  pressureThresholdSec?: number;
}

export function useProcrastinationMonster(
  options: UseProcrastinationMonsterOptions
): UseProcrastinationMonsterReturn {
  const { timerRunning, pressureThresholdSec = 45 } = options;

  const [state, setState] = useState<MonsterState>("active");
  const [idleStartRef, setIdleStart] = useState<number | null>(null);
  const checkIntervalRef = useRef<number | null>(null);

  // Immediately switch to "sleep" when timer starts
  useEffect(() => {
    if (timerRunning) {
      setState("sleep");
      setIdleStart(null);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    // Timer stopped or not running
    // Start tracking idle time
    if (!idleStartRef) {
      setIdleStart(Date.now());
    }

    // Set up interval to check for pressure
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    checkIntervalRef.current = window.setInterval(() => {
      if (idleStartRef) {
        const elapsedSec = (Date.now() - idleStartRef) / 1000;
        if (elapsedSec >= pressureThresholdSec) {
          setState("pressure");
        } else {
          setState("active");
        }
      }
    }, 1000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [timerRunning, idleStartRef, pressureThresholdSec]);

  // When timer restarts, reset idle tracking
  useEffect(() => {
    if (!timerRunning) {
      // User stopped the timer, enable pressure detection
      if (!idleStartRef) {
        setIdleStart(Date.now());
      }
    }
  }, [timerRunning, idleStartRef]);

  // Message based on state
  const message =
    state === "sleep"
      ? "I'll wait for now."
      : state === "pressure"
        ? "Let's try later. You're tired."
        : "We can start small...";

  return {
    state,
    message,
  };
}
