"use client";

import React from "react";

export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-white/60 border border-[#e6eef8] shadow-sm p-4 ${className}`}>
      {children}
    </div>
  );
}
