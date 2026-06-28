import { useEffect, useState } from "react";
import clsx from "clsx";
import { fetchQuantumSkills, type QuantumSkillCard } from "../lib/prism-bridge";

const SKILL_LABELS: Record<string, string> = {
  MCA: "Market Context Analyzer",
  TSR: "Temporal Signal Router",
  AVR: "Adversarial Validation Router",
  EHL: "Entropy Hedge Layer",
};

export default function QuantumSkillsPanel() {
  const [cards, setCards] = useState<QuantumSkillCard[]>([]);

  useEffect(() => {
    void fetchQuantumSkills().then(setCards);
  }, []);

  return (
    <div className="funnel-panel">
      <div className="funnel-panel-title">Quantum skills — MCA · TSR · AVR · EHL</div>
      <div className="funnel-panel-grid">
        {cards.map((card) => (
          <div key={card.id} className="funnel-card">
            <div className="funnel-card-label">{card.id}</div>
            <div className="funnel-card-value" style={{ fontSize: 12, marginBottom: 4 }}>
              {SKILL_LABELS[card.id] ?? card.name}
            </div>
            <div className={clsx("funnel-card-value", card.active ? "ok" : "warn")} style={{ fontSize: 13 }}>
              {card.active ? "active" : "idle"} · {Math.round(card.confidence)}%
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{card.summary}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
