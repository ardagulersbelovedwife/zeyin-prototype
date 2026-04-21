"use client";

import React from "react";

export type MonsterState = "sleep" | "active" | "pressure";

export interface ProcrastinationMonsterProps {
  state: MonsterState;
  message?: string;
  className?: string;
}

const styles = `
  @keyframes breathing {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
  }

  @keyframes wobble {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    25% { transform: translateX(4px) rotate(1deg); }
    75% { transform: translateX(-4px) rotate(-1deg); }
  }

  @keyframes wobble-fast {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    25% { transform: translateX(6px) rotate(2deg); }
    75% { transform: translateX(-6px) rotate(-2deg); }
  }

  .procrastination-monster {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .procrastination-monster-svg {
    width: 100px;
    height: 100px;
    transition: all 0.3s ease;
  }

  .procrastination-monster-svg.sleep {
    opacity: 0.4;
    transform: scale(0.85);
    animation: breathing 4s ease-in-out infinite;
  }

  .procrastination-monster-svg.active {
    opacity: 1;
    transform: scale(1);
    animation: wobble 2.5s ease-in-out infinite;
  }

  .procrastination-monster-svg.pressure {
    opacity: 1;
    transform: scale(1.15);
    animation: wobble-fast 1.8s ease-in-out infinite;
    filter: brightness(0.9) saturate(1.1);
  }

  .procrastination-monster-message {
    font-size: 12px;
    color: var(--color-text-secondary);
    text-align: center;
    font-style: italic;
    max-width: 120px;
    line-height: 1.3;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export function ProcrastinationMonster({
  state,
  message,
  className,
}: ProcrastinationMonsterProps) {
  const containerStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 20,
    right: 20,
    pointerEvents: "none",
    zIndex: 10,
    ...(!className && {}),
  };

  return (
    <>
      <style>{styles}</style>
      <div className={`procrastination-monster ${className || ""}`} style={containerStyle}>
        <svg
          viewBox="0 0 100 100"
          className={`procrastination-monster-svg ${state}`}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Main body (blob) */}
          <defs>
            <radialGradient id="monster-gradient" cx="45%" cy="45%">
              <stop offset="0%" stopColor={state === "pressure" ? "#5b7a99" : "#7ba8c1"} />
              <stop offset="100%" stopColor={state === "pressure" ? "#4a6280" : "#6895b5"} />
            </radialGradient>
          </defs>

          {/* Main blob shape */}
          <path
            d="M 50 15 C 70 18, 82 30, 82 50 C 82 70, 70 82, 50 82 C 30 82, 18 70, 18 50 C 18 30, 30 18, 50 15"
            fill="url(#monster-gradient)"
            stroke={state === "pressure" ? "#3a4860" : "#5a7a95"}
            strokeWidth="1.5"
          />

          {/* Left eye */}
          <circle cx="38" cy="42" r="7" fill="white" opacity="0.9" />
          <circle
            cx="38"
            cy="42"
            r="4"
            fill={state === "pressure" ? "#1a3a5a" : "#2a5a7a"}
          />
          <circle cx="39" cy="41" r="1.5" fill="white" opacity="0.6" />

          {/* Right eye */}
          <circle cx="62" cy="42" r="7" fill="white" opacity="0.9" />
          <circle
            cx="62"
            cy="42"
            r="4"
            fill={state === "pressure" ? "#1a3a5a" : "#2a5a7a"}
          />
          <circle cx="63" cy="41" r="1.5" fill="white" opacity="0.6" />

          {/* Mouth (gentle smile/neutral) */}
          {state === "sleep" ? (
            // Sleepy mouth (small curved line)
            <path
              d="M 42 60 Q 50 62 58 60"
              stroke="#5885a0"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          ) : state === "pressure" ? (
            // Worried mouth (downward curve)
            <path
              d="M 42 58 Q 50 55 58 58"
              stroke="#2a4a6a"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            // Neutral/content mouth
            <path
              d="M 42 60 Q 50 63 58 60"
              stroke="#5885a0"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          )}

          {/* Optional blush/emotion indicator */}
          {state !== "sleep" && (
            <>
              <ellipse
                cx="32"
                cy="55"
                rx="4"
                ry="3"
                fill={state === "pressure" ? "#d47a6a" : "#d9a5a0"}
                opacity="0.3"
              />
              <ellipse
                cx="68"
                cy="55"
                rx="4"
                ry="3"
                fill={state === "pressure" ? "#d47a6a" : "#d9a5a0"}
                opacity="0.3"
              />
            </>
          )}
        </svg>

        {/* Message whisper */}
        {message && <div className="procrastination-monster-message">{message}</div>}
      </div>
    </>
  );
}
