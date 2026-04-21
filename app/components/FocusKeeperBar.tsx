"use client";

import React from "react";
import { useFocusSystem } from "@/app/lib/useFocusSystem";
import Progress from "@/app/components/ui/Progress";

export default function FocusKeeperBar() {
  const { state, xpNext } = useFocusSystem();
  const level = (state as any).level ?? 1;
  const xp = (state as any).xp ?? 0;
  const energy = state.energy;
  const streak = (state as any).streakDays ?? state.streakDays ?? 0;
  const mood = state.mood;

  return (
    <div style={{ width: "100%", borderRadius: 20, padding: 24, background: "var(--color-card-bg)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", backdropFilter: "blur(12px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flex: "1 1 auto" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(45,212,191,0.05)", border: "1px solid rgba(45,212,191,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)", fontWeight: 400, fontSize: 26 }}>
            {level}
          </div>
          <div style={{ minWidth: 160, flex: "1 1 auto" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
              <div style={{ fontWeight: 500, color: "var(--color-text-primary)", letterSpacing: "0.02em", fontSize: 16 }}>Focus Keeper</div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Streak <span style={{ color: "var(--color-accent)" }}>{streak}d</span></div>
            </div>
            <div>
              <Progress value={(xp / xpNext) * 100} label={`XP: ${xp} / ${xpNext}`} />
            </div>
          </div>
        </div>
        <div style={{ minWidth: 160, display: "flex", flexDirection: "column", flex: "1 1 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
            <div>Energy</div>
            <div style={{ color: "var(--color-text-primary)" }}>{energy}%</div>
          </div>
          <Progress value={energy} />
          <div style={{ marginTop: 12, fontSize: 13, color: "var(--color-text-secondary)", letterSpacing: "0.02em" }}>Mood: <span style={{ fontWeight: 500, color: "var(--color-accent)", textTransform: "capitalize" }}>{mood}</span></div>
        </div>
      </div>
    </div>
  );
}
