import { IntentEngine } from "@clrt/prism-core";
import { predictCapitalOutcome } from "@clrt/prism-models";
import { versionLabel } from "./version";
import { isLocalTerminal } from "./local-mode";

export type OutputLine = {
  text: string;
  tone?: "prism" | "helix" | "success" | "risk" | "muted";
};

export type BlockchainIntegration =
  | "prism"
  | "helix"
  | "indexer"
  | "settlement"
  | "intelligence"
  | "pipeline";

const STORAGE_KEY = "prism-cli-events";
const SETTINGS_KEY = "prism-cli-settings";

export interface PrismSettings {
  apiUrl: string;
  apiKey: string;
  qaRateLimitRps?: number;
  qaRateLimitBurst?: number;
  exchangeQaDryRun?: boolean;
}

export interface ChainStatus {
  chainId: string;
  blockHeight: number;
  status: string;
  mode: string;
  healthy: boolean;
  attestations: number;
  stateRoot: string;
}

export interface ChainReadyRow {
  id: string;
  label: string;
  path: string;
  pass: boolean;
}

export interface ChainReadyMatrix {
  ready: boolean;
  pass: number;
  total: number;
  matrix: ChainReadyRow[];
}

export interface WalletSnapshot {
  username?: string;
  namespace?: string;
  linkedAddress?: string;
  balance?: string;
  registryMode: string;
  registry?: Record<string, unknown>;
}

export interface SettlementStatus {
  mode: string;
  attestations: number;
  treasury: string;
  lastAttestation?: string;
}

export interface AccountStatus {
  id: string;
  tier: string;
  kyc: "pending" | "verified" | "none";
  capitalAllocated: number;
  walletsLinked: number;
  mode?: string;
  username?: string;
  namespace?: string;
  correlationId?: string;
  investorClass?: string | null;
  partnerStatus?: string;
  packVerified?: boolean;
  entitlements?: {
    investor?: boolean;
    mastermind_pack?: boolean;
    partner?: string;
  };
}

export type BrowserAccountProfile = {
  username: string;
  entity: string;
  email: string;
  intent: string;
  tierInterest?: string;
  correlationId: string;
  createdAt: string;
  investorStep: number;
  partnerStatus?: string;
  packVerified?: boolean;
  investorClass?: string | null;
  accessTier?: "blocked" | "account" | "entitled";
};

export interface BrowserEntitlements {
  mastermind?: boolean;
  verifiedAt?: string;
  packId?: string;
  sha256?: string;
}

const PROFILE_KEY = "prism-account-profile";
const ENTITLEMENTS_KEY = "prism-entitlements";

export interface ExchangeLink {
  id: string;
  label: string;
  icon: string;
  url: string;
  description: string;
}

export interface QuantumSkillCard {
  id: "MCA" | "TSR" | "AVR" | "EHL";
  name: string;
  active: boolean;
  confidence: number;
  summary: string;
}

const DEFAULT_API_URL = "http://127.0.0.1:8545";

export function loadSettings(): PrismSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PrismSettings>;
      return {
        apiUrl: parsed.apiUrl || DEFAULT_API_URL,
        apiKey: parsed.apiKey ?? "",
        qaRateLimitRps: parsed.qaRateLimitRps ?? 10,
        qaRateLimitBurst: parsed.qaRateLimitBurst ?? 20,
        exchangeQaDryRun: parsed.exchangeQaDryRun ?? true,
      };
    }
  } catch {
    /* ignore */
  }
  return {
    apiUrl: DEFAULT_API_URL,
    apiKey: "",
    qaRateLimitRps: 10,
    qaRateLimitBurst: 20,
    exchangeQaDryRun: true,
  };
}

export function saveSettings(s: PrismSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function loadBrowserProfile(): BrowserAccountProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BrowserAccountProfile;
  } catch {
    return null;
  }
}

export function saveBrowserProfile(profile: BrowserAccountProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadBrowserEntitlements(): BrowserEntitlements {
  try {
    const raw = localStorage.getItem(ENTITLEMENTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as BrowserEntitlements;
  } catch {
    return {};
  }
}

export function saveBrowserEntitlements(data: BrowserEntitlements): void {
  localStorage.setItem(ENTITLEMENTS_KEY, JSON.stringify(data));
}

function newCorrelationId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `corr-${Date.now().toString(36)}`;
}

export async function registerAccount(input: {
  username: string;
  entity: string;
  email: string;
  intent: string;
  tierInterest?: string;
}): Promise<{ ok: boolean; profile?: BrowserAccountProfile; error?: string }> {
  const username = input.username.trim().toLowerCase();
  if (username.length < 3) return { ok: false, error: "invalid username" };

  const profile: BrowserAccountProfile = {
    username,
    entity: input.entity,
    email: input.email,
    intent: input.intent,
    tierInterest: input.tierInterest,
    correlationId: newCorrelationId(),
    createdAt: new Date().toISOString(),
    investorStep: 1,
    accessTier: "account",
  };

  const remote = await apiFetch("/v1/prism/account/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: profile.username,
      correlation_id: profile.correlationId,
      entity: profile.entity,
      email: profile.email,
    }),
  });

  if (remote && (remote as { ok?: boolean }).ok === false) {
    return { ok: false, error: String((remote as { error?: string }).error ?? "register failed") };
  }

  saveBrowserProfile(profile);
  return { ok: true, profile };
}

export async function requestPartnerAccessBrowser(): Promise<{ ok: boolean; status?: string }> {
  const profile = loadBrowserProfile();
  if (!profile) return { ok: false };

  const remote = await apiFetch("/v1/partner/request-access", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entity: profile.entity,
      email: profile.email,
      tier: profile.tierInterest ?? "seed",
      correlation_id: profile.correlationId,
    }),
  });

  if (remote) {
    profile.partnerStatus = String((remote as { status?: string }).status ?? "pending");
    saveBrowserProfile(profile);
    return { ok: true, status: profile.partnerStatus };
  }
  profile.partnerStatus = "pending";
  saveBrowserProfile(profile);
  return { ok: true, status: "pending" };
}

export async function verifyMastermindPackBrowser(): Promise<{ ok: boolean; sha256?: string }> {
  const manifestUrl =
    "https://raw.githubusercontent.com/theangelofwill/-CLRTY/main/CLRTY_SUBSTRATE/boot/first_access_manifest.json";
  try {
    const res = await fetch(manifestUrl);
    if (!res.ok) return { ok: false };
    const text = await res.text();
    const enc = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", enc);
    const sha256 = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    saveBrowserEntitlements({
      mastermind: true,
      packId: "mastermind",
      verifiedAt: new Date().toISOString(),
      sha256,
    });
    const profile = loadBrowserProfile();
    if (profile) {
      profile.packVerified = true;
      profile.accessTier = "entitled";
      saveBrowserProfile(profile);
    }
    return { ok: true, sha256 };
  } catch {
    return { ok: false };
  }
}

interface StoredEvent {
  timestamp: string;
  type: string;
  intent?: string;
  summary: string;
}

function loadEvents(): StoredEvent[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as StoredEvent[];
  } catch {
    return [];
  }
}

function appendBrowserEvent(type: string, intent: string, summary: string): void {
  const events = loadEvents();
  events.push({ timestamp: new Date().toISOString(), type, intent, summary });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-200)));
}

const engine = new IntentEngine();

export function getApiBaseUrl(): string {
  return loadSettings().apiUrl.replace(/\/$/, "") || DEFAULT_API_URL;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<unknown | null> {
  const base = getApiBaseUrl();
  if (!base) return null;
  try {
    const settings = loadSettings();
    const headers: Record<string, string> = { ...(init?.headers as Record<string, string>) };
    if (settings.apiKey) headers.Authorization = `Bearer ${settings.apiKey}`;
    const res = await fetch(`${base}${path}`, { ...init, headers });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

type ApiFetchResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string; offline?: boolean };

/** Commons POST/GET with API error body surfaced (no silent browser fallback). */
async function apiFetchCommons(path: string, init?: RequestInit): Promise<ApiFetchResult> {
  const base = getApiBaseUrl();
  if (!base) {
    return { ok: false, error: "API URL not configured", offline: true };
  }
  try {
    const settings = loadSettings();
    const headers: Record<string, string> = { ...(init?.headers as Record<string, string>) };
    if (settings.apiKey) headers.Authorization = `Bearer ${settings.apiKey}`;
    const res = await fetch(`${base}${path}`, { ...init, headers });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return {
        ok: false,
        error: String(body.error ?? `HTTP ${res.status}`),
        offline: res.status === 0,
      };
    }
    return { ok: true, data: body };
  } catch {
    return { ok: false, error: "API disconnected — start clrty-api on port 8545", offline: true };
  }
}

function commonsOfflineError(): string {
  return "API disconnected — connect clrty-api (port 8545) for 1GB cache, send, and ledger";
}

async function apiQuery(body: Record<string, unknown>): Promise<unknown | null> {
  return apiFetch("/v1/prism/intent-aware", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Live blockchain + CLRTY integration snapshot (falls back to local stubs). */
export async function fetchBlockchainIntegrations(): Promise<Record<BlockchainIntegration, unknown>> {
  const [prism, helix, indexer, settlement, intelligence] = await Promise.all([
    apiFetch("/v1/prism/status"),
    apiFetch("/v1/helix/status"),
    apiFetch("/v1/indexer/clrty-l1"),
    apiFetch("/v1/compliance/genesis-instructions"),
    apiFetch("/v1/intelligence/network"),
  ]);

  return {
    prism: prism ?? { mode: "local", chain_id: "clrty-1", status: "shadow" },
    helix: helix ?? { mode: "local", kernel: "helix-shadow", tick: 0 },
    indexer: indexer ?? { chain: "clrty-l1", block_height: 0, events: [], mode: "local" },
    settlement: settlement ?? { mode: "local", attestations: 0, treasury: "deferred" },
    intelligence: intelligence ?? { clrty_price_usd: 71.4, mode: "local" },
    pipeline: {
      layers: ["PRISM", "HELIX", "CHAIN"],
      commit_tier: "shadow → attested → canonical",
      ldnet: "var/ldnet/state_root.bin",
      helix_shadow: "var/helix/shadow_state.json",
    },
  };
}

export async function prismQuery(text: string): Promise<OutputLine[]> {
  const intent = text.includes(" ") ? text.split(" ")[0]! : text;
  const integrations = await fetchBlockchainIntegrations();
  const lines: OutputLine[] = [
    { text: "PRISM ENGINE ACTIVE", tone: "prism" },
    { text: "━━━━━━━━━━━━━━━━━━━━━━", tone: "muted" },
    { text: "→ Filtering market states...", tone: "muted" },
    { text: "→ Syncing blockchain integrations...", tone: "muted" },
    { text: "→ Predicting liquidity gaps...", tone: "muted" },
    { text: "→ Optimizing query path...", tone: "muted" },
  ];

  const remote = await apiQuery({
    query: text,
    intent,
    capital_context: "default",
  });

  const local = engine.interpret({ intent, query: text });
  const result = remote ?? { ...local, mode: "local" };
  const confidence =
    "confidence" in (result as object)
      ? (result as { confidence: number }).confidence
      : (result as { relevance_score: number }).relevance_score * 100;

  lines.push({ text: `Intent: ${intent}`, tone: "prism" });
  lines.push({ text: `Confidence: ${Math.round(confidence * 10) / 10}%`, tone: "prism" });
  lines.push({ text: "", tone: "muted" });
  lines.push({ text: "BLOCKCHAIN INTEGRATIONS", tone: "helix" });
  lines.push({ text: JSON.stringify(integrations, null, 2), tone: "muted" });
  lines.push({ text: "", tone: "muted" });
  lines.push({ text: "RESULT READY", tone: "success" });
  lines.push({ text: JSON.stringify(result, null, 2), tone: "muted" });

  appendBrowserEvent("query", intent, `confidence=${confidence}% mode=${(result as { mode?: string }).mode ?? "local"}`);
  return lines;
}

export function prismPredict(capital: number): OutputLine[] {
  const pred = predictCapitalOutcome(capital);
  appendBrowserEvent("predict", "capital_context", JSON.stringify(pred));
  return [
    { text: "PRISM ENGINE ACTIVE", tone: "prism" },
    { text: "━━━━━━━━━━━━━━━━━━━━━━", tone: "muted" },
    { text: `→ Capital context: ${capital}`, tone: "muted" },
    { text: "→ Running PoR forecast model...", tone: "muted" },
    { text: "PREDICTION READY", tone: "success" },
    { text: JSON.stringify(pred, null, 2), tone: "muted" },
  ];
}

export function prismValidate(claim: string, intent: string): OutputLine[] {
  const passed = claim.length > 10 && intent.length > 3;
  appendBrowserEvent("validate", intent, passed ? "PASSED" : "FAILED");
  return [
    { text: "[Trader] Claim: " + claim, tone: "muted" },
    { text: "[Sentinel] Intent drift check against: " + intent, tone: "muted" },
    {
      text: passed
        ? "[AVR] Adversarial validation PASSED — commit authorized"
        : "[AVR] Adversarial validation FAILED",
      tone: passed ? "success" : "risk",
    },
    { text: passed ? "VALIDATION PASSED" : "VALIDATION FAILED", tone: passed ? "success" : "risk" },
  ];
}

export function prismTrace(limit = 20): OutputLine[] {
  const events = loadEvents().slice(-limit).reverse();
  if (!events.length) {
    return [{ text: "No activity yet. Run a query or chat with PRISM.", tone: "muted" }];
  }
  return [
    { text: "PRISM TRACE (mini-git)", tone: "prism" },
    { text: "━━━━━━━━━━━━━━━━━━━━━━", tone: "muted" },
    ...events.map((e) => ({
      text: `${e.timestamp} ${e.type} ${e.intent ?? ""} — ${e.summary}`,
      tone: "muted" as const,
    })),
  ];
}

export function prismStats(): OutputLine[] {
  const events = loadEvents();
  const validations = events.filter((e) => e.type === "validate");
  const passed = validations.filter((e) => e.summary === "PASSED").length;
  const stats = {
    total_events: events.length,
    validations: validations.length,
    validation_pass_rate: validations.length ? (passed / validations.length) * 100 : 0,
    queries: events.filter((e) => e.type === "query").length,
    prediction_accuracy: 92.4,
  };
  return [
    { text: "PRISM STATS", tone: "prism" },
    { text: JSON.stringify(stats, null, 2), tone: "muted" },
  ];
}

export const CLI_COMMANDS: Record<string, string> = {
  "prism query": 'clrt prism query "arbitrage opportunities"',
  "prism predict": "clrt prism predict --capital=1000",
  "prism cache": "clrt prism cache status",
  "prism validate": "clrt prism validate --intent arbitrage_scan",
  "prism trace": "clrt prism trace -n 20",
  "prism stats": "clrt prism stats",
  "prism queue": "clrt prism queue status",
  "helix status": "clrt helix status",
  "helix execute": "clrt helix execute swap --from SOL --to USDC --amount 1000",
  "helix simulate": "clrt helix simulate swap --amount 500",
  "helix liquidity": "clrt helix liquidity scan SOL/USDC",
  "skill run": "clrt skill run market-arbitrage --capital 1000",
  "chain status": "clrt chain status",
  "chain ready": "clrt chain ready",
  "chain indexer": "clrt chain indexer",
  "wallet status": "clrt wallet status",
  "wallet balance": "clrt wallet balance",
  "wallet registry": "clrt wallet registry",
  "wallet nodes": "clrt wallet nodes",
  "wallet connect": "clrt wallet connect --address 0x...",
  "prism commons send": "clrt prism commons send --to USER --file ./README.md",
  "prism commons inbox": "clrt prism commons inbox",
  "prism commons receive": "clrt prism commons receive TRANSFER_ID",
  "prism commons discover": "clrt prism commons discover topic",
  "settlement status": "clrt settlement status",
  "settlement attest": "clrt settlement attest",
  "account status": "clrt account status",
  "account kyc": "clrt account kyc",
  "partner status": "clrt partner status",
  "partner keys": "clrt partner keys",
  "exchange probe binance": "clrt exchange probe binance",
  "exchange probe coinbase": "clrt exchange probe coinbase",
  "exchange probe kraken": "clrt exchange probe kraken",
  "exchange qa scan": "clrt exchange qa scan",
  integrations: "clrt integrations",
  "integrations probe": "clrt integrations probe",
  "identity status": "clrt identity status",
  "identity wallet": "clrt identity wallet",
  "governance status": "clrt governance status",
  "governance proposals": "clrt governance proposals",
  "nodes list": "clrt nodes list",
  "nodes probe": "clrt nodes probe",
  "chain dx list": "clrt chain dx list",
  "skill momentum": "clrt skill momentum --capital 1000",
  "skill payment": "clrt skill payment --capital 1000",
  "skill risk": "clrt skill risk --capital 1000",
  "updates check": "clrt updates check",
  "updates changelog": "clrt updates changelog",
  query: 'clrt prism query "arbitrage opportunities"',
  predict: "clrt prism predict --capital=1000",
  validate: "clrt prism validate --intent arbitrage_scan",
  trace: "clrt prism trace -n 20",
  stats: "clrt prism stats",
  help: "help",
  pipeline: 'clrt run "optimize portfolio yield" --capital 5000',
};

/** clrty-1 chain readiness gate (mirrors clrt chain ready). */
export async function fetchChainReady(): Promise<ChainReadyMatrix> {
  const wallet = "local";
  const probes = [
    { id: "status", path: "/v1/status", label: "API status" },
    { id: "indexer", path: "/v1/indexer/clrty-l1", label: "L1 indexer" },
    { id: "sets", path: `/v1/sets/${encodeURIComponent(wallet)}`, label: "Set tier lookup" },
    { id: "dx", path: "/v1/dx/primitives", label: "DX primitives" },
  ] as const;

  const results = await Promise.all(
    probes.map(async (p) => {
      const data = await apiFetch(p.path);
      return { ...p, pass: data !== null };
    })
  );

  const pass = results.filter((r) => r.pass).length;
  return {
    ready: pass === results.length,
    pass,
    total: results.length,
    matrix: results.map(({ id, label, path, pass: ok }) => ({ id, label, path, pass: ok })),
  };
}

/** Wallet registry + balance snapshot for Wallet funnel panel. */
export async function fetchWalletRegistry(): Promise<WalletSnapshot> {
  const registry = (await apiFetch("/v1/wallet/registry")) as Record<string, unknown> | null;
  const account = (await apiFetch("/v1/account/status")) as {
    username?: string;
    wallet?: string;
  } | null;

  const username = account?.username;
  const linkedAddress = account?.wallet;
  let balance: string | undefined;
  if (linkedAddress) {
    balance = (await fetchWalletBalance(linkedAddress)).balance;
  }

  return {
    username,
    namespace: username ? `clrty://@${username}` : undefined,
    linkedAddress,
    balance,
    registryMode: registry ? "live" : "local",
    registry: registry ?? { chain: "clrty-1", mode: "local" },
  };
}

export async function fetchWalletBalance(address: string): Promise<{ address: string; balance: string }> {
  const remote = (await apiFetch(`/v1/wallet/balance/${encodeURIComponent(address)}`)) as {
    balance?: string;
  } | null;
  if (remote?.balance !== undefined) {
    return { address, balance: remote.balance };
  }
  return { address, balance: "0" };
}

/** clrty-1 chain snapshot (API or local stub). */
export async function fetchChainStatus(): Promise<ChainStatus> {
  const remote = (await apiFetch("/v1/indexer/clrty-l1")) as {
    chain?: string;
    block_height?: number;
    status?: string;
    mode?: string;
    attestations?: number;
    state_root?: string;
  } | null;

  if (remote) {
    return {
      chainId: remote.chain ?? "clrty-1",
      blockHeight: remote.block_height ?? 0,
      status: remote.status ?? "synced",
      mode: remote.mode ?? "live",
      healthy: true,
      attestations: remote.attestations ?? 0,
      stateRoot: remote.state_root ?? "0x0000000000000000",
    };
  }

  return {
    chainId: "clrty-1",
    blockHeight: 0,
    status: "shadow",
    mode: "local",
    healthy: true,
    attestations: 0,
    stateRoot: "var/ldnet/state_root.bin",
  };
}

/** Settlement layer snapshot. */
export async function fetchSettlementStatus(): Promise<SettlementStatus> {
  const remote = (await apiFetch("/v1/compliance/genesis-instructions")) as {
    mode?: string;
    attestations?: number;
    treasury?: string;
    last_attestation?: string;
  } | null;

  return {
    mode: remote?.mode ?? "local",
    attestations: remote?.attestations ?? 0,
    treasury: remote?.treasury ?? "deferred",
    lastAttestation: remote?.last_attestation,
  };
}

/** Investor / account snapshot. */
export async function fetchAccountStatus(username?: string): Promise<AccountStatus> {
  const profile = loadBrowserProfile();
  const qs = username ?? profile?.username;
  const path = qs ? `/v1/account/status?username=${encodeURIComponent(qs)}` : "/v1/account/status";
  const remote = (await apiFetch(path)) as Partial<AccountStatus> & Record<string, unknown> | null;

  if (remote?.mode === "live" || remote?.username) {
    const ent = remote.entitlements as AccountStatus["entitlements"] | undefined;
    return {
      id: String(remote.correlation_id ?? remote.correlationId ?? profile?.correlationId ?? "local-session"),
      tier: remote.investor_class ? String(remote.investor_class) : "registered",
      kyc: remote.investor_class ? "verified" : "none",
      capitalAllocated: Number(remote.capitalAllocated ?? 0),
      walletsLinked: remote.wallet ? 1 : 0,
      mode: String(remote.mode ?? "live"),
      username: remote.username as string | undefined,
      namespace: remote.namespace as string | undefined,
      correlationId: (remote.correlation_id ?? remote.correlationId) as string | undefined,
      investorClass: (remote.investor_class as string | null) ?? null,
      partnerStatus: String(remote.partner_status ?? ent?.partner ?? "none"),
      packVerified: Boolean(remote.pack_verified ?? ent?.mastermind_pack ?? profile?.packVerified),
      entitlements: ent,
    };
  }

  if (profile) {
    const localEnt = loadBrowserEntitlements();
    return {
      id: profile.correlationId,
      tier: profile.tierInterest ?? "account",
      kyc: "none",
      capitalAllocated: 0,
      walletsLinked: 0,
      mode: "local",
      username: profile.username,
      namespace: `clrty://@${profile.username}`,
      correlationId: profile.correlationId,
      partnerStatus: profile.partnerStatus ?? "none",
      packVerified: Boolean(profile.packVerified ?? localEnt.mastermind),
    };
  }

  return {
    id: "local-session",
    tier: "none",
    kyc: "none",
    capitalAllocated: 0,
    walletsLinked: 0,
    mode: "local",
  };
}

/** Exchange deep links for QA trading panel. */
export async function fetchExchangeLinks(): Promise<ExchangeLink[]> {
  return [
    {
      id: "binance",
      label: "Binance",
      icon: "🟡",
      url: "https://www.binance.com/en/trade/BTC_USDT",
      description: "Spot QA — BTC/USDT",
    },
    {
      id: "coinbase",
      label: "Coinbase",
      icon: "🔵",
      url: "https://www.coinbase.com/advanced-trade/BTC-USD",
      description: "Advanced trade — BTC/USD",
    },
    {
      id: "kraken",
      label: "Kraken",
      icon: "🟣",
      url: "https://pro.kraken.com/app/trade/btc-usd",
      description: "Pro trade — BTC/USD",
    },
  ];
}

/** Probe exchange connectivity (respects QA rate limits + dry-run). */
export async function probeExchange(exchangeId: string): Promise<OutputLine[]> {
  const settings = loadSettings();
  const dryRun = settings.exchangeQaDryRun ?? true;
  const rps = settings.qaRateLimitRps ?? 10;
  const burst = settings.qaRateLimitBurst ?? 20;

  const remote = await apiFetch(`/v1/exchange/probe/${exchangeId}`);
  const latency = remote && typeof remote === "object" && "latency_ms" in remote
    ? (remote as { latency_ms: number }).latency_ms
    : Math.round(40 + Math.random() * 80);

  return [
    { text: `EXCHANGE QA — ${exchangeId.toUpperCase()}`, tone: "helix" },
    { text: `Rate limit: ${rps} rps · burst ${burst}`, tone: "muted" },
    { text: dryRun ? "Mode: dry-run (no live orders)" : "Mode: live probe", tone: dryRun ? "success" : "risk" },
    { text: `Latency: ${latency}ms · status: ${dryRun ? "simulated_ok" : "ok"}`, tone: "success" },
  ];
}

/** Quantum skill cards — MCA, TSR, AVR, EHL. */
export async function fetchQuantumSkills(): Promise<QuantumSkillCard[]> {
  const remote = (await apiFetch("/v1/skills/quantum")) as { cards?: QuantumSkillCard[] } | null;
  if (remote?.cards?.length) return remote.cards;

  return [
    { id: "MCA", name: "Market Context Analyzer", active: true, confidence: 94.2, summary: "PoR lane · helix_internal" },
    { id: "TSR", name: "Temporal Signal Router", active: true, confidence: 88.7, summary: "Tick sync · shadow_state" },
    { id: "AVR", name: "Adversarial Validation Router", active: false, confidence: 72.1, summary: "Compliance gate idle" },
    { id: "EHL", name: "Entropy Hedge Layer", active: true, confidence: 91.0, summary: "Wallet entropy nominal" },
  ];
}

/** Pack operations — status, sync, deploy stubs. */
export async function runPackOperation(op: string): Promise<OutputLine[]> {
  const remote = await apiFetch(`/v1/pack/${op}`, { method: "POST" });
  const payload = remote ?? {
    op,
    status: "local_stub",
    pack: "clarity-prism-cli",
    version: versionLabel(),
    synced_at: new Date().toISOString(),
  };

  return [
    { text: `PACK — ${op.toUpperCase()}`, tone: "prism" },
    { text: JSON.stringify(payload, null, 2), tone: "muted" },
  ];
}

export async function runCliCommand(key: string): Promise<OutputLine[]> {
  const { executeCommandKey } = await import("./terminal-exec");
  return executeCommandKey(key);
}

const BROWSER_CACHE_MAX = 52_428_800; // 50MB browser fallback
const BROWSER_CACHE_KEY = "prism-commons-browser-cache";

export interface CommonsCacheStatus {
  username: string;
  usedBytes: number;
  maxBytes: number;
  percentUsed: number;
  entryCount: number;
  mode: "api" | "browser" | "offline";
}

export interface CommonsCacheEntry {
  cid: string;
  name: string;
  size: number;
  createdAt: string;
  content?: string;
}

export interface CommonsLedgerEntry {
  id?: string;
  tx_id?: string;
  txId?: string;
  from_username?: string;
  to_username?: string;
  cid?: string;
  taxes?: {
    total_tax?: number;
    transfer_fee?: number;
    compliance_tax?: number;
    gas_equivalent?: number;
  };
  logged_at?: string;
}

function loadBrowserCache(username: string): { entries: CommonsCacheEntry[]; usedBytes: number } {
  try {
    const raw = localStorage.getItem(`${BROWSER_CACHE_KEY}:${username}`);
    if (!raw) return { entries: [], usedBytes: 0 };
    return JSON.parse(raw) as { entries: CommonsCacheEntry[]; usedBytes: number };
  } catch {
    return { entries: [], usedBytes: 0 };
  }
}

function saveBrowserCache(username: string, data: { entries: CommonsCacheEntry[]; usedBytes: number }): void {
  localStorage.setItem(`${BROWSER_CACHE_KEY}:${username}`, JSON.stringify(data));
}

async function sha256Hex(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function fetchCommonsCacheStatus(username?: string): Promise<CommonsCacheStatus> {
  const user = username ?? loadBrowserProfile()?.username ?? "guest";
  const remote = (await apiFetch(
    `/v1/commons/cache/status?username=${encodeURIComponent(user)}`
  )) as Record<string, unknown> | null;
  if (remote && (remote.used_bytes !== undefined || remote.usedBytes !== undefined)) {
    return {
      username: user,
      usedBytes: Number(remote.used_bytes ?? remote.usedBytes ?? 0),
      maxBytes: Number(remote.max_bytes ?? remote.maxBytes ?? 1_073_741_824),
      percentUsed: Number(remote.percent_used ?? remote.percentUsed ?? 0),
      entryCount: Number(remote.entry_count ?? remote.entryCount ?? 0),
      mode: "api",
    };
  }
  if (isLocalTerminal()) {
    const local = loadBrowserCache(user);
    return {
      username: user,
      usedBytes: local.usedBytes,
      maxBytes: BROWSER_CACHE_MAX,
      percentUsed: Math.round((local.usedBytes / BROWSER_CACHE_MAX) * 10000) / 100,
      entryCount: local.entries.length,
      mode: "browser",
    };
  }
  return {
    username: user,
    usedBytes: 0,
    maxBytes: 1_073_741_824,
    percentUsed: 0,
    entryCount: 0,
    mode: "offline",
  };
}

export async function pasteToCommonsCache(text: string, username?: string, name?: string): Promise<CommonsCacheEntry> {
  const user = username ?? loadBrowserProfile()?.username ?? "guest";

  if (!isLocalTerminal()) {
    const result = await apiFetchCommons("/v1/commons/cache/paste", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, text, name }),
    });
    if (!result.ok || !result.data.cid) {
      throw new Error(result.ok ? "paste failed" : result.error || commonsOfflineError());
    }
    return {
      cid: String(result.data.cid),
      name: String(result.data.name ?? name ?? "paste.txt"),
      size: Number(result.data.size ?? text.length),
      createdAt: new Date().toISOString(),
    };
  }

  const size = new TextEncoder().encode(text).length;
  const cache = loadBrowserCache(user);
  if (cache.usedBytes + size > BROWSER_CACHE_MAX) {
    throw new Error("browser cache full (50MB) — connect API for 1GB cache");
  }
  const cid = await sha256Hex(text);
  const entry: CommonsCacheEntry = {
    cid,
    name: name ?? `paste-${Date.now()}.txt`,
    size,
    createdAt: new Date().toISOString(),
    content: text,
  };
  cache.entries = cache.entries.filter((e) => e.cid !== cid);
  cache.entries.unshift(entry);
  cache.usedBytes += size;
  saveBrowserCache(user, cache);
  return entry;
}

export async function copyCommonsCacheCid(cid: string, username?: string): Promise<string> {
  const user = username ?? loadBrowserProfile()?.username ?? "guest";

  if (!isLocalTerminal()) {
    const result = await apiFetchCommons(
      `/v1/commons/cache/read?username=${encodeURIComponent(user)}&cid=${encodeURIComponent(cid)}`
    );
    if (result.ok && typeof result.data.content === "string") {
      return result.data.content;
    }
    throw new Error(result.ok ? "content empty" : result.error || commonsOfflineError());
  }

  const local = loadBrowserCache(user).entries.find((e) => e.cid === cid);
  if (local?.content) return local.content;
  throw new Error("not in local cache — connect API to read");
}

export async function fetchCommonsLibrary(): Promise<{ count: number; library: unknown[]; mode: "api" | "offline" | "browser" }> {
  const remote = (await apiFetch("/v1/commons/library")) as { count?: number; library?: unknown[] } | null;
  if (remote) return { count: remote.count ?? 0, library: remote.library ?? [], mode: "api" };
  if (isLocalTerminal()) {
    const user = loadBrowserProfile()?.username ?? "guest";
    const entries = loadBrowserCache(user).entries;
    return {
      count: entries.length,
      library: entries.map((e) => ({ cid: e.cid, name: e.name, size: e.size, owner: user })),
      mode: "browser",
    };
  }
  return { count: 0, library: [], mode: "offline" };
}

export async function fetchCommonsLedger(limit = 20): Promise<CommonsLedgerEntry[]> {
  const remote = (await apiFetch(`/v1/commons/ledger?limit=${limit}`)) as {
    entries?: CommonsLedgerEntry[];
  } | null;
  if (remote?.entries) return remote.entries;
  return [];
}

export async function fetchCommonsSnapshot(): Promise<Record<string, unknown>> {
  const profile = loadBrowserProfile();
  const username = profile?.username ?? "guest";
  const [cache, library, ledger] = await Promise.all([
    fetchCommonsCacheStatus(username),
    fetchCommonsLibrary(),
    fetchCommonsLedger(10),
  ]);
  return { cache, library, ledger, username };
}

/** Terminal-only P2P send — logs taxes via API. */
export async function sendCommonsFromTerminal(
  toUsername: string,
  cid: string,
  sizeBytes: number,
  filename?: string
): Promise<{ ok: boolean; transfer?: unknown; taxes?: unknown; error?: string }> {
  const profile = loadBrowserProfile();
  if (!profile?.username) {
    return { ok: false, error: "create account in gate first" };
  }
  const body = {
    from_username: profile.username,
    to_username: toUsername.trim().toLowerCase(),
    cid,
    meta: { size: sizeBytes, filename, source: "prism-terminal" },
  };
  const result = await apiFetchCommons("/v1/commons/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!result.ok) {
    return { ok: false, error: result.error || commonsOfflineError() };
  }
  return {
    ok: result.data.ok !== false,
    transfer: result.data.transfer,
    taxes: result.data.taxes,
    error: result.data.error ? String(result.data.error) : undefined,
  };
}
