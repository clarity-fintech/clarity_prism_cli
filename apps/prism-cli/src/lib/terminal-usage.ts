import type { OutputLine } from "./prism-bridge";
import { portFeedLabel } from "./port-backed";
import { versionLabel } from "./version";

/** Full PRISM terminal usage — terminal-only, port-fed when live. */
export function fullTerminalUsageLines(): OutputLine[] {
  const sections: Array<{ title: string; lines: string[] }> = [
    {
      title: "LAUNCH",
      lines: [
        "make launch-prism          — native shell: full clrt in this terminal",
        "make launch-prism-web      — optional browser UI at :5174",
        "cargo run -p clrty-api     — from monorepo if API not auto-started",
        "make launch-prism-local    — offline dev stubs only (no port)",
      ],
    },
    {
      title: "NAVIGATION",
      lines: [
        "↑ / ↓ — select funnel or command",
        "Enter — run selected command",
        "Esc — home funnel",
        "Type at prompt — free-form command or PRISM chat intent",
      ],
    },
    {
      title: "UNLOCK (account gate)",
      lines: [
        "Operator password — CLRTY_PRISM_ADMIN_PASS",
        "Personal code — clrt gate password",
        "Investor walkthrough · Mastermind pack · Partner approval",
      ],
    },
    {
      title: "FUNNELS (all port-fed when LIVE)",
      lines: [
        "PRISM — query, predict, validate, trace, stats, cache",
        "HELIX — status, execute, simulate, liquidity",
        "Skills — market-arbitrage, momentum, payment, risk",
        "QA Trading — exchange probes + full QA scan",
        "Pipeline — full PRISM→HELIX run, pack status/sync",
        "Chain — ready gate, status, indexer, DX primitives",
        "Commons — PANEL ONLY: 1GB cache, paste, send, library, tax ledger",
        "Wallet — status, balance, registry, nodes, connect",
        "Settlement · Investor · Partner · Identity · Governance",
        "Integrations · Nodes · Ledger · Config · Updates",
      ],
    },
    {
      title: "COMMONS (terminal panel only)",
      lines: [
        "Open Commons funnel → paste, copy, send, library, ledger",
        "prism commons inbox · prism commons receive <id>",
        "Blocked: send/cache/library via CLI or typed commands",
      ],
    },
    {
      title: "TYPED COMMANDS (examples)",
      lines: [
        "prism query arbitrage opportunities",
        "helix status · chain ready · wallet balance",
        "exchange probe binance · pipeline optimize yield",
        "integrations · settlement status · account status",
        "help — this guide",
      ],
    },
  ];

  const out: OutputLine[] = [
    { text: `PRISM TERMINAL — FULL USAGE (${versionLabel()})`, tone: "prism" },
    { text: portFeedLabel(), tone: "success" },
    { text: "Terminal-only full use · backend port feeds all live data", tone: "muted" },
    { text: "", tone: "muted" },
  ];

  for (const s of sections) {
    out.push({ text: s.title, tone: "helix" });
    for (const line of s.lines) {
      out.push({ text: `  ${line}`, tone: "muted" });
    }
    out.push({ text: "", tone: "muted" });
  }

  out.push({ text: "Contact: william@clarity-fintech.com", tone: "muted" });
  return out;
}
