"use client";

import React from "react";

export default function Progress({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label && <div style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500, letterSpacing: "0.02em" }}>{label}</div>}
      <div style={{ width: "100%", height: 8, borderRadius: 100, background: "rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--color-sage)", transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }} />
      </div>
    </div>
  );
}
