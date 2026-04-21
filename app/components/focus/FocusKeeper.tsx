"use client";

import React from "react";
import XPBar from "@/app/components/focus/XPBar";
import EnergyBar from "@/app/components/focus/EnergyBar";

export default function FocusKeeper({ level, xp, xpToNext, energy, mood, evolutionStage, streak, glow }: {
  level: number;
  xp: number;
  xpToNext: number;
  energy: number;
  mood: string;
  evolutionStage: number;
  streak: number;
  glow?: boolean;
}) {
  const accessory = evolutionStage === 1 ? null : evolutionStage === 2 ? "• accessory" : "• aura";
  return (
    <div className={`card rounded-xl p-4 bg-gradient-to-br from-white to-sky-50 shadow-lg ${glow ? "ring-2 ring-sky-300" : ""}`} style={{ width: 320 }}>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-2xl font-bold text-sky-600">
          <div>{level}</div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-800">Focus Keeper {accessory ?? ""}</div>
            <div className="text-xs text-slate-500">Streak {streak}d</div>
          </div>
          <div className="mt-2 space-y-2">
            <XPBar xp={xp} xpToNext={xpToNext} />
            <EnergyBar energy={energy} />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
        <div>Mood: <span className="font-semibold text-slate-800">{mood}</span></div>
        <div className="text-xs text-slate-500">Lvl {level} • Stage {evolutionStage}</div>
      </div>
      <style>{`
        .card { border-radius: 14px; }
      `}</style>
    </div>
  );
}
