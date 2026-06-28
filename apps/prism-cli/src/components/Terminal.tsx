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
  loadSettings,
  saveSettings,
} from "../lib/prism-bridge";

type Mode = "menu" | "chat" | "command" | "settings";

export default function Terminal() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("menu");
  const [commandIndex, setCommandIndex] = useState(0);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [contextLeft, setContextLeft] = useState(100);
  const [apiUrl, setApiUrl] = useState("");
  const [, setApiKey] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = loadSettings();
    setApiUrl(s.apiUrl);
    setApiKey(s.apiKey);
  }, []);

  const pushOutput = useCallback((lines: OutputLine[]) => {
    setOutput(lines);
    setContextLeft((c) => Math.max(12, c - Math.min(25, lines.length * 2)));
  }, []);

  const handleMenuSelect = useCallback(async (_id: MenuId, index: number) => {
    setActiveIndex(index);
  }, []);

  const activateMenu = useCallback(
    async (id: MenuId) => {
      switch (id) {
        case "chat":
          setMode("chat");
          setInput("");
          pushOutput([{ text: "PRISM chat active — type an intent or question.", tone: "prism" }]);
          setTimeout(() => inputRef.current?.focus(), 50);
          break;
        case "command":
          setMode("command");
          setCommandIndex(0);
          pushOutput([
            { text: "Select a command (↑↓ + Enter) or type command name:", tone: "helix" },
            ...COMMAND_OPTIONS.map((c, i) => ({
              text: `${i === 0 ? ">" : " "} ${c.label}`,
              tone: (i === 0 ? "helix" : "muted") as OutputLine["tone"],
            })),
          ]);
          setTimeout(() => inputRef.current?.focus(), 50);
          break;
        case "projects":
          pushOutput([
            { text: "PRISM projects — link your repo", tone: "prism" },
            { text: "Clone: git clone https://github.com/williamsnameiswill/clarity-prism-cli", tone: "muted" },
            { text: "Run: npm install && npm run build && bash npm-install-local.sh", tone: "muted" },
          ]);
          break;
        case "activity":
          pushOutput(await Promise.resolve(prismTrace(20)));
          break;
        case "settings":
          setMode("settings");
          pushOutput([
            { text: "Configure CLRTY API (optional live mode)", tone: "prism" },
            { text: `Current API URL: ${loadSettings().apiUrl || "(local mode)"}`, tone: "muted" },
            { text: "Type API URL below and press Enter, then API key on next line.", tone: "muted" },
          ]);
          setInput(loadSettings().apiUrl);
          setTimeout(() => inputRef.current?.focus(), 50);
          break;
        case "integrations":
          pushOutput([
            { text: "PRISM → HELIX integrations", tone: "helix" },
            { text: "• @clrt/prism-sdk — intent queries", tone: "muted" },
            { text: "• @clrt/prism-helix — full pipeline", tone: "muted" },
            { text: "• @clrt/helix-core — execution layer", tone: "muted" },
            { text: "• clrt CLI — terminal commands", tone: "muted" },
          ]);
          break;
        case "updates":
          pushOutput([
            { text: "PRISM CLI v1.0.0 — up to date", tone: "success" },
            { text: "Repo: github.com/williamsnameiswill/clarity-prism-cli", tone: "muted" },
          ]);
          break;
        case "help":
          pushOutput([
            { text: "Help & documentation", tone: "prism" },
            { text: "docs/QUICKSTART.md — 5-minute install", tone: "muted" },
            { text: "docs/FULL_USAGE.md — complete guide", tone: "muted" },
            { text: "docs/CLI_REFERENCE.md — every clrt command", tone: "muted" },
            { text: "Terminal: clrt prism query / clrt helix execute / clrt run", tone: "helix" },
          ]);
          break;
        case "exit":
          pushOutput([{ text: "Session saved to local ledger. Goodbye.", tone: "success" }]);
          break;
      }
    },
    [pushOutput]
  );

  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text) return;

    if (mode === "settings") {
      if (!apiUrl && !loadSettings().apiUrl) {
        setApiUrl(text);
        saveSettings({ apiUrl: text, apiKey: loadSettings().apiKey });
        pushOutput([
          { text: `API URL set: ${text}`, tone: "success" },
          { text: "Enter API key (or press Enter to skip):", tone: "muted" },
        ]);
        setInput("");
        return;
      }
      saveSettings({ apiUrl: apiUrl || text, apiKey: text });
      pushOutput([{ text: "Settings saved. Live API mode enabled when URL is set.", tone: "success" }]);
      setMode("menu");
      setInput("");
      return;
    }

    if (mode === "command") {
      const opt = COMMAND_OPTIONS[commandIndex];
      if (opt) {
        pushOutput(await runCliCommand(opt.key));
      }
      setMode("menu");
      setInput("");
      return;
    }

    if (mode === "chat" || activeIndex === 0) {
      if (text.startsWith("predict ") || text.startsWith("/predict")) {
        const cap = Number(text.replace(/\D/g, "")) || 1000;
        pushOutput(prismPredict(cap));
      } else if (text.startsWith("validate ") || text.startsWith("/validate")) {
        pushOutput(prismValidate(text.slice(9) || "claim", "arbitrage_scan"));
      } else if (text.startsWith("stats") || text === "/stats") {
        pushOutput(prismStats());
      } else if (text.startsWith("trace") || text === "/trace") {
        pushOutput(prismTrace());
      } else if (text.startsWith("clrt ")) {
        pushOutput([
          { text: `Run in terminal: ${text}`, tone: "helix" },
          { text: "This UI mirrors PRISM intelligence locally.", tone: "muted" },
        ]);
      } else {
        pushOutput(await prismQuery(text));
      }
      setInput("");
      return;
    }

    pushOutput(await prismQuery(text));
    setInput("");
  }, [input, mode, activeIndex, commandIndex, apiUrl, pushOutput]);

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

  useHotkeys(
    "enter",
    (e) => {
      if (document.activeElement === inputRef.current) return;
      e.preventDefault();
      if (mode === "menu") {
        void activateMenu(MENU_ITEMS[activeIndex]!.id);
      }
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
      <Menu activeIndex={activeIndex} onSelect={handleMenuSelect} />
      <OutputPanel lines={output} />
      <Prompt
        ref={inputRef}
        value={input}
        onChange={setInput}
        onSubmit={() => void handleSubmit()}
        placeholder={
          mode === "settings"
            ? "CLRTY_API_URL or API key"
            : mode === "command"
              ? "Press Enter to run selected command"
              : undefined
        }
      />
      <StatusBar contextLeft={contextLeft} />
    </div>
  );
}
