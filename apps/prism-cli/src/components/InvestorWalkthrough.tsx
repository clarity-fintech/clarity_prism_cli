import { useState } from "react";
import clsx from "clsx";
import RewardsPanel from "./RewardsPanel";

export const ENTITLEMENT_STEPS = [
  {
    title: "Step 1 — Request Early Access",
    description: "Partner portal correlation ID links CLI session to VIS briefing.",
    cli: "clrt partner request-access --tier seed",
  },
  {
    title: "Step 2 — Identity / KYC",
    description: "CAGE/DUNS institutional ID + browser KYC handoff.",
    cli: "clrt prism identity --cage CAGE123",
  },
  {
    title: "Step 3 — Wallet register",
    description: "Link wallet before attestation blob generation.",
    cli: "clrt settlement register --wallet 0x...",
  },
  {
    title: "Step 4 — Attestation poll",
    description: "Wait for compliance attestation on registered wallet.",
    cli: "clrt settlement status --wallet 0x...",
  },
  {
    title: "Step 5 — Tier preview",
    description: "Allocation preview with multiplier, cliff, and vest schedule.",
    cli: "clrt settlement preview --usd-cents 5000000",
  },
  {
    title: "Step 6 — Treasury instructions",
    description: "Genesis treasury address and deposit rails.",
    cli: "clrt settlement instructions",
  },
  {
    title: "Step 7 — Confirm deposit",
    description: "Submit on-chain tx hash after treasury transfer.",
    cli: "clrt settlement confirm-deposit --tx 0x... --wallet 0x...",
  },
  {
    title: "Step 8 — Allocation binding",
    description: "Register binding + escrow status on clrty-1.",
    cli: "clrt settlement status --wallet 0x...",
  },
  {
    title: "Step 9 — Rewards + Mastermind pack",
    description: "Unlock First Access / Mastermind kit and tier benefits summary.",
    cli: "clrt pack download mastermind && clrt pack verify mastermind",
  },
];

interface InvestorWalkthroughProps {
  onComplete?: () => void;
  onBack?: () => void;
  skipAccountStep?: boolean;
  packVerified?: boolean;
  tier?: string;
}

export default function InvestorWalkthrough({
  onComplete,
  onBack,
  skipAccountStep = false,
  packVerified = false,
  tier = "seed",
}: InvestorWalkthroughProps) {
  const [step, setStep] = useState(0);
  const steps = ENTITLEMENT_STEPS;
  const current = steps[step]!;
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="funnel-panel investor-wizard">
      <div className="funnel-panel-title">
        Investor walkthrough — step {step + 1} of {steps.length}
        {skipAccountStep && (
          <button type="button" className="investor-btn" style={{ marginLeft: 12 }} onClick={onBack}>
            Back to account
          </button>
        )}
      </div>
      <div className="investor-progress">
        <div className="investor-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="investor-step-dots">
        {steps.map((_, i) => (
          <span
            key={i}
            className={clsx("investor-dot", i < step && "done", i === step && "current")}
          />
        ))}
      </div>
      <div className="investor-step-title">{current.title}</div>
      <div className="investor-step-desc">{current.description}</div>
      <code style={{ display: "block", fontSize: 11, margin: "8px 0", color: "var(--muted)" }}>
        {current.cli}
      </code>

      {step === steps.length - 1 && (
        <RewardsPanel tier={tier} allocationConfirmed={packVerified} packVerified={packVerified} />
      )}

      <div className="investor-step-actions">
        <button
          type="button"
          className="investor-btn"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button type="button" className="investor-btn primary" onClick={() => setStep((s) => s + 1)}>
            Next
          </button>
        ) : (
          <button type="button" className="investor-btn primary" onClick={() => onComplete?.()}>
            Complete
          </button>
        )}
      </div>
    </div>
  );
}
