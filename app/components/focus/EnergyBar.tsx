"use client";

import React from "react";

export default function EnergyBar({ energy }: { energy: number }) {
  const pct = Math.max(0, Math.min(100, energy));
  const color = energy > 60 ? "bg-emerald-400" : energy > 30 ? "bg-yellow-400" : "bg-rose-400";
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
        <span className="font-medium">Energy</span>
        <span className="font-semibold">{energy}%</span>
      </div>
      <div className="w-full h-3 rounded-full bg-sky-50 overflow-hidden">
        <div style={{ width: `${pct}%` }} className={`h-full ${color} transition-all duration-500`} />
      </div>
    </div>
  );
}
