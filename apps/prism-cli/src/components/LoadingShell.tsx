import PrismLogo from "./PrismLogo";

export default function LoadingShell() {
  return (
    <div className="terminal account-gate account-gate-loading theme-bw">
      <PrismLogo variant="bw" size={64} compact showWord />
      <div className="account-gate-title">PRISM Terminal</div>
      <div className="account-gate-sub">Resolving access state…</div>
    </div>
  );
}
