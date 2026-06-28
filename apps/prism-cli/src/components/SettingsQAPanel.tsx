import { useCallback, useState } from "react";
import { loadSettings, saveSettings } from "../lib/prism-bridge";

export default function SettingsQAPanel() {
  const initial = loadSettings();
  const [rps, setRps] = useState(initial.qaRateLimitRps ?? 10);
  const [burst, setBurst] = useState(initial.qaRateLimitBurst ?? 20);
  const [dryRun, setDryRun] = useState(initial.exchangeQaDryRun ?? true);
  const [saved, setSaved] = useState(false);

  const persist = useCallback(() => {
    saveSettings({
      ...loadSettings(),
      qaRateLimitRps: rps,
      qaRateLimitBurst: burst,
      exchangeQaDryRun: dryRun,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [rps, burst, dryRun]);

  return (
    <div className="funnel-panel">
      <div className="funnel-panel-title">QA API rate limits</div>
      <div className="funnel-settings-row">
        <label htmlFor="qa-rps">Requests/sec</label>
        <input
          id="qa-rps"
          type="number"
          min={1}
          max={100}
          value={rps}
          onChange={(e) => setRps(Number(e.target.value))}
        />
      </div>
      <div className="funnel-settings-row">
        <label htmlFor="qa-burst">Burst</label>
        <input
          id="qa-burst"
          type="number"
          min={1}
          max={200}
          value={burst}
          onChange={(e) => setBurst(Number(e.target.value))}
        />
      </div>
      <div className="funnel-settings-row">
        <label htmlFor="qa-dry-run">Dry-run mode</label>
        <input
          id="qa-dry-run"
          type="checkbox"
          checked={dryRun}
          onChange={(e) => setDryRun(e.target.checked)}
        />
        <span style={{ color: "var(--muted)", fontSize: 12 }}>
          {dryRun ? "Probes simulate only — no live orders" : "Live probes enabled"}
        </span>
      </div>
      <button type="button" className="investor-btn primary" onClick={persist}>
        {saved ? "Saved ✓" : "Save QA settings"}
      </button>
    </div>
  );
}
