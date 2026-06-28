import { useState } from "react";
import clsx from "clsx";

const STEPS = [
  {
    title: "Welcome — Investor Terminal",
    description: "This walkthrough guides capital partners through CLRTY onboarding, attestation, and settlement lanes.",
  },
  {
    title: "Account verification",
    description: "Confirm entity type (individual, fund, institution) and link primary contact email for attestation notices.",
  },
  {
    title: "KYC / compliance gate",
    description: "Identity verification via SOC2-aligned providers. Status syncs to governance override hierarchy.",
  },
  {
    title: "Capital allocation profile",
    description: "Define risk tier, max drawdown, and preferred execution lanes (HELIX internal vs queue slippage gate).",
  },
  {
    title: "Wallet attestation",
    description: "Link cold / hot wallets. Entropy hedge layer (EHL) scores wallet exposure before first commit.",
  },
  {
    title: "Settlement preferences",
    description: "Choose attestation tier: shadow → attested → canonical. Treasury routing defaults to deferred until PoR pass.",
  },
  {
    title: "Exchange connectivity",
    description: "Optional deep links to Binance, Coinbase, Kraken for QA dry-run probes — no live orders in walkthrough.",
  },
  {
    title: "Governance acknowledgment",
    description: "Review override hierarchy and compliance genesis instructions. Sign attestation hash locally.",
  },
  {
    title: "Pipeline dry-run",
    description: "Execute PRISM → HELIX → chain pipeline in shadow mode. Review forecast and simulation output.",
  },
  {
    title: "Activation complete",
    description: "Account ready for attested commits. Mini-git ledger records this session. Contact partner portal for live capital.",
  },
];

interface InvestorWalkthroughProps {
  onComplete?: () => void;
}

export default function InvestorWalkthrough({ onComplete }: InvestorWalkthroughProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step]!;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="funnel-panel investor-wizard">
      <div className="funnel-panel-title">
        Investor walkthrough — step {step + 1} of {STEPS.length}
      </div>
      <div className="investor-progress">
        <div className="investor-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="investor-step-dots">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={clsx("investor-dot", i < step && "done", i === step && "current")}
          />
        ))}
      </div>
      <div className="investor-step-title">{current.title}</div>
      <div className="investor-step-desc">{current.description}</div>
      <div className="investor-step-actions">
        <button
          type="button"
          className="investor-btn"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className="investor-btn primary"
            onClick={() => setStep((s) => s + 1)}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            className="investor-btn primary"
            onClick={() => onComplete?.()}
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
}
