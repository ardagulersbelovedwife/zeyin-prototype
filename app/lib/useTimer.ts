import { useState, useRef, useEffect } from "react";
import { useFocusSystem } from "@/app/lib/useFocusSystem";
import { useMonsterEngine } from "@/app/lib/useMonsterEngine";

export function useTimer(initialSeconds: number) {
  const focus = useFocusSystem();
  const monsterEngine = useMonsterEngine();

  const [totalSec, setTotalSec] = useState(initialSeconds);
  const [leftSec, setLeftSec] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const tickRef = useRef<number | null>(null);

  const stopTimer = () => {
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = null;
    setRunning(false);
    focus.onSessionStop && focus.onSessionStop();
    monsterEngine.setFocusRunning(false);
  };

  const startTimer = (onComplete?: () => void) => {
    if (running) return;
    setRunning(true);
    focus.onSessionStart && focus.onSessionStart();
    monsterEngine.setFocusRunning(true);
    monsterEngine.onTimerStart();

    tickRef.current = window.setInterval(() => {
      setLeftSec((prev) => {
        if (prev <= 1) {
          if (tickRef.current) window.clearInterval(tickRef.current);
          tickRef.current = null;
          setRunning(false);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetTimer = (newTotalSec = totalSec) => {
    stopTimer();
    setTotalSec(newTotalSec);
    setLeftSec(newTotalSec);
  };

  const setTime = (sec: number) => {
    setTotalSec(sec);
    setLeftSec(sec);
    if (running) stopTimer();
  };

  useEffect(() => {
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  return { totalSec, leftSec, running, startTimer, stopTimer, resetTimer, setTime, setLeftSec };
}
