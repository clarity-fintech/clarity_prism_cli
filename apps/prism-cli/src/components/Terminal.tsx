import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import Header from "./Header";
import Banner from "./Banner";
import FunnelNav from "./FunnelNav";
import SubMenu from "./SubMenu";
import LinkPanel from "./LinkPanel";
import ChainPanel from "./ChainPanel";
import WalletPanel from "./WalletPanel";
import CommonsLibraryPanel from "./CommonsLibraryPanel";
import QuantumSkillsPanel from "./QuantumSkillsPanel";
import SettingsQAPanel from "./SettingsQAPanel";
import InvestorWalkthrough from "./InvestorWalkthrough";
import Prompt from "./Prompt";
import StatusBar from "./StatusBar";
import OutputPanel from "./OutputPanel";
import LoadingShell from "./LoadingShell";
import PortFeedBanner from "./PortFeedBanner";
import AccountGate from "./AccountGate";
import {
  funnelNavItems,
  getFunnel,
  type FunnelCommand,
  type FunnelId,
} from "../lib/funnel-config";
import { versionLabel } from "../lib/version";
import {
  type OutputLine,
  prismQuery,
  prismPredict,
  prismValidate,
  prismTrace,
  prismStats,
  fetchBlockchainIntegrations,
  fetchAccountStatus,
  fetchSettlementStatus,
  fetchChainStatus,
  probeExchange,
  runPackOperation,
  loadSettings,
  saveSettings,
} from "../lib/prism-bridge";
import { executeCommandKey, executeTerminalCommand } from "../lib/terminal-exec";
import {
  getApiHostLabel,
  probeApiConnection,
  startConnectionRetry,
  subscribeConnection,
} from "../lib/port-connection";
import { useQueryQueue } from "../lib/useQueryQueue";
import { resolveAccessState, type AccessState } from "../lib/access-gate";

type Mode = "menu" | "chat" | "command" | "settings";

const CLI_ROOTS = new Set([
  "prism",
  "helix",
  "chain",
  "wallet",
  "skill",
  "settlement",
  "account",
  "partner",
  "exchange",
  "pack",
  "integrations",
  "identity",
  "governance",
  "nodes",
  "run",
  "pipeline",
  "updates",
  "version",
  "config",
  "investor",
  "clrt",
]);

function looksLikeCliInput(text: string): boolean {
  const parts = text.trim().toLowerCase().split(/\s+/);
  if (!parts.length) return false;
  const root = parts[0] === "clrt" ? parts[1] : parts[0];
  return Boolean(root && CLI_ROOTS.has(root));
}

async function runPrompt(
  text: string,
  mode: Mode,
  funnelId: FunnelId,
  commandKey: string | null
): Promise<OutputLine[]> {
  if (text.startsWith("__system__ ")) {
    return [{ text: text.slice(11), tone: "prism" }];
  }
  if (text === "__trace__") return prismTrace(20);
  if (text.startsWith("help") || text === "full" || text === "/help") {
    const { fullTerminalUsageLines } = await import("../lib/terminal-usage");
    return fullTerminalUsageLines();
  }
  if (text.startsWith("__cmd__ ")) {
    return executeCommandKey(text.slice(8));
  }
  if (looksLikeCliInput(text)) {
    return executeTerminalCommand(text);
  }
  if (mode === "command" && commandKey) {
    return executeCommandKey(commandKey);
  }

  if (text.startsWith("predict ") || text.startsWith("/predict")) {
    return prismPredict(Number(text.replace(/\D/g, "")) || 1000);
  }
  if (text.startsWith("validate ") || text.startsWith("/validate")) {
    return prismValidate(text.slice(text.indexOf(" ") + 1) || "claim", "arbitrage_scan");
  }
  if (text.startsWith("stats") || text === "/stats") return prismStats();
  if (text.startsWith("trace") || text === "/trace") return prismTrace();
  if (text.startsWith("integrations") || text === "/integrations") {
    const integrations = await fetchBlockchainIntegrations();
    return [
      { text: "CLRTY BLOCKCHAIN INTEGRATIONS", tone: "helix" },
      { text: JSON.stringify(integrations, null, 2), tone: "muted" },
    ];
  }
  if (text.startsWith("exchange probe")) {
    const id = text.split(" ").pop() ?? "binance";
    return probeExchange(id);
  }
  if (text.startsWith("chain")) {
    const status = await fetchChainStatus();
    return [{ text: JSON.stringify(status, null, 2), tone: "muted" }];
  }
  if (text.startsWith("account")) {
    const account = await fetchAccountStatus();
    return [{ text: JSON.stringify(account, null, 2), tone: "muted" }];
  }
  if (text.startsWith("settlement")) {
    const settlement = await fetchSettlementStatus();
    return [{ text: JSON.stringify(settlement, null, 2), tone: "muted" }];
  }
  if (text.startsWith("pack")) {
    return runPackOperation(text.replace(/^pack\s+/, "") || "status");
  }

  if (funnelId === "prism" || mode === "chat") {
    return prismQuery(text);
  }
  return prismQuery(text);
}

export default function Terminal() {
  const [access, setAccess] = useState<AccessState>("loading");

  useEffect(() => {
    void resolveAccessState().then((r) => setAccess(r.state));
  }, []);

  if (access === "loading") return <LoadingShell />;

  if (access !== "entitled" && access !== "admin" && access !== "personal" && access !== "public_launch") {
    return (
      <AccountGate
        access={access}
        onEntitled={() => setAccess("entitled")}
      />
    );
  }

  return <TerminalInner />;
}

function TerminalInner() {
  const [funnelId, setFunnelId] = useState<FunnelId>("home");
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("menu");
  const [commandKey, setCommandKey] = useState<string | null>(null);
  const [showInvestorWizard, setShowInvestorWizard] = useState(false);
  const [input, setInput] = useState("");
  const [contextLeft, setContextLeft] = useState(100);
  const [apiUrl, setApiUrl] = useState("");
  const [portLabel, setPortLabel] = useState(getApiHostLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void probeApiConnection();
    const stopRetry = startConnectionRetry();
    const unsub = subscribeConnection(() => setPortLabel(getApiHostLabel()));
    return () => {
      stopRetry();
      unsub();
    };
  }, []);

  const subLabel =
    funnelId !== "home" && getFunnel(funnelId).commands[activeIndex]
      ? getFunnel(funnelId).commands[activeIndex]!.label
      : undefined;

  const runner = useCallback(
    async (text: string) => runPrompt(text, mode, funnelId, commandKey),
    [mode, funnelId, commandKey]
  );
  const { entries, enqueue, pending, running } = useQueryQueue(runner);

  useEffect(() => {
    setContextLeft((c) => Math.max(8, c - 1));
  }, [entries.length]);

  useEffect(() => {
    setActiveIndex(0);
    setShowInvestorWizard(funnelId === "investor");
    if (funnelId === "chain") {
      enqueue("__system__ Chain funnel — running clrty-1 ready gate on enter.");
      enqueue("__cmd__ chain ready");
    }
  }, [funnelId, enqueue]);

  const navigateFunnel = useCallback((id: FunnelId) => {
    setFunnelId(id);
    setMode("menu");
    setCommandKey(null);
    setInput("");
    if (id === "config") {
      setMode("settings");
      setInput(loadSettings().apiUrl);
      enqueue("__system__ Configure CLRTY API URL (http://127.0.0.1:8545) then API key.");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [enqueue]);

  const activateCommand = useCallback(
    async (command: FunnelCommand | null, funnelTarget?: FunnelId) => {
      if (funnelTarget) {
        navigateFunnel(funnelTarget);
        enqueue(`__system__ Entered funnel: ${getFunnel(funnelTarget).label}`);
        return;
      }
      if (!command) return;

      const key = command.key;

      if (key === "__commons_panel__") {
        navigateFunnel("commons");
        enqueue("__system__ Commons — TERMINAL USE ONLY. Paste, copy, send, and library are in the panel above.");
        return;
      }
      if (key === "config api") {
        setMode("settings");
        setInput(loadSettings().apiUrl);
        enqueue("__system__ Configure CLRTY API URL then API key.");
        setTimeout(() => inputRef.current?.focus(), 50);
        return;
      }
      if (key === "investor walkthrough") {
        setShowInvestorWizard(true);
        enqueue("__system__ Investor walkthrough — 10 steps with progress.");
        return;
      }
      if (key === "query") {
        setMode("chat");
        enqueue("__system__ PRISM chat active — type intents; multiple prompts queue automatically.");
        setTimeout(() => inputRef.current?.focus(), 50);
        return;
      }
      if (key.startsWith("exchange probe")) {
        const id = key.split(" ").pop() ?? "binance";
        enqueue(`__cmd__ ${key}`);
        void probeExchange(id).then((lines) => {
          enqueue(lines.map((l) => l.text).join("\n"));
        });
        return;
      }
      if (
        key === "trace" ||
        key === "stats" ||
        key === "predict" ||
        key === "validate" ||
        key.startsWith("integrations")
      ) {
        setCommandKey(key);
        if (key === "trace") enqueue("__trace__");
        else if (key === "stats") enqueue("stats");
        else if (key.startsWith("integrations")) {
          enqueue("__system__ Fetching blockchain integrations…");
          void fetchBlockchainIntegrations().then((integrations) => {
            enqueue(JSON.stringify(integrations, null, 2));
          });
        } else {
          enqueue(`__system__ ${command.label} — ${command.hint ?? "type in prompt"}`);
          setMode("chat");
          setTimeout(() => inputRef.current?.focus(), 50);
        }
        return;
      }
      if (key === "updates check" || key === "updates changelog") {
        enqueue(`__system__ PRISM CLI ${versionLabel()} — Tier 5 enterprise release. Run clrt version for changelog.`);
        return;
      }
      if (key === "config projects") {
        enqueue("__system__ PRISM projects — git clone github.com/williamsnameiswill/clarity-prism-cli");
        return;
      }

      setCommandKey(key);
      setMode("command");
      enqueue(`__cmd__ ${key}`);
    },
    [enqueue, navigateFunnel]
  );

  const handleSubmit = useCallback(async () => {
    const text = input.trim();

    if (mode === "settings") {
      if (!apiUrl && !loadSettings().apiUrl) {
        setApiUrl(text);
        saveSettings({ ...loadSettings(), apiUrl: text });
        enqueue(`__system__ API URL set: ${text}. Enter API key next.`);
        setInput("");
        return;
      }
      saveSettings({ ...loadSettings(), apiUrl: apiUrl || loadSettings().apiUrl, apiKey: text });
      enqueue("__system__ Settings saved. Live blockchain integrations enabled when API is up.");
      setMode("menu");
      setFunnelId("home");
      setInput("");
      return;
    }

    if (!text && mode === "command" && commandKey) {
      enqueue(`__cmd__ ${commandKey}`);
      setMode("menu");
      return;
    }

    if (!text) {
      if (mode === "menu") {
        const funnel = getFunnel(funnelId);
        if (funnelId === "home") {
          const targets = funnelNavItems().map((f) => f.id);
          const target = targets[activeIndex];
          if (target) void activateCommand(null, target);
        } else {
          const cmd = funnel.commands[activeIndex];
          if (cmd) void activateCommand(cmd);
        }
      }
      return;
    }

    if (text.startsWith("__")) return;

    enqueue(text);
    setInput("");
  }, [input, mode, funnelId, activeIndex, commandKey, apiUrl, enqueue, activateCommand]);

  const maxIndex =
    funnelId === "home"
      ? funnelNavItems().length - 1
      : Math.max(0, getFunnel(funnelId).commands.length - 1);

  useHotkeys(
    "up",
    (e) => {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    },
    { enableOnFormTags: true }
  );

  useHotkeys(
    "down",
    (e) => {
      e.preventDefault();
      setActiveIndex((i) => Math.min(maxIndex, i + 1));
    },
    { enableOnFormTags: true }
  );

  useHotkeys("escape", () => {
    if (funnelId !== "home") {
      setFunnelId("home");
      setMode("menu");
      setCommandKey(null);
    } else {
      setMode("menu");
    }
    setInput("");
  });

  useHotkeys("backspace", (e) => {
    if (mode === "menu" && funnelId !== "home" && !input) {
      e.preventDefault();
      setFunnelId("home");
      setActiveIndex(0);
    }
  });

  const showChain = funnelId === "chain";
  const showWallet = funnelId === "wallet";
  const showCommons = funnelId === "commons";
  const showSkills = funnelId === "skills";
  const showQA = funnelId === "qa-trading";
  const showInvestor = funnelId === "investor" && showInvestorWizard;

  return (
    <div className="terminal">
      <Header />
      <Banner />
      <PortFeedBanner />
      <FunnelNav funnelId={funnelId} subLabel={subLabel} onNavigate={navigateFunnel} />
      {showChain && <ChainPanel />}
      {showWallet && <WalletPanel />}
      {showCommons && <CommonsLibraryPanel />}
      {showSkills && <QuantumSkillsPanel />}
      {showQA && (
        <>
          <SettingsQAPanel />
          <LinkPanel />
        </>
      )}
      {showInvestor && (
        <InvestorWalkthrough
          skipAccountStep
          onComplete={() => {
            setShowInvestorWizard(false);
            enqueue("__system__ Investor walkthrough complete — account ready for shadow commits.");
          }}
        />
      )}
      <SubMenu
        funnelId={funnelId}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        onActivate={(cmd, target) => void activateCommand(cmd, target)}
      />
      <OutputPanel entries={entries} />
      <Prompt
        ref={inputRef}
        value={input}
        onChange={setInput}
        onSubmit={() => void handleSubmit()}
        placeholder={
          mode === "settings"
            ? "CLRTY_API_URL or API key"
            : mode === "chat"
              ? "Type query — backlog queues automatically"
              : mode === "command"
                ? "Enter to run selected command"
                : undefined
        }
      />
      <StatusBar
        funnelLabel={getFunnel(funnelId).label}
        contextLeft={contextLeft}
        queuePending={pending}
        queueRunning={running}
        portLabel={portLabel}
      />
    </div>
  );
}
