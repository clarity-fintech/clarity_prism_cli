export type FunnelId =
  | "home"
  | "prism"
  | "helix"
  | "skills"
  | "qa-trading"
  | "pipeline"
  | "chain"
  | "commons"
  | "partner"
  | "investor"
  | "settlement"
  | "ledger"
  | "integrations"
  | "identity"
  | "governance"
  | "config"
  | "commands"
  | "nodes"
  | "wallet"
  | "updates";

export interface FunnelCommand {
  key: string;
  label: string;
  hint?: string;
}

export type AccessLevel = "public" | "account" | "entitled";

export interface Funnel {
  id: FunnelId;
  label: string;
  icon: string;
  description: string;
  requiresAccess?: AccessLevel;
  commands: FunnelCommand[];
}

export const FUNNELS: Funnel[] = [
  {
    id: "home",
    label: "Home",
    icon: "",
    description: "PRISM terminal — select a funnel",
    commands: [],
  },
  {
    id: "prism",
    label: "PRISM Intelligence",
    icon: "",
    description: "Intent · prediction · PoR · cache · adversarial QA",
    commands: [
      { key: "query", label: "Intent query", hint: 'Type intent e.g. "arbitrage opportunities"' },
      { key: "predict", label: "Capital predict", hint: "Type: predict 5000" },
      { key: "validate", label: "Adversarial validate", hint: "Type: validate your claim" },
      { key: "trace", label: "Trace log", hint: "Press Enter for mini-git log" },
      { key: "stats", label: "Network stats", hint: "Press Enter for metrics" },
      { key: "prism cache", label: "Cache status", hint: "Press Enter to inspect cache" },
    ],
  },
  {
    id: "helix",
    label: "HELIX Execution",
    icon: "",
    description: "Routing · simulation · MEV protection · swap execution",
    commands: [
      { key: "helix status", label: "Kernel status", hint: "Press Enter" },
      { key: "helix execute", label: "Execute swap", hint: "Type: swap SOL USDC 1000" },
      { key: "helix simulate", label: "Simulate swap", hint: "Type: simulate 500" },
      { key: "helix liquidity", label: "Liquidity scan", hint: "Type: scan SOL/USDC" },
    ],
  },
  {
    id: "skills",
    label: "Skills Runtime",
    icon: "",
    description: "Modular capital-aware execution — MCA · TSR · AVR · EHL",
    commands: [
      { key: "skill run", label: "market-arbitrage", hint: "Type capital e.g. 1000" },
      { key: "skill momentum", label: "trend-momentum", hint: "Press Enter to run" },
      { key: "skill payment", label: "payment-executor", hint: "Press Enter to run" },
      { key: "skill risk", label: "risk-manager", hint: "Press Enter to run" },
    ],
  },
  {
    id: "qa-trading",
    label: "QA Trading",
    icon: "",
    description: "Exchange QA · rate limits · dry-run probes",
    commands: [
      { key: "exchange probe binance", label: "Probe Binance", hint: "Dry-run connectivity check" },
      { key: "exchange probe coinbase", label: "Probe Coinbase", hint: "Dry-run connectivity check" },
      { key: "exchange probe kraken", label: "Probe Kraken", hint: "Dry-run connectivity check" },
      { key: "exchange qa scan", label: "Full exchange QA scan", hint: "Run all probes with rate limits" },
    ],
  },
  {
    id: "pipeline",
    label: "Full Pipeline",
    icon: "",
    description: "PRISM → HELIX → chain commit",
    commands: [
      { key: "pipeline", label: "Run full pipeline", hint: 'Type intent e.g. "optimize yield"' },
      { key: "pack status", label: "Pack status", hint: "Press Enter for pack snapshot" },
      { key: "pack sync", label: "Sync pack", hint: "Press Enter to sync local pack" },
    ],
  },
  {
    id: "chain",
    label: "Chain — clrty-1",
    icon: "",
    description: "clrty-1 L1 status · readiness gate · block height",
    commands: [
      { key: "chain ready", label: "Chain ready gate", hint: "Press Enter for pass/fail matrix" },
      { key: "chain status", label: "Chain status", hint: "Press Enter for clrty-1 snapshot" },
      { key: "chain indexer", label: "L1 indexer", hint: "Press Enter for indexer feed" },
      { key: "chain dx list", label: "DX primitives", hint: "Press Enter for DX catalog" },
    ],
  },
  {
    id: "commons",
    label: "Commons",
    icon: "",
    description: "Username P2P · CAS send · inbox · receive",
    commands: [
      { key: "prism commons send", label: "Send to username", hint: "clrt prism commons send --to USER --file PATH" },
      { key: "prism commons inbox", label: "Inbox", hint: "Press Enter for inbound transfers" },
      { key: "prism commons receive", label: "Receive transfer", hint: "Type transfer id after inbox" },
      { key: "prism commons discover", label: "Discover assets", hint: "Type topic to search" },
    ],
  },
  {
    id: "partner",
    label: "Partner Portal",
    icon: "",
    description: "Partner integrations · API keys · revenue share",
    requiresAccess: "account",
    commands: [
      { key: "partner status", label: "Partner status", hint: "Press Enter" },
      { key: "partner keys", label: "API keys", hint: "Press Enter to list keys" },
    ],
  },
  {
    id: "investor",
    label: "Investor Terminal",
    icon: "",
    description: "Account onboarding · capital walkthrough · attestation",
    requiresAccess: "account",
    commands: [
      { key: "account status", label: "Account status", hint: "Press Enter for account snapshot" },
      { key: "account kyc", label: "KYC status", hint: "Press Enter" },
      { key: "investor walkthrough", label: "Start walkthrough", hint: "Press Enter for 10-step wizard" },
    ],
  },
  {
    id: "settlement",
    label: "Settlement",
    icon: "",
    description: "Attestations · treasury · compliance genesis",
    requiresAccess: "account",
    commands: [
      { key: "settlement status", label: "Settlement status", hint: "Press Enter" },
      { key: "settlement attest", label: "List attestations", hint: "Press Enter" },
    ],
  },
  {
    id: "ledger",
    label: "Mini-Git Ledger",
    icon: "",
    description: "Browser ledger · trace · validate · stats",
    commands: [
      { key: "trace", label: "Trace log", hint: "Press Enter" },
      { key: "prism validate", label: "Validate entry", hint: "Type claim to validate" },
      { key: "stats", label: "Ledger stats", hint: "Press Enter" },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: "",
    description: "PRISM → HELIX → indexer → settlement → intelligence",
    commands: [
      { key: "integrations", label: "Blockchain integrations", hint: "Press Enter for live snapshot" },
      { key: "integrations probe", label: "Probe all layers", hint: "Press Enter" },
    ],
  },
  {
    id: "identity",
    label: "Identity",
    icon: "",
    description: "Wallet · credentials · attestation identity",
    requiresAccess: "account",
    commands: [
      { key: "identity status", label: "Identity status", hint: "Press Enter" },
      { key: "identity wallet", label: "Linked wallets", hint: "Press Enter" },
    ],
  },
  {
    id: "governance",
    label: "Governance",
    icon: "",
    description: "Proposals · overrides · compliance gates",
    commands: [
      { key: "governance status", label: "Governance status", hint: "Press Enter" },
      { key: "governance proposals", label: "Active proposals", hint: "Press Enter" },
    ],
  },
  {
    id: "config",
    label: "Configuration",
    icon: "",
    description: "API URL · API key · projects · environment",
    commands: [
      { key: "config api", label: "Set API URL & key", hint: "Press Enter to configure" },
      { key: "config projects", label: "Manage projects", hint: "Press Enter" },
    ],
  },
  {
    id: "commands",
    label: "Command Runner",
    icon: "",
    description: "Preview clrt commands with live output",
    commands: [
      { key: "prism query", label: "PRISM query — arbitrage scan" },
      { key: "prism predict", label: "PRISM predict — capital forecast" },
      { key: "prism validate", label: "PRISM validate — adversarial QA" },
      { key: "prism trace", label: "PRISM trace — mini-git log" },
      { key: "prism stats", label: "PRISM stats — network metrics" },
      { key: "helix execute", label: "HELIX execute swap" },
      { key: "helix simulate", label: "HELIX simulate swap" },
      { key: "helix liquidity", label: "HELIX liquidity scan" },
      { key: "pipeline", label: "Full pipeline — clrt run" },
    ],
  },
  {
    id: "nodes",
    label: "Nodes",
    icon: "",
    description: "PRISM node mesh · runtime probes",
    commands: [
      { key: "nodes list", label: "List nodes", hint: "Press Enter" },
      { key: "nodes probe", label: "Probe mesh", hint: "Press Enter" },
    ],
  },
  {
    id: "wallet",
    label: "CLRTY Wallet",
    icon: "",
    description: "Balance · registry · nodes · wallet connect",
    commands: [
      { key: "wallet status", label: "Wallet status", hint: "Press Enter for registry + username" },
      { key: "wallet balance", label: "Balance", hint: "Press Enter for clrty-1 balance" },
      { key: "wallet registry", label: "Registry", hint: "Press Enter for /v1/wallet/registry" },
      { key: "wallet nodes", label: "Leverage nodes", hint: "Press Enter for 25-node manifest" },
      { key: "wallet connect", label: "Connect wallet", hint: "clrt wallet connect --address 0x..." },
    ],
  },
  {
    id: "updates",
    label: "Updates",
    icon: "",
    description: "Version check · release notes",
    commands: [
      { key: "updates check", label: "Check for updates", hint: "Press Enter" },
      { key: "updates changelog", label: "View changelog", hint: "Press Enter" },
    ],
  },
];

export function getFunnel(id: FunnelId): Funnel {
  return FUNNELS.find((f) => f.id === id) ?? FUNNELS[0]!;
}

export function funnelNavItems(access: "blocked" | "account" | "entitled" = "entitled"): Funnel[] {
  return FUNNELS.filter((f) => {
    if (f.id === "home") return false;
    const level = f.requiresAccess ?? "entitled";
    if (access === "entitled") return true;
    if (access === "account") return level === "account" || level === "public";
    return level === "public";
  });
}

export function breadcrumbPath(funnelId: FunnelId, subLabel?: string): string {
  const funnel = getFunnel(funnelId);
  if (funnelId === "home" || !subLabel) return funnel.label;
  return `${funnel.label} › ${subLabel}`;
}

/** @deprecated Use FUNNELS from funnel-config instead */
export type MenuId = FunnelId;

/** @deprecated Use FUNNELS from funnel-config instead */
export const MENU_ITEMS = funnelNavItems().map((f) => ({
  id: f.id,
  icon: f.icon,
  label: f.label,
}));

/** @deprecated Use getFunnel('commands').commands instead */
export const COMMAND_OPTIONS = getFunnel("commands").commands.map((c) => ({
  key: c.key,
  label: c.label,
}));
