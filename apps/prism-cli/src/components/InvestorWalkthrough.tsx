import { useState } from "react";
import clsx from "clsx";
import RewardsPanel from "./RewardsPanel";

const DRAFT_KEY = "prism-investor-account-draft";

const STEPS = [
  {
    title: "Step 1 — Create account",
    description: "Passwordless CLI profile. Username is your P2P identity on PRISM Commons.",
    cli: 'clrt account create --username USER --entity "Firm" --email you@firm.com --intent liquidity',
  },
  {
    title: "Step 2 — Request Early Access",
    description: "Partner portal correlation ID links CLI session to VIS briefing.",
    cli: "clrt partner request-access --entity Firm --intent liquidity",
  },
  {
    title: "Step 3 — Identity / KYC",
    description: "CAGE/DUNS institutional ID + browser KYC handoff.",
    cli: "clrt prism identity --cage CAGE123",
  },
  {
    title: "Step 4 — Wallet register",
    description: "Link wallet before attestation blob generation.",
    cli: "clrt settlement register --wallet 0x...",
  },
  {
    title: "Step 5 — Attestation poll",
    description: "Wait for compliance attestation on registered wallet.",
    cli: "clrt settlement status --wallet 0x...",
  },
  {
    title: "Step 6 — Tier preview",
    description: "Allocation preview with multiplier, cliff, and vest schedule.",
    cli: "clrt settlement preview --usd-cents 5000000",
  },
  {
    title: "Step 7 — Treasury instructions",
    description: "Genesis treasury address and deposit rails.",
    cli: "clrt settlement instructions",
  },
  {
    title: "Step 8 — Confirm deposit",
    description: "Submit on-chain tx hash after treasury transfer.",
    cli: "clrt settlement confirm-deposit --wallet 0x... --tx-hash 0x...",
  },
  {
    title: "Step 9 — Allocation binding",
    description: "Register binding + escrow status on clrty-1.",
    cli: "clrt settlement status --wallet 0x...",
  },
  {
    title: "Step 10 — Rewards + Mastermind pack",
    description: "Unlock First Access / Mastermind kit and tier benefits summary.",
    cli: "clrt pack download mastermind",
  },
];

interface InvestorWalkthroughProps {
  onComplete?: () => void;
}

export default function InvestorWalkthrough({ onComplete }: InvestorWalkthroughProps) {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [entity, setEntity] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("seed");
  const current = STEPS[step]!;
  const progress = ((step + 1) / STEPS.length) * 100;

  const saveDraft = () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ username: username.trim().toLowerCase(), entity, email, tier, step: step + 1 })
    );
  };

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
      <code style={{ display: "block", fontSize: 11, margin: "8px 0", color: "var(--muted)" }}>
        {current.cli}
      </code>

      {step === 0 && (
        <div className="investor-form" style={{ margin: "12px 0", display: "grid", gap: 8 }}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alice"
              style={{ display: "block", width: "100%", marginTop: 4 }}
            />
          </label>
          <label>
            Entity
            <input
              type="text"
              value={entity}
              onChange={(e) => setEntity(e.target.value)}
              placeholder="Acme Capital"
              style={{ display: "block", width: "100%", marginTop: 4 }}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="a@acme.com"
              style={{ display: "block", width: "100%", marginTop: 4 }}
            />
          </label>
          <label>
            Tier interest
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: 4 }}
            >
              <option value="seed">Seed Genesis</option>
              <option value="strategic">Strategic Round</option>
              <option value="hardware-node">Hardware Node Partner</option>
            </select>
          </label>
        </div>
      )}

      {step === 9 && <RewardsPanel tier={tier} allocationConfirmed={false} />}

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
            onClick={() => {
              if (step === 0) saveDraft();
              setStep((s) => s + 1);
            }}
            disabled={step === 0 && (!username.trim() || username.trim().length < 3)}
          >
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
