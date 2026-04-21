"use client";

import { useRouter } from "next/navigation";

type Quest = {
  title: string;
  level: string;
  minutes: number;
  xp: number;
  steps: string[];
  theme: "sage" | "terracotta" | "slate";
};

const quests: Quest[] = [
  {
    title: "Focus Boost",
    level: "Easy",
    minutes: 5,
    xp: 10,
    theme: "sage",
    steps: [
      "Put your phone away (Do Not Disturb mode).",
      "Open just one task.",
      "Start timer and work without distractions.",
    ],
  },
  {
    title: "Pomodoro Challenge",
    level: "Medium",
    minutes: 25,
    xp: 30,
    theme: "terracotta",
    steps: [
      "Set a goal: '5 tasks / 1 page / 10 examples'.",
      "25 minutes without switching.",
      "At the end, mark progress and what got in the way.",
    ],
  },
  {
    title: "Anti-Procrastination",
    level: "Easy",
    minutes: 10,
    xp: 15,
    theme: "slate",
    steps: [
      "Write down 1 small next step.",
      "Do it in 10 minutes without aiming for perfection.",
      "If it's going well, continue for 5 more minutes.",
    ],
  },
];

export default function QuestPage() {
  const router = useRouter();

  return (
    <div style={{ padding: "24px 20px", maxWidth: "800px", margin: "0 auto", paddingBottom: 100 }}>
      {/* Sleek Header */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "11px", color: "var(--color-sage)", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Welcome back</div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>Today's Quests</h1>
        </div>
        
        {/* Streak / XP Badge summary minimal */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: "var(--color-text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Focus Streak</div>
            <div style={{ fontSize: "20px", fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1, marginTop: 4 }}>7<span style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", marginLeft: 2 }}>Days</span></div>
          </div>
          <div style={{ width: 44, height: 44, position: "relative" }}>
             <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
               <circle cx="22" cy="22" r="20" stroke="rgba(0,0,0,0.05)" strokeWidth="4" fill="none" />
               <circle cx="22" cy="22" r="20" stroke="var(--color-sage)" strokeWidth="4" fill="none" strokeDasharray={125.6} strokeDashoffset={125.6 * 0.3} strokeLinecap="round" />
             </svg>
             <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "grid", placeItems: "center", fontSize: "10px", fontWeight: 700, color: "var(--color-sage)" }}>70%</div>
          </div>
        </div>
      </div>

      {/* Grid Layout for sleek minimalist cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
        {quests.map((q) => {
          const isSage = q.theme === "sage";
          const isTerra = q.theme === "terracotta";
          
          const bgVar = isSage ? "var(--color-sage-bg)" : isTerra ? "var(--color-terracotta-bg)" : "var(--color-slate-blue-bg)";
          const colorVar = isSage ? "var(--color-sage)" : isTerra ? "var(--color-terracotta)" : "var(--color-slate-blue)";

          return (
            <div
              key={q.title}
              className="card"
              style={{
                background: bgVar,
                border: "none",
                borderRadius: "24px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: "pointer",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6), " + (isSage ? "0 8px 24px rgba(158, 179, 159, 0.15)" : isTerra ? "0 8px 24px rgba(222, 147, 130, 0.15)" : "0 8px 24px rgba(125, 149, 168, 0.15)")
              }}
              onClick={() => {
                const params = new URLSearchParams({
                  m: String(q.minutes),
                  questTitle: q.title,
                  xp: String(q.xp),
                });
                router.push(`/therapy/start?${params.toString()}`);
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "12px", background: "white", color: colorVar, display: "grid", placeItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>{q.title}</div>
                      <div style={{ fontSize: "12px", fontWeight: 500, color: colorVar, marginTop: 4 }}>{q.minutes} min • {q.xp} XP</div>
                    </div>
                  </div>

                  {/* Minimal Progress Ring representation */}
                  <div style={{ position: "relative", width: 32, height: 32 }}>
                    <svg width="32" height="32" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="16" cy="16" r="14" stroke="rgba(0,0,0,0.05)" strokeWidth="2.5" fill="none" />
                      <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2.5" fill="none" strokeDasharray={87.9} strokeDashoffset={87.9 * 0.9} strokeLinecap="round" />
                    </svg>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "grid", placeItems: "center", fontSize: "9px", fontWeight: 700, color: "var(--color-text-secondary)" }}>10%</div>
                  </div>
                </div>

                <div style={{ fontSize: "13px", color: "var(--color-text-primary)", lineHeight: 1.6, opacity: 0.8, fontWeight: 500 }}>
                  {q.steps[0]}
                  {q.steps.length > 1 && <span style={{ opacity: 0.6, fontSize: "12px", marginLeft: 4 }}> (+{q.steps.length - 1} more)</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

  