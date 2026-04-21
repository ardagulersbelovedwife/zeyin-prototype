"use client";

import React, { useState } from "react";
import { useMonsterEngine } from "@/app/lib/useMonsterEngine";
import { useFocusSystem } from "@/app/lib/useFocusSystem";

import "./MonsterWidget.css";

function MonsterGauge({ pressure }: { pressure: number }) {
  const isHigh = pressure >= 71;
  const isMedium = pressure >= 31 && pressure < 71;

  let eyeColor = "var(--color-sage)"; 
  if (isMedium) eyeColor = "var(--color-slate-blue)"; 
  if (isHigh) eyeColor = "var(--color-error)";

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (pressure / 100) * circumference;
  const pulseAnim = pressure > 50 ? "breathe 2s infinite alternate" : "none";

  return (
    <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 16px" }}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: "rotate(-90deg)" }}>
        {/* Soft Background Track */}
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="12" />
        
        {/* Smooth Pressure Arc */}
        <circle 
           cx="80" cy="80" r={radius} 
           fill="none" 
           stroke={eyeColor} 
           strokeWidth="12" 
           strokeLinecap="round"
           strokeDasharray={circumference}
           strokeDashoffset={strokeOffset}
           style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.5s ease" }}
        />
        
        {/* The Wisp Blob inside the ring */}
        <circle cx="80" cy="80" r={32 + (pressure / 5)} fill={eyeColor} style={{ transition: "all 0.8s ease", opacity: 0.15, transformOrigin: "80px 80px", animation: pulseAnim }} />
        <circle cx="80" cy="80" r={16 + (pressure / 8)} fill={eyeColor} style={{ transition: "all 0.8s ease", opacity: 0.8, transformOrigin: "80px 80px", animation: pulseAnim }} />
      </svg>
      {/* Pressure Text Overlay */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "28px", fontWeight: "300", color: "var(--color-text-primary)", letterSpacing: "-0.02em", lineHeight: 1 }}>{pressure}%</span>
        <span style={{ fontSize: "10px", color: "var(--color-text-muted)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>Pressure</span>
      </div>
    </div>
  );
}

export function MonsterWidget() {
  const engine = useMonsterEngine();
  const focus = useFocusSystem();
  const [breatheActive, setBreatheActive] = useState(false);
  const [breatheCount, setBreatheCount] = useState(0);
  const [tinyStepActive, setTinyStepActive] = useState(false);
  const [tinyStepInput, setTinyStepInput] = useState("");

  const runBreathing = () => {
    setBreatheActive(true);
    setBreatheCount(20);
    engine.runBreathe();
    focus.onBreathe();

    const interval = setInterval(() => {
      setBreatheCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setBreatheActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTinyStepSubmit = () => {
    if (tinyStepInput.trim()) {
      engine.submitTinyStep(tinyStepInput);
      focus.onBreathe();
      setTinyStepInput("");
      setTinyStepActive(false);
    }
  };

  const handleResetDistraction = () => {
    engine.resetDistraction();
    focus.onBreathe();
  };

  const whispers = {
    low: "Your mind is clear.",
    medium: "Resistance is building.",
    high: "Take a step back. Breathe.",
  };
  const pressureClass = engine.pressure < 31 ? "low" : engine.pressure < 71 ? "medium" : "high";
  const whisperText = whispers[pressureClass as keyof typeof whispers];

  if (engine.minimized) {
    return (
      <div className="monster-widget minimized" onClick={engine.toggleMinimized} title="View Procrastination Monster">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: engine.pressure >= 71 ? "var(--color-error)" : engine.pressure >= 31 ? "var(--color-slate-blue)" : "var(--color-sage)" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
             <span style={{ fontSize: "10px", color: "var(--color-text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Pressure</span>
             <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-primary)" }}>{engine.pressure}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="monster-widget" style={{ width: 360, maxHeight: "85vh", overflowY: "auto" }}>
      <div className="widget-header" style={{ alignItems: "center", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "16px", background: "white", display: "grid", placeItems: "center", color: "var(--color-sage)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.5 19A4.5 4.5 0 0 0 18 10h-1.79A7 7 0 1 0 9 19h8.5Z" /></svg>
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>Pressure Indie</div>
            <div style={{ fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 500 }}>Procrastination tracker</div>
          </div>
        </div>
        <button className="widget-toggle-btn" onClick={engine.toggleMinimized} title="Minimize">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <MonsterGauge pressure={engine.pressure} />

      <div style={{ textAlign: "center", marginBottom: "32px" }}>
         <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", fontWeight: 500 }}>{whisperText}</div>
      </div>

      <div style={{ display: "grid", gap: 12, marginBottom: 32 }}>
        <div style={{ background: "rgba(255, 255, 255, 0.4)", border: "1px solid rgba(0,0,0,0.03)", borderRadius: 20, padding: 16, display: "flex", gap: 16, alignItems: "flex-start", boxShadow: "inset 0 0 0 1px white" }}>
          <div style={{ background: "white", padding: 8, borderRadius: 12, color: "var(--color-sage)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div>
            <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Avoidance Activity</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 12, fontWeight: 500, lineHeight: 1.5 }}>A gentler tracking tool without judgment.</div>
          </div>
        </div>

        <div style={{ background: "rgba(255, 255, 255, 0.4)", border: "1px solid rgba(0,0,0,0.03)", borderRadius: 20, padding: 16, display: "flex", gap: 16, alignItems: "flex-start", boxShadow: "inset 0 0 0 1px white" }}>
          <div style={{ background: "white", padding: 8, borderRadius: 12, color: "var(--color-slate-blue)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
          </div>
          <div>
            <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Pressure Build</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 12, fontWeight: 500, lineHeight: 1.5 }}>Grows visually when sessions are missed.</div>
          </div>
        </div>

        <div style={{ background: "rgba(255, 255, 255, 0.4)", border: "1px solid rgba(0,0,0,0.03)", borderRadius: 20, padding: 16, display: "flex", gap: 16, alignItems: "flex-start", boxShadow: "inset 0 0 0 1px white" }}>
          <div style={{ background: "white", padding: 8, borderRadius: 12, color: "var(--color-terracotta)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          </div>
          <div>
            <div style={{ color: "var(--color-text-primary)", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Shrinks with action</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 12, fontWeight: 500, lineHeight: 1.5 }}>Taking action immediately calms the volume.</div>
          </div>
        </div>
      </div>

      <div style={{ background: "var(--color-sage-bg)", border: "1px solid rgba(158,179,159,0.3)", borderRadius: 16, padding: "16px 20px", textAlign: "center", color: "var(--color-sage)", fontSize: 13, fontWeight: 500, marginBottom: 32 }}>
        "Action is the antidote to procrastination"
      </div>

      <div className="actions-container">
        {breatheActive ? (
          <div className="breathe-timer">{breatheCount}</div>
        ) : (
          <button className="action-btn" onClick={runBreathing}>
            Breathe
          </button>
        )}

        {tinyStepActive ? (
          <div style={{ display: "grid", gap: 8, width: "100%" }}>
            <input
              type="text"
              className="tiny-step-input"
              placeholder="What's the next tiny step?"
              value={tinyStepInput}
              onChange={(e) => setTinyStepInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTinyStepSubmit();
                if (e.key === "Escape") {
                  setTinyStepActive(false);
                  setTinyStepInput("");
                }
              }}
              autoFocus
            />
            <button className="tiny-step-submit" onClick={handleTinyStepSubmit}>
              Submit Step
            </button>
          </div>
        ) : (
          <button className="action-btn" onClick={() => setTinyStepActive(true)}>
            Tiny Step
          </button>
        )}
      </div>

      <div style={{ marginTop: "16px" }}>
        <button className="action-btn btn-ghost" onClick={handleResetDistraction}>
          Reset Focus
        </button>
      </div>

      <div className="xp-streak-row">
        <span>XP {engine.xp}</span>
        <span>Streak {engine.streak}</span>
      </div>
    </div>
  );
}
