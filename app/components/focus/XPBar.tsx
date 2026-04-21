"use client";

import React from "react";

export default function XPBar({ xp, xpToNext }: { xp: number; xpToNext: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((xp / xpToNext) * 100)));
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
        <span className="font-medium">XP</span>
        <span className="font-semibold">{xp} / {xpToNext}</span>
      </div>
      <div className="w-full h-3 rounded-full bg-sky-100 overflow-hidden">
        <div style={{ width: `${pct}%` }} className="h-full bg-gradient-to-r from-sky-400 to-teal-300 transition-all duration-300" />
      </div>
    </div>
  );
}
