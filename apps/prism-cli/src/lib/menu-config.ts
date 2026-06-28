export type MenuId =
  | "chat"
  | "command"
  | "projects"
  | "activity"
  | "settings"
  | "integrations"
  | "updates"
  | "help"
  | "exit";

export interface MenuItem {
  id: MenuId;
  icon: string;
  label: string;
}

export const MENU_ITEMS: MenuItem[] = [
  { id: "chat", icon: "💬", label: "Chat with PRISM" },
  { id: "command", icon: "⌨️", label: "Run a command" },
  { id: "projects", icon: "📂", label: "Manage projects" },
  { id: "activity", icon: "🕒", label: "View recent activity" },
  { id: "settings", icon: "⚙️", label: "Configure settings" },
  { id: "integrations", icon: "🧩", label: "Manage integrations" },
  { id: "updates", icon: "☁️", label: "Check for updates" },
  { id: "help", icon: "❓", label: "Help & documentation" },
  { id: "exit", icon: "👋", label: "Exit" },
];

export const COMMAND_OPTIONS = [
  { key: "prism query", label: "PRISM query — arbitrage scan" },
  { key: "prism predict", label: "PRISM predict — capital forecast" },
  { key: "prism validate", label: "PRISM validate — adversarial QA" },
  { key: "prism trace", label: "PRISM trace — mini-git log" },
  { key: "prism stats", label: "PRISM stats — network metrics" },
  { key: "helix execute", label: "HELIX execute swap" },
  { key: "helix simulate", label: "HELIX simulate swap" },
  { key: "helix liquidity", label: "HELIX liquidity scan" },
  { key: "pipeline", label: "Full pipeline — clrt run" },
];
