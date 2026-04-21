"use client";

type MicroIntervention = {
  id: string;
  title: string;
  description: string;
  prompt: string;
};

type MicroInterventionModalProps = {
  open: boolean;
  intervention: MicroIntervention | null;
  onDone: () => void;
};

export function MicroInterventionModal({
  open,
  intervention,
  onDone,
}: MicroInterventionModalProps) {
  if (!open || !intervention) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.4)", backdropFilter: "blur(12px)", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 512, borderRadius: 24, padding: 32, background: "white", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "var(--shadow-glass)" }}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.25em", color: "var(--color-accent)", fontWeight: 600 }}>
            Micro-intervention
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, color: "var(--color-text-primary)", letterSpacing: "0.02em" }}>
            {intervention.title}
          </div>
          <div style={{ fontSize: 15, color: "var(--color-text-secondary)", fontWeight: 300, lineHeight: 1.5 }}>
            {intervention.description}
          </div>
          <div style={{ borderRadius: 16, border: "1px solid rgba(0,0,0,0.05)", background: "rgba(0,0,0,0.02)", padding: 20, fontSize: 14, color: "var(--color-text-primary)", marginTop: 8, fontWeight: 500 }}>
            {intervention.prompt}
          </div>
        </div>
        <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onDone}
            style={{ padding: "12px 32px", borderRadius: 16, background: "var(--color-sage-bg)", border: "1px solid var(--color-sage)", color: "var(--color-sage)", fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease" }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export type { MicroIntervention };
