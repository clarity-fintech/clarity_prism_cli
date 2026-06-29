const TIERS = [
  {
    id: "seed",
    label: "Seed Genesis",
    multiplier: "1.5×",
    cliff: "6M",
    vest: "24M",
    benefits: ["Genesis priority lanes", "16M cap binding", "Mastermind pack unlock"],
  },
  {
    id: "strategic",
    label: "Strategic Round",
    multiplier: "1.75×",
    cliff: "6M",
    vest: "24M",
    benefits: ["High-priority HELIX lanes", "Safe + escrow", "PRISM tier II–III"],
  },
  {
    id: "hardware-node",
    label: "Hardware Node Partner",
    multiplier: "2.0×",
    cliff: "12M",
    vest: "36M",
    benefits: ["Validator priority", "Dedicated L3 partition", "PoR multiplier boost"],
  },
];

interface RewardsPanelProps {
  tier?: string;
  allocationConfirmed?: boolean;
}

export default function RewardsPanel({ tier = "seed", allocationConfirmed = false }: RewardsPanelProps) {
  const selected = TIERS.find((t) => t.id === tier) ?? TIERS[0]!;

  return (
    <div className="funnel-panel rewards-panel">
      <div className="funnel-panel-title">Allocated rewards and benefits</div>
      {!allocationConfirmed && (
        <div className="funnel-panel-desc" style={{ marginBottom: 8, color: "var(--muted)" }}>
          Preview — complete settlement confirm-deposit (Step 9) to unlock Mastermind pack.
        </div>
      )}
      <div className="funnel-panel-grid">
        <div className="funnel-card">
          <div className="funnel-card-label">Tier</div>
          <div className="funnel-card-value">{selected.label}</div>
        </div>
        <div className="funnel-card">
          <div className="funnel-card-label">Multiplier</div>
          <div className="funnel-card-value ok">{selected.multiplier}</div>
        </div>
        <div className="funnel-card">
          <div className="funnel-card-label">Cliff / Vest</div>
          <div className="funnel-card-value">
            {selected.cliff} / {selected.vest}
          </div>
        </div>
        <div className="funnel-card">
          <div className="funnel-card-label">Mastermind pack</div>
          <div className={allocationConfirmed ? "funnel-card-value ok" : "funnel-card-value"}>
            {allocationConfirmed ? "UNLOCKED" : "locked"}
          </div>
        </div>
      </div>
      <ul style={{ marginTop: 12, fontSize: 12, color: "var(--muted)", paddingLeft: 18 }}>
        {selected.benefits.map((b) => (
          <li key={b}>{b}</li>
        ))}
        <li>First Access Pack · 28 AP-* access packs via clrt pack list</li>
      </ul>
      {allocationConfirmed && (
        <code style={{ display: "block", marginTop: 8, fontSize: 11 }}>
          clrt pack download mastermind && clrt pack download wallet-integration
        </code>
      )}
    </div>
  );
}
