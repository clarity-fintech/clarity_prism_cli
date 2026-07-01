import {
  type OutputLine,
  CLI_COMMANDS,
  prismQuery,
  prismPredict,
  prismValidate,
  prismTrace,
  prismStats,
  fetchBlockchainIntegrations,
  fetchChainStatus,
  fetchChainReady,
  fetchWalletRegistry,
  fetchWalletBalance,
  fetchSettlementStatus,
  fetchAccountStatus,
  probeExchange,
  runPackOperation,
  loadBrowserProfile,
  apiFetch,
} from "./prism-bridge";
import { isLocalTerminal } from "../lib/local-mode";
import { isApiConnected, getPortLabel } from "./port-connection";
import { finishPortCommand, portRequiredBlock } from "./port-backed";
import { fullTerminalUsageLines } from "./terminal-usage";
import { versionLabel } from "./version";

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    tokens.push(m[1] ?? m[2] ?? m[3] ?? "");
  }
  return tokens;
}

function jsonBlock(label: string, data: unknown, tone: OutputLine["tone"] = "helix"): OutputLine[] {
  return [
    { text: label, tone },
    { text: JSON.stringify(data, null, 2), tone: "muted" },
  ];
}

function commandHeader(cmd: string): OutputLine[] {
  if (isLocalTerminal()) {
    return [
      { text: "LOCAL · OFFLINE", tone: "muted" },
      { text: cmd, tone: "helix" },
      { text: "", tone: "muted" },
    ];
  }
  if (isApiConnected()) {
    return [
      { text: `LIVE · port ${getPortLabel().replace(":", "")}`, tone: "success" },
      { text: cmd, tone: "helix" },
      { text: "", tone: "muted" },
    ];
  }
  return [
    { text: `API disconnected · ${getPortLabel()}`, tone: "risk" },
    { text: cmd, tone: "helix" },
    { text: "", tone: "muted" },
  ];
}

function findCommandKey(input: string): string | null {
  const normalized = input.trim().toLowerCase();
  if (CLI_COMMANDS[normalized]) return normalized;
  for (const key of Object.keys(CLI_COMMANDS)) {
    if (normalized === key || normalized.startsWith(`${key} `)) return key;
  }
  return null;
}

function parseFlag(tokens: string[], flag: string): string | undefined {
  const idx = tokens.findIndex((t) => t === flag || t.startsWith(`${flag}=`));
  if (idx < 0) return undefined;
  const tok = tokens[idx]!;
  if (tok.includes("=")) return tok.split("=").slice(1).join("=");
  return tokens[idx + 1];
}

async function routeTokens(tokens: string[]): Promise<OutputLine[]> {
  if (!tokens.length) return [{ text: "Empty command", tone: "muted" }];

  const [a, b, c] = tokens;
  const cmd = tokens.join(" ");
  const profile = loadBrowserProfile();
  const username = profile?.username ?? "guest";

  if (a === "help" || a === "full" || (a === "prism" && b === "help")) {
    return fullTerminalUsageLines();
  }

  // ── PRISM ──────────────────────────────────────────────────────────
  if (a === "prism") {
    if (b === "query") {
      const text = tokens.slice(2).join(" ").replace(/^["']|["']$/g, "") || "arbitrage opportunities";
      return [...commandHeader(cmd), ...(await prismQuery(text))];
    }
    if (b === "predict") {
      const capital = Number(parseFlag(tokens, "--capital") ?? tokens[2]?.replace(/\D/g, "") ?? "1000");
      return [...commandHeader(cmd), ...prismPredict(capital)];
    }
    if (b === "cache" && c === "status") {
      const remote = await apiFetch("/v1/prism/status");
      const data = remote ?? { mode: isLocalTerminal() ? "local" : "offline", cache: "browser" };
      return [...commandHeader(cmd), ...jsonBlock("PRISM CACHE", data)];
    }
    if (b === "validate") {
      const intent = parseFlag(tokens, "--intent") ?? "arbitrage_scan";
      const claim =
        parseFlag(tokens, "--claim") ??
        (tokens.slice(2).join(" ") || "Market opportunity within risk bounds");
      return [...commandHeader(cmd), ...prismValidate(claim, intent)];
    }
    if (b === "trace") {
      const n = Number(parseFlag(tokens, "-n") ?? "20");
      return [...commandHeader(cmd), ...prismTrace(n)];
    }
    if (b === "stats") {
      return [...commandHeader(cmd), ...prismStats()];
    }
    if (b === "queue") {
      return [
        ...commandHeader(cmd),
        ...jsonBlock("PRISM QUEUE", { pending: 0, running: false, mode: "browser-serial" }),
      ];
    }
    if (b === "commons") {
      return routeCommons(tokens.slice(2), cmd);
    }
  }

  // ── HELIX ──────────────────────────────────────────────────────────
  if (a === "helix") {
    if (b === "status") {
      const data = await apiFetch("/v1/helix/status");
      return finishPortCommand(commandHeader(cmd), "HELIX STATUS", data, {
        mode: "local-dev",
        kernel: "helix-shadow",
      });
    }
    if (b === "execute") {
      const from = parseFlag(tokens, "--from") ?? "SOL";
      const to = parseFlag(tokens, "--to") ?? "USDC";
      const amount = Number(parseFlag(tokens, "--amount") ?? "1000");
      const data = await apiFetch("/v1/helix/intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "swap", source: `${from}->${to}`, amount, asset: from }),
      });
      return finishPortCommand(commandHeader(cmd), "HELIX EXECUTE", data, {
        from,
        to,
        amount,
        mode: "local-dev",
      });
    }
    if (b === "simulate") {
      const amount = Number(parseFlag(tokens, "--amount") ?? "500");
      const from = parseFlag(tokens, "--from") ?? "SOL";
      const to = parseFlag(tokens, "--to") ?? "USDC";
      const preview = await apiFetch("/v1/helix/net/preview");
      return finishPortCommand(commandHeader(cmd), "HELIX SIMULATE", preview, {
        from,
        to,
        amount,
        slippage_pct: 0.12,
        mode: "local-dev",
      });
    }
    if (b === "liquidity") {
      const pair = tokens[3] ?? tokens[2] ?? "SOL/USDC";
      const intel = await apiFetch("/v1/intelligence/defi");
      return finishPortCommand(commandHeader(cmd), "HELIX LIQUIDITY", intel, {
        pair,
        depth_usd: 0,
        mode: "local-dev",
      });
    }
  }

  // ── SKILL ──────────────────────────────────────────────────────────
  if (a === "skill") {
    const skillName = b === "run" ? (c ?? "market-arbitrage") : (b ?? "market-arbitrage");
    const capital = Number(parseFlag(tokens, "--capital") ?? "1000");
    const remote = await apiFetch("/v1/skills/quantum");
    return finishPortCommand(commandHeader(cmd), "SKILL RUN", remote, {
      skill: skillName,
      capital,
      status: "local-dev",
    });
  }

  // ── CHAIN ──────────────────────────────────────────────────────────
  if (a === "chain") {
    if (b === "ready") {
      const matrix = await fetchChainReady();
      return [...commandHeader(cmd), ...jsonBlock(matrix.ready ? "CHAIN READY" : "CHAIN NOT READY", matrix)];
    }
    if (b === "status") {
      const data = await apiFetch("/v1/status");
      return finishPortCommand(commandHeader(cmd), "CHAIN STATUS", data, await fetchChainStatus());
    }
    if (b === "indexer") {
      const chain = parseFlag(tokens, "--chain") ?? "clrty-l1";
      const data = await apiFetch(`/v1/indexer/${encodeURIComponent(chain)}`);
      return finishPortCommand(commandHeader(cmd), "L1 INDEXER", data, await fetchChainStatus());
    }
    if (b === "dx") {
      if (c === "list" || !c) {
        const data = await apiFetch("/v1/dx/primitives");
        return finishPortCommand(commandHeader(cmd), "DX PRIMITIVES", data, {
          primitives: [],
          mode: "local-dev",
        });
      }
    }
  }

  // ── WALLET ─────────────────────────────────────────────────────────
  if (a === "wallet") {
    if (b === "status") {
      const snap = await fetchWalletRegistry();
      return [...commandHeader(cmd), ...jsonBlock("WALLET STATUS", snap)];
    }
    if (b === "balance") {
      const snap = await fetchWalletRegistry();
      const addr = c ?? snap.linkedAddress;
      if (!addr) return [...commandHeader(cmd), { text: "No address — link wallet or pass address", tone: "risk" }];
      const bal = await fetchWalletBalance(addr);
      return [...commandHeader(cmd), ...jsonBlock("WALLET BALANCE", bal)];
    }
    if (b === "registry") {
      const data = await apiFetch("/v1/wallet/registry");
      return [...commandHeader(cmd), ...jsonBlock("WALLET REGISTRY", data ?? { chain: "clrty-1", mode: "local" })];
    }
    if (b === "nodes") {
      const data = await apiFetch("/v1/wallet/nodes");
      return [...commandHeader(cmd), ...jsonBlock("WALLET NODES", data ?? { total_nodes: 25, mode: "local" })];
    }
    if (b === "connect") {
      const address = parseFlag(tokens, "--address");
      if (!address) return [...commandHeader(cmd), { text: "--address required", tone: "risk" }];
      const data = await apiFetch("/v1/wallet/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, username }),
      });
      return [...commandHeader(cmd), ...jsonBlock("WALLET CONNECT", data ?? { address, username, mode: "local" })];
    }
  }

  // ── SETTLEMENT ─────────────────────────────────────────────────────
  if (a === "settlement") {
    if (b === "status") {
      const snap = await fetchWalletRegistry();
      const wallet = snap.linkedAddress;
      if (wallet) {
        const data = await apiFetch(`/v1/compliance/wallet/${encodeURIComponent(wallet)}/status`);
        if (data) return [...commandHeader(cmd), ...jsonBlock("SETTLEMENT STATUS", data)];
      }
      const fallback = await fetchSettlementStatus();
      return [...commandHeader(cmd), ...jsonBlock("SETTLEMENT STATUS", fallback)];
    }
    if (b === "attest") {
      const snap = await fetchWalletRegistry();
      const wallet = snap.linkedAddress ?? "local";
      const data = await apiFetch(`/v1/compliance/attestation/${encodeURIComponent(wallet)}`);
      return [...commandHeader(cmd), ...jsonBlock("ATTESTATIONS", data ?? { wallet, mode: "local" })];
    }
    if (b === "instructions") {
      const data = await apiFetch("/v1/compliance/genesis-instructions");
      return [...commandHeader(cmd), ...jsonBlock("GENESIS INSTRUCTIONS", data ?? await fetchSettlementStatus())];
    }
  }

  // ── ACCOUNT ────────────────────────────────────────────────────────
  if (a === "account") {
    if (b === "status" || !b) {
      const snap = await fetchAccountStatus();
      return [...commandHeader(cmd), ...jsonBlock("ACCOUNT STATUS", snap)];
    }
    if (b === "kyc") {
      const snap = await fetchAccountStatus();
      return [...commandHeader(cmd), ...jsonBlock("KYC STATUS", { kyc: snap.kyc, investorClass: snap.investorClass })];
    }
  }

  // ── PARTNER ────────────────────────────────────────────────────────
  if (a === "partner") {
    if (b === "status") {
      const data = await apiFetch(
        profile?.correlationId
          ? `/v1/partner/status?correlation_id=${encodeURIComponent(profile.correlationId)}`
          : "/v1/partner/status"
      );
      return [...commandHeader(cmd), ...jsonBlock("PARTNER STATUS", data ?? { status: "none", mode: "local" })];
    }
    if (b === "keys") {
      const data = await apiFetch("/v1/integrations");
      return [...commandHeader(cmd), ...jsonBlock("PARTNER KEYS", data ?? { keys: [], mode: "local" })];
    }
  }

  // ── EXCHANGE ───────────────────────────────────────────────────────
  if (a === "exchange") {
    if (b === "probe") {
      const id = c ?? "binance";
      return [...commandHeader(cmd), ...(await probeExchange(id))];
    }
    if (b === "qa" && c === "scan") {
      const slugs = ["binance", "coinbase", "kraken"];
      const results = await Promise.all(
        slugs.map(async (slug) => ({
          slug,
          probe: (await apiFetch(`/v1/integrations/${slug}/probe`)) ?? { mode: "local-stub" },
        }))
      );
      return [...commandHeader(cmd), ...jsonBlock("EXCHANGE QA SCAN", { results })];
    }
    if (b === "list" || b === "status") {
      const data = await apiFetch("/v1/integrations");
      return [...commandHeader(cmd), ...jsonBlock("EXCHANGES", data ?? { mode: "local" })];
    }
  }

  // ── PACK ───────────────────────────────────────────────────────────
  if (a === "pack") {
    const op = b ?? "status";
    return [...commandHeader(cmd), ...(await runPackOperation(op))];
  }

  // ── INTEGRATIONS ───────────────────────────────────────────────────
  if (a === "integrations") {
    if (b === "probe") {
      const snap = await fetchBlockchainIntegrations();
      const probes = await Promise.all(
        (["prism", "helix", "indexer", "settlement", "intelligence"] as const).map(async (layer) => ({
          layer,
          ok: snap[layer] !== null,
          data: snap[layer],
        }))
      );
      return [...commandHeader(cmd), ...jsonBlock("INTEGRATION PROBE", { probes })];
    }
    const snap = await fetchBlockchainIntegrations();
    return [...commandHeader(cmd), ...jsonBlock("BLOCKCHAIN INTEGRATIONS", snap)];
  }

  // ── IDENTITY ───────────────────────────────────────────────────────
  if (a === "identity") {
    const data = {
      username: profile?.username ?? null,
      entity: profile?.entity ?? null,
      correlationId: profile?.correlationId ?? null,
      namespace: profile?.username ? `clrty://@${profile.username}` : null,
    };
    if (b === "wallet") {
      const snap = await fetchWalletRegistry();
      return [...commandHeader(cmd), ...jsonBlock("IDENTITY WALLETS", snap)];
    }
    return [...commandHeader(cmd), ...jsonBlock("IDENTITY", data)];
  }

  // ── GOVERNANCE ─────────────────────────────────────────────────────
  if (a === "governance") {
    if (b === "status") {
      const treasury = await apiFetch("/v1/compliance/treasury");
      return [...commandHeader(cmd), ...jsonBlock("GOVERNANCE", treasury ?? { mode: "local", proposals: [] })];
    }
    if (b === "proposals") {
      const alerts = await apiFetch("/v1/alerts");
      return [...commandHeader(cmd), ...jsonBlock("PROPOSALS", alerts ?? { active: [], mode: "local" })];
    }
  }

  // ── NODES ──────────────────────────────────────────────────────────
  if (a === "nodes") {
    if (b === "list") {
      const data = await apiFetch("/v1/wallet/nodes");
      return [...commandHeader(cmd), ...jsonBlock("NODES", data ?? { nodes: [], mode: "local" })];
    }
    if (b === "probe") {
      const [status, prism] = await Promise.all([
        apiFetch("/v1/status"),
        apiFetch("/v1/prism/status"),
      ]);
      return [...commandHeader(cmd), ...jsonBlock("MESH PROBE", { api: status, prism })];
    }
  }

  // ── PIPELINE / RUN ─────────────────────────────────────────────────
  if (a === "run" || a === "pipeline") {
    const intent = a === "pipeline" ? (tokens[1] ?? "optimize portfolio yield") : (b ?? "optimize portfolio yield");
    const capital = Number(parseFlag(tokens, "--capital") ?? "5000");
    const query = await prismQuery(intent);
    const helix = await apiFetch("/v1/helix/status");
    return [
      ...commandHeader(cmd),
      ...query,
      { text: "", tone: "muted" },
      ...jsonBlock("PIPELINE HELIX", { capital, helix: helix ?? { mode: "local" } }),
    ];
  }

  // ── UPDATES / VERSION ──────────────────────────────────────────────
  if (a === "updates" || a === "version") {
    return [
      ...commandHeader(cmd),
      ...jsonBlock("VERSION", {
        version: versionLabel(),
        chain_id: "clrty-1",
        api: isApiConnected() ? "connected" : isLocalTerminal() ? "local" : "disconnected",
      }),
    ];
  }

  // ── CONFIG ─────────────────────────────────────────────────────────
  if (a === "config") {
    return [...commandHeader(cmd), { text: "Use Configuration funnel to set API URL & key.", tone: "muted" }];
  }

  // ── INVESTOR ───────────────────────────────────────────────────────
  if (a === "investor" && b === "walkthrough") {
    return [...commandHeader(cmd), { text: "Open Investor funnel → Start walkthrough", tone: "prism" }];
  }

  // ── SHORTHAND (funnel keys without namespace) ──────────────────────
  if (a === "query" || a === "predict" || a === "validate" || a === "trace" || a === "stats") {
    return routeTokens(["prism", ...tokens]);
  }
  if (a === "status" && !b) {
    const snap = await fetchAccountStatus();
    return [...commandHeader(cmd), ...jsonBlock("STATUS", snap)];
  }

  return [
    ...commandHeader(cmd),
    { text: `Unknown command: ${cmd}`, tone: "risk" },
    { text: "Select a funnel command or type a PRISM terminal command.", tone: "muted" },
  ];
}

async function routeCommons(tokens: string[], fullCmd: string): Promise<OutputLine[]> {
  const [a, b] = tokens;
  const profile = loadBrowserProfile();
  const username = profile?.username ?? "guest";

  if (a === "cache" || a === "library" || a === "ledger" || a === "paste" || a === "discover") {
    return [
      ...commandHeader(fullCmd),
      { text: "TERMINAL USE ONLY", tone: "prism" },
      { text: "Use the Commons panel in the PRISM terminal — not CLI commands.", tone: "muted" },
    ];
  }
  if (a === "inbox") {
    if (!isApiConnected() && !isLocalTerminal()) {
      return [...commandHeader(fullCmd), ...portRequiredBlock("Inbox is port-fed from clrty-api")];
    }
    const data = await apiFetch(`/v1/commons/inbox/${encodeURIComponent(username)}`);
    return [...commandHeader(fullCmd), ...jsonBlock("INBOX", data ?? { username, transfers: [] })];
  }
  if (a === "receive" && b) {
    const data = await apiFetch("/v1/commons/receive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transfer_id: b, username }),
    });
    return [...commandHeader(fullCmd), ...jsonBlock("RECEIVED", data ?? { transfer_id: b, status: "local" })];
  }
  if (a === "send") {
    return [
      ...commandHeader(fullCmd),
      { text: "TERMINAL USE ONLY", tone: "prism" },
      { text: "Use Commons panel above to paste, send, and log taxes.", tone: "muted" },
    ];
  }

  return [
    ...commandHeader(fullCmd),
    { text: "TERMINAL USE ONLY", tone: "prism" },
    { text: "Open Commons funnel — paste, copy, send, and library are in the panel above.", tone: "muted" },
    { text: "Inbox: prism commons inbox · Receive: prism commons receive <id>", tone: "muted" },
  ];
}

/** Execute a funnel menu key (e.g. "chain status"). */
export async function executeCommandKey(key: string): Promise<OutputLine[]> {
  const cmd = CLI_COMMANDS[key] ?? key;
  const tokens = tokenize(cmd.startsWith("clrt ") ? cmd.slice(5) : cmd);
  return routeTokens(tokens);
}

/** Parse and execute free-form terminal input. */
export async function executeTerminalCommand(input: string): Promise<OutputLine[]> {
  const trimmed = input.trim();
  if (!trimmed) return [{ text: "Empty command", tone: "muted" }];

  const directKey = findCommandKey(trimmed);
  if (directKey) return executeCommandKey(directKey);

  const tokens = tokenize(trimmed);
  let start = 0;
  if (tokens[0]?.toLowerCase() === "clrt") start = 1;

  return routeTokens(tokens.slice(start));
}
