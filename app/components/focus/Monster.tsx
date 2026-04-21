"use client";

import React from "react";

function BreathingSVG({ stage }: { stage: "small" | "medium" | "large" | "dormant" }) {
  const sizes = { small: 44, medium: 72, large: 112, dormant: 40 } as const;
  const colors = { small: "#93c5fd", medium: "#60a5fa", large: "#0284c7", dormant: "#c7d2fe" } as const;
  const size = sizes[stage];
  const color = colors[stage];

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="mx-auto">
      <defs>
        <radialGradient id="g1" cx="50%" cy="30%">
          <stop offset="0%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </radialGradient>
      </defs>
      <g className="breath" style={{ transformOrigin: "60px 60px" }}>
        <circle cx="60" cy="60" r="44" fill="url(#g1)" stroke={color} strokeWidth={2} className="shadow-2xl" />
        <circle cx="60" cy="60" r="26" fill={color} opacity={0.95} />
      </g>
      <style>{`
        .breath { animation: breath 4s ease-in-out infinite; }
        @keyframes breath { 0%{ transform: scale(0.98);}50%{ transform: scale(1.04);}100%{ transform: scale(0.98);} }
      `}</style>
    </svg>
  );
}

export default function Monster({ pressure, stage }: { pressure: number; stage: "small" | "medium" | "large" | "dormant" }) {
  const status = stage === "dormant" ? "Dormant" : stage === "small" ? "Idle" : stage === "medium" ? "Annoying" : "Pressuring";
  const pulse = pressure > 50 ? "animate-pulse" : "";
  return (
    <div className={`card rounded-xl p-4 bg-gradient-to-br from-white to-sky-50 shadow-lg ${pulse}`} style={{ minWidth: 220 }}>
      <div className="flex items-center gap-4">
        <div style={{ width: 120 }}>
          <BreathingSVG stage={stage} />
        </div>
        <div className="flex-1">
          <div className="text-sm text-slate-600">Procrastination</div>
          <div className="text-lg font-semibold text-slate-800">{status}</div>
          <div className="mt-3">
            <div className="w-full h-2 rounded-full bg-sky-100 overflow-hidden">
              <div style={{ width: `${pressure}%` }} className="h-full bg-gradient-to-r from-amber-300 to-rose-400 transition-all duration-500" />
            </div>
            <div className="text-xs text-slate-500 mt-1">Pressure {pressure}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
