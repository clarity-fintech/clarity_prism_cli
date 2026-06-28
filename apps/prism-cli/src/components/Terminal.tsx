import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import Header from "./Header";
import Banner from "./Banner";
import Menu from "./Menu";
import Prompt from "./Prompt";
import StatusBar from "./StatusBar";
import OutputPanel from "./OutputPanel";
import { MENU_ITEMS, COMMAND_OPTIONS, type MenuId } from "../lib/menu-config";
import {
  type OutputLine,
  prismQuery,
  prismPredict,
  prismValidate,
  prismTrace,
  prismStats,
  runCliCommand,
  fetchBlockchainIntegrations,
  loadSettings,
  saveSettings,
} from "../lib/prism-bridge";
import { useQueryQueue } from "../lib/useQueryQueue";

type Mode = "menu" | "chat" | "command" | "settings";

async function runPrompt(text: string, mode: Mode, commandIndex: number): Promise<OutputLine[]> {
  if (text.startsWith("__system__ ")) {
    return [{ text: text.slice(11), tone: "prism" }];
  }
  if (text === "__trace__") return prismTrace(20);
  if (text.startsWith("__cmd__ ")) {
    return runCliCommand(text.slice(8));
  }
  if (mode === "command") {
    const opt = COMMAND_OPTIONS[commandIndex];
    return opt ? runCliCommand(opt.key) : [{ text: "No command selected", tone: "risk" }];
  }
  if (text.startsWith("predict ") || text.startsWith("/predict")) {
    return prismPredict(Number(text.replace(/\D/g, "")) || 1000);
  }
  if (text.startsWith("validate ") || text.startsWith("/validate")) {
    return prismValidate(text.slice(9) || "claim", "arbitrage_scan");
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
  return prismQuery(text);
}

export default function Terminal() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("menu");
  const [commandIndex, setCommandIndex] = useState(0);
  const [input, setInput] = useState("");
  const [contextLeft, setContextLeft] = useState(100);
  const [apiUrl, setApiUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const runner = useCallback(
    async (text: string) => runPrompt(text, mode, commandIndex),
    [mode, commandIndex]
  );
  const { entries, enqueue, pending, running } = useQueryQueue(runner);

  useEffect(() => {
    setContextLeft((c) => Math.max(8, c - 1));
  }, [entries.length]);

  const handleMenuSelect = useCallback(async (_id: MenuId, index: number) => {
    setActiveIndex(index);
  }, []);

  const activateMenu = useCallback(
    async (id: MenuId) => {
      switch (id) {
        case "chat":
          setMode("chat");
          setInput("");
          enqueue("__system__ PRISM chat active — type intents; multiple prompts queue automatically.");
          setTimeout(() => inputRef.current?.focus(), 50);
          break;
        case "command":
          setMode("command");
          setCommandIndex(0);
          enqueue("__system__ Select command (↑↓ + Enter) or type in prompt.");
          setTimeout(() => inputRef.current?.focus(), 50);
          break;
        case "projects":
          enqueue("__system__ PRISM projects — git clone github.com/williamsnameiswill/clarity-prism-cli");
          break;
        case "activity":
          enqueue("__trace__");
          break;
        case "settings":
          setMode("settings");
          enqueue("__system__ Configure CLRTY API URL (http://127.0.0.1:8545) then API key.");
          setInput(loadSettings().apiUrl);
          setTimeout(() => inputRef.current?.focus(), 50);
          break;
        case "integrations":
          enqueue("__system__ PRISM → HELIX → indexer → settlement → intelligence (see Integrations menu)");
          void fetchBlockchainIntegrations().then((integrations) => {
            enqueue(JSON.stringify(integrations, null, 2));
          });
          break;
        case "updates":
          enqueue("__system__ PRISM CLI v1.0.0 — clarity-prism-cli up to date.");
          break;
        case "help":
          enqueue("__system__ docs/QUICKSTART.md · clrt prism query · clrt helix execute · clrt run");
          break;
        case "exit":
          enqueue("__system__ Session saved to local ledger. Goodbye.");
          break;
      }
    },
    [enqueue]
  );

  const handleSubmit = useCallback(async () => {
    const text = input.trim();

    if (mode === "settings") {
      if (!apiUrl && !loadSettings().apiUrl) {
        setApiUrl(text);
        saveSettings({ apiUrl: text, apiKey: loadSettings().apiKey });
        enqueue(`__system__ API URL set: ${text}. Enter API key next.`);
        setInput("");
        return;
      }
      saveSettings({ apiUrl: apiUrl || loadSettings().apiUrl, apiKey: text });
      enqueue("__system__ Settings saved. Live blockchain integrations enabled when API is up.");
      setMode("menu");
      setInput("");
      return;
    }

    if (!text && mode === "command") {
      const opt = COMMAND_OPTIONS[commandIndex];
      if (opt) enqueue(`__cmd__ ${opt.key}`);
      setMode("menu");
      return;
    }

    if (!text) {
      if (mode === "menu") void activateMenu(MENU_ITEMS[activeIndex]!.id);
      return;
    }

    if (text.startsWith("__")) return;

    enqueue(text);
    setInput("");
  }, [input, mode, activeIndex, commandIndex, apiUrl, enqueue, activateMenu]);

  useHotkeys(
    "up",
    (e) => {
      e.preventDefault();
      if (mode === "command") {
        setCommandIndex((i) => Math.max(0, i - 1));
        return;
      }
      setActiveIndex((i) => Math.max(0, i - 1));
    },
    { enableOnFormTags: true }
  );

  useHotkeys(
    "down",
    (e) => {
      e.preventDefault();
      if (mode === "command") {
        setCommandIndex((i) => Math.min(COMMAND_OPTIONS.length - 1, i + 1));
        return;
      }
      setActiveIndex((i) => Math.min(MENU_ITEMS.length - 1, i + 1));
    },
    { enableOnFormTags: true }
  );

  useHotkeys("escape", () => {
    setMode("menu");
    setInput("");
  });

  return (
    <div className="terminal">
      <Header />
      <Banner />
      <Menu activeIndex={activeIndex} onSelect={handleMenuSelect} onActivate={(id) => void activateMenu(id)} />
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
      <StatusBar contextLeft={contextLeft} queuePending={pending} queueRunning={running} />
    </div>
  );
}
