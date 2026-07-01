import { useState, type FormEvent } from "react";
import {
  unlockAdmin,
  unlockPersonalAccess,
  adminLoginConfigured,
  personalLoginConfigured,
} from "../lib/access-gate";

const GATE_CONTACT_EMAIL = "william@clarity-fintech.com";

interface AdminLoginSectionProps {
  onEntitled: () => void;
}

export default function AdminLoginSection({ onEntitled }: AdminLoginSectionProps) {
  const [adminPass, setAdminPass] = useState("");
  const [personalCode, setPersonalCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const adminReady = adminLoginConfigured();
  const personalReady = personalLoginConfigured();

  const handleAdminLogin = (e?: FormEvent) => {
    e?.preventDefault();
    setError(null);
    setMessage(null);
    if (!adminPass.trim()) {
      setError("Enter operator password");
      return;
    }
    if (!adminReady) {
      setError("Operator login not configured — set CLRTY_PRISM_ADMIN_PASS in .env and run make launch-prism");
      return;
    }
    if (unlockAdmin(adminPass)) {
      setMessage("Operator login successful — loading full PRISM terminal…");
      onEntitled();
    } else {
      setError("Invalid operator password");
    }
  };

  const handlePersonalLogin = async (e?: FormEvent) => {
    e?.preventDefault();
    setError(null);
    setMessage(null);
    if (!personalCode.trim()) {
      setError("Enter personal access code");
      return;
    }
    if (!personalReady) {
      setError("Personal access not configured — set CLRTY_GATE_MASTER in .env and run make launch-prism");
      return;
    }
    setBusy(true);
    const ok = await unlockPersonalAccess(personalCode);
    setBusy(false);
    if (ok) {
      setMessage("Personal access granted — loading full PRISM terminal…");
      onEntitled();
    } else {
      setError("Invalid access code — run clrt gate password to verify your code");
    }
  };

  return (
    <div className="funnel-panel account-admin-section">
      <div className="account-admin-header">
        <span className="account-admin-badge">OPERATOR LOGIN</span>
        <span className="account-admin-sub">Full PRISM terminal access</span>
      </div>

      <form className="account-admin-form" onSubmit={(e) => void handleAdminLogin(e)}>
        <div className="account-admin-row">
          <label htmlFor="admin-pass">
            Operator password
            {!adminReady && <span className="account-admin-warn"> (not configured)</span>}
          </label>
          <div className="account-admin-input-row">
            <input
              id="admin-pass"
              type="password"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              placeholder={adminReady ? "Enter operator password" : "Set CLRTY_PRISM_ADMIN_PASS in .env"}
              autoComplete="current-password"
              disabled={busy}
            />
            <button type="submit" className="investor-btn primary" disabled={busy}>
              Enter PRISM
            </button>
          </div>
        </div>
      </form>

      <div className="account-admin-divider">
        <span>or personal access code</span>
      </div>

      <form className="account-admin-form" onSubmit={(e) => void handlePersonalLogin(e)}>
        <div className="account-admin-row">
          <label htmlFor="personal-code">
            Personal access code
            {!personalReady && <span className="account-admin-warn"> (not configured)</span>}
          </label>
          <div className="account-admin-input-row">
            <input
              id="personal-code"
              type="password"
              value={personalCode}
              onChange={(e) => setPersonalCode(e.target.value)}
              placeholder={personalReady ? "XXXX-XXXX-XXXX-XXXX" : "Set CLRTY_GATE_MASTER in .env"}
              autoComplete="off"
              disabled={busy}
            />
            <button type="submit" className="investor-btn primary" disabled={busy}>
              Unlock PRISM
            </button>
          </div>
        </div>
      </form>

      <div className="account-admin-hints">
        <code>clrt gate password</code>
        <span>·</span>
        <code>make launch-prism</code>
        <span>·</span>
        <code>clrt gate sync</code>
      </div>

      {message && <div className="account-gate-msg ok">{message}</div>}
      {error && <div className="account-gate-msg err">{error}</div>}

      {!adminReady && !personalReady && (
        <div className="account-gate-msg err account-admin-setup-hint">
          No login methods configured. Copy <code>.env.example</code> to <code>.env</code>, set{" "}
          <code>CLRTY_PRISM_ADMIN_PASS</code> and/or <code>CLRTY_GATE_MASTER</code>, then run{" "}
          <code>make launch-prism</code>.
        </div>
      )}

      <div className="account-admin-footer">
        Operator: <a href={`mailto:${GATE_CONTACT_EMAIL}`}>{GATE_CONTACT_EMAIL}</a>
      </div>
    </div>
  );
}
