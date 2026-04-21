"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  loadTherapyDraft,
  saveTherapyDraft,
  type TherapyDifficulty,
} from "@/lib/therapyStore";
import { TherapyShell } from "@/app/components/TherapyShell";

const PRESETS = [5, 10, 15, 25];

export default function TherapyPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [goal, setGoal] = useState("");
  const [task, setTask] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [minutes, setMinutes] = useState(10);
  const [difficulty, setDifficulty] = useState<TherapyDifficulty>("Medium");
  const [questTitle, setQuestTitle] = useState<string | undefined>();
  const [questXp, setQuestXp] = useState<number | undefined>();

  useEffect(() => {
    const draft = loadTherapyDraft();
    if (draft) {
      setGoal(draft.goal);
      setTask(draft.task);
      setNextStep(draft.nextStep);
      setMinutes(draft.minutes);
      setDifficulty(draft.difficulty);
      setQuestTitle(draft.questTitle);
      setQuestXp(draft.questXp);
    }

    const mRaw = searchParams.get("m");
    const questRaw = searchParams.get("questTitle");
    const xpRaw = searchParams.get("xp");

    if (mRaw) {
      const parsed = Number(mRaw);
      if (Number.isFinite(parsed) && parsed > 0) {
        setMinutes(parsed);
      }
    }

    if (questRaw) {
      const cleanQuest = questRaw.trim();
      setQuestTitle(cleanQuest);
      setGoal((prev) => (prev ? prev : cleanQuest));
      setTask((prev) => (prev ? prev : cleanQuest));
    }

    if (xpRaw) {
      const xpParsed = Number(xpRaw);
      if (Number.isFinite(xpParsed)) setQuestXp(xpParsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValid = useMemo(() => {
    return (
      goal.trim().length >= 2 &&
      task.trim().length >= 2 &&
      nextStep.trim().length >= 2 &&
      minutes > 0
    );
  }, [goal, task, nextStep, minutes]);

  const handleContinue = () => {
    if (!isValid) return;
    saveTherapyDraft({
      goal: goal.trim(),
      task: task.trim(),
      nextStep: nextStep.trim(),
      minutes,
      difficulty,
      interventionsUsed: [],
      startedFromQuest: Boolean(questTitle),
      questTitle,
      questXp,
    });
    router.push("/therapy/do");
  };

  return (
    <TherapyShell
      title="Plan"
      subtitle="Set the goal, choose the task, and define the tiny next step."
      backHref="/therapy"
    >
      <div style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", backdropFilter: "blur(12px)", boxShadow: "var(--shadow-md)" }}>
        {questTitle && (
          <div style={{ background: "rgba(45, 212, 191, 0.08)", border: "1px solid rgba(45, 212, 191, 0.2)", borderRadius: "var(--radius-md)", padding: "var(--spacing-md)", marginBottom: "var(--spacing-lg)", fontSize: "14px", color: "var(--color-text-secondary)" }}>
            Prefilled from quest: <span style={{ color: "var(--color-accent)", fontWeight: 500 }}>{questTitle}</span>
          </div>
        )}

        <div style={{ display: "grid", gap: "var(--spacing-md)", marginBottom: "var(--spacing-xl)" }}>
          <label style={{ display: "grid", gap: "var(--spacing-sm)", fontSize: "14px", color: "var(--color-text-secondary)", fontWeight: 500 }}>
            Goal (short)
            <input
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              placeholder="Finish 2 paragraphs"
              style={{ height: "44px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-white)", color: "var(--color-text-primary)", padding: "0 var(--spacing-md)", outline: "none", fontSize: "14px", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.3)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(45, 212, 191, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </label>
          <label style={{ display: "grid", gap: "var(--spacing-sm)", fontSize: "14px", color: "var(--color-text-secondary)", fontWeight: 500 }}>
            Task (short)
            <input
              value={task}
              onChange={(event) => setTask(event.target.value)}
              placeholder="Math homework"
              style={{ height: "44px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-white)", color: "var(--color-text-primary)", padding: "0 var(--spacing-md)", outline: "none", fontSize: "14px", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.3)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(45, 212, 191, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </label>
          <label style={{ display: "grid", gap: "var(--spacing-sm)", fontSize: "14px", color: "var(--color-text-secondary)", fontWeight: 500 }}>
            Tiny next step (one concrete action)
            <input
              value={nextStep}
              onChange={(event) => setNextStep(event.target.value)}
              placeholder="Open the notebook and write the first line"
              style={{ height: "44px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-white)", color: "var(--color-text-primary)", padding: "0 var(--spacing-md)", outline: "none", fontSize: "14px", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.3)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(45, 212, 191, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "var(--spacing-xl)" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--spacing-md)" }}>Duration</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-sm)", alignItems: "center" }}>
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setMinutes(preset)}
                style={{
                  borderRadius: "18px",
                  border: minutes === preset ? "1px solid var(--color-sage)" : "1px solid var(--color-border)",
                  background: minutes === preset ? "var(--color-sage-bg)" : "var(--color-white)",
                  color: minutes === preset ? "var(--color-sage)" : "var(--color-text-secondary)",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: minutes === preset ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  outline: "none"
                }}
                onMouseEnter={(e) => {
                  if (minutes !== preset) {
                    e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.4)";
                    e.currentTarget.style.background = "rgba(45, 212, 191, 0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (minutes !== preset) {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.background = "var(--color-white)";
                  }
                }}
              >
                {preset} min
              </button>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", marginLeft: "auto" }}>
              <input
                type="number"
                min={1}
                max={90}
                value={minutes}
                onChange={(event) => setMinutes(Number(event.target.value))}
                style={{ width: "70px", padding: "8px 12px", borderRadius: "10px", border: "1px solid var(--color-border)", background: "var(--color-white)", color: "var(--color-text-primary)", fontSize: "14px", outline: "none", transition: "border-color 0.2s ease" }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.3)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              />
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)", fontWeight: 500 }}>custom</span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "var(--spacing-xl)" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--spacing-md)" }}>Difficulty</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-sm)" }}>
            {["Easy", "Medium", "Hard"].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level as TherapyDifficulty)}
                style={{
                  borderRadius: "18px",
                  border: difficulty === level ? "1px solid var(--color-sage)" : "1px solid var(--color-border)",
                  background: difficulty === level ? "var(--color-sage-bg)" : "var(--color-white)",
                  color: difficulty === level ? "var(--color-sage)" : "var(--color-text-secondary)",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: difficulty === level ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  outline: "none"
                }}
                onMouseEnter={(e) => {
                  if (difficulty !== level) {
                    e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.4)";
                    e.currentTarget.style.background = "rgba(45, 212, 191, 0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (difficulty !== level) {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.background = "var(--color-white)";
                  }
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!isValid}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "18px",
            border: "none",
            background: isValid ? "var(--color-sage)" : "var(--color-border)",
            color: isValid ? "var(--color-white)" : "var(--color-text-muted)",
            fontSize: "16px",
            fontWeight: 700,
            cursor: isValid ? "pointer" : "not-allowed",
            transition: isValid ? "all 0.18s ease" : "none",
            boxShadow: isValid ? "0 4px 12px rgba(45, 212, 191, 0.2)" : "none",
            outline: "none",
            transform: "translateY(0)"
          }}
          onMouseEnter={(e) => {
            if (isValid) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(45, 212, 191, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (isValid) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(45, 212, 191, 0.2)";
            }
          }}
        >
          Continue to Do
        </button>
      </div>
    </TherapyShell>
  );
}
