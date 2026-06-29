import { useState } from "react";
import {
  fetchAccountStatus,
  registerAccount,
  requestPartnerAccessBrowser,
  verifyMastermindPackBrowser,
  type BrowserAccountProfile,
} from "../lib/prism-bridge";
import { validateUsername, unlockAdmin, type EntitlementSnapshot } from "../lib/access-gate";

interface AccountSectionProps {
  profile: BrowserAccountProfile | null;
  entitlements: EntitlementSnapshot;
  onAccountCreated: (profile: BrowserAccountProfile) => void;
  onEntitled: () => void;
  onShowWalkthrough: () => void;
}

export default function AccountSection({
  profile,
  entitlements,
  onAccountCreated,
  onEntitled,
  onShowWalkthrough,
}: AccountSectionProps) {
  const [username, setUsername] = useState(profile?.username ?? "");
  const [entity, setEntity] = useState(profile?.entity ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [intent, setIntent] = useState(profile?.intent ?? "liquidity");
  const [tier, setTier] = useState(profile?.tierInterest ?? "seed");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [statusJson, setStatusJson] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    setMessage(null);
    const v = validateUsername(username);
    if (!v.ok) {
      setError(v.error);
      return;
    }
    if (!entity.trim() || !email.trim()) {
      setError("entity and email are required");
      return;
    }
    setBusy(true);
    const result = await registerAccount({
      username: v.username,
      entity: entity.trim(),
      email: email.trim(),
      intent: intent.trim() || "liquidity",
      tierInterest: tier,
    });
    setBusy(false);
    if (!result.ok || !result.profile) {
      setError(result.error ?? "account create failed");
      return;
    }
    setMessage(`Account created: @${result.profile.username} (${result.profile.correlationId.slice(0, 8)}…)`);
    onAccountCreated(result.profile);
  };

  const handleCheckStatus = async () => {
    setBusy(true);
    const status = await fetchAccountStatus(profile?.username);
    setStatusJson(JSON.stringify(status, null, 2));
    setBusy(false);
  };

  const handlePartner = async () => {
    setBusy(true);
    const r = await requestPartnerAccessBrowser();
    setBusy(false);
    setMessage(r.ok ? `Partner request: ${r.status}` : "Create account first");
  };

  const handleMastermind = async () => {
    setBusy(true);
    const r = await verifyMastermindPackBrowser();
    setBusy(false);
    if (r.ok) {
      setMessage("Mastermind pack verified — unlocking terminal…");
      onEntitled();
    } else {
      setError("Mastermind verify failed — run: clrt pack download mastermind");
    }
  };

  const handleAdmin = () => {
    if (unlockAdmin(adminPass)) {
      setMessage("Operator access granted");
      onEntitled();
    } else {
      setError("Invalid operator password");
    }
  };

  const cliCmd = profile
    ? `clrt account create --username ${profile.username} --entity "${profile.entity}" --email ${profile.email} --intent ${profile.intent}`
    : `clrt account create --username ${username || "alice"} --entity "Acme" --email a@acme.com --intent liquidity`;

  return (
    <div className="funnel-panel account-section">
      <div className="account-gate-title">PRISM Terminal — Temporarily Unavailable</div>
      <div className="account-gate-sub">
        General access is limited to approved investors and Volkov Mastermind First Access pack
        holders until public launch. You can still create your account below.
      </div>

      {!profile ? (
        <div className="investor-form account-form">
          <label>
            Username
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="alice" />
          </label>
          <label>
            Entity
            <input type="text" value={entity} onChange={(e) => setEntity(e.target.value)} placeholder="Acme Capital" />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="a@acme.com" />
          </label>
          <label>
            Intent
            <input type="text" value={intent} onChange={(e) => setIntent(e.target.value)} placeholder="liquidity" />
          </label>
          <label>
            Tier interest
            <select value={tier} onChange={(e) => setTier(e.target.value)}>
              <option value="seed">Seed Genesis</option>
              <option value="strategic">Strategic Round</option>
              <option value="hardware-node">Hardware Node Partner</option>
            </select>
          </label>
          <div className="investor-step-actions">
            <button type="button" className="investor-btn primary" disabled={busy} onClick={() => void handleCreate()}>
              Create account
            </button>
          </div>
        </div>
      ) : (
        <div className="account-created-panel">
          <div className="funnel-card">
            <div className="funnel-card-label">Username</div>
            <div className="funnel-card-value">@{profile.username}</div>
          </div>
          <div className="funnel-card">
            <div className="funnel-card-label">Namespace</div>
            <div className="funnel-card-value">clrty://@{profile.username}</div>
          </div>
          <div className="funnel-card">
            <div className="funnel-card-label">Correlation ID</div>
            <div className="funnel-card-value">{profile.correlationId}</div>
          </div>
          <code className="account-cli-hint">{cliCmd}</code>
        </div>
      )}

      {message && <div className="account-gate-msg ok">{message}</div>}
      {error && <div className="account-gate-msg err">{error}</div>}

      <div className="account-unlock-paths">
        <div className="funnel-panel-title">Unlock full terminal (any one path)</div>
        <ul className="account-unlock-list">
          <li>
            <strong>Investor</strong> — complete settlement walkthrough
            {entitlements.investor ? " ✓" : ""}
            <button type="button" className="investor-btn" onClick={onShowWalkthrough}>
              Open investor walkthrough
            </button>
          </li>
          <li>
            <strong>Mastermind pack</strong> — verify First Access manifest
            {entitlements.mastermindPack ? " ✓" : ""}
            <button type="button" className="investor-btn" disabled={busy} onClick={() => void handleMastermind()}>
              Verify mastermind pack
            </button>
            <code>clrt pack download mastermind</code>
          </li>
          <li>
            <strong>Partner early access</strong> — request approval
            {entitlements.partnerApproved ? " ✓" : ` (${entitlements.partnerStatus})`}
            <button type="button" className="investor-btn" disabled={busy || !profile} onClick={() => void handlePartner()}>
              Request partner access
            </button>
            <code>clrt partner request-access</code>
          </li>
        </ul>
      </div>

      <div className="investor-step-actions">
        <button type="button" className="investor-btn" disabled={busy} onClick={() => void handleCheckStatus()}>
          Check status
        </button>
        <button type="button" className="investor-btn" onClick={() => setShowAdmin((s) => !s)}>
          Operator access
        </button>
      </div>

      {showAdmin && (
        <div className="account-admin-panel">
          <input
            type="password"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            placeholder="Admin password"
          />
          <button type="button" className="investor-btn primary" onClick={handleAdmin}>
            Unlock terminal
          </button>
        </div>
      )}

      {statusJson && (
        <pre className="account-status-json">{statusJson}</pre>
      )}
    </div>
  );
}
