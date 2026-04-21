"use client";

import React from "react";

export function PrimaryButton({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm ${className}`}>
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 border border-sky-200 text-sky-600 px-3 py-2 rounded-lg hover:bg-sky-50 ${className}`}>
      {children}
    </button>
  );
}
