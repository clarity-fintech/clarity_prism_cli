import type { OutputLine } from "./prism-bridge";
import { isLocalTerminal } from "./local-mode";
import { getPortLabel, isApiConnected } from "./port-connection";

/** Full PRISM terminal use is port-fed unless explicit offline dev (VITE_PRISM_LOCAL=1). */
export function isPortFed(): boolean {
  return isApiConnected();
}

export function allowsLocalDevFallback(): boolean {
  return isLocalTerminal();
}

export function portFeedLabel(): string {
  if (isLocalTerminal()) return "DEV · offline stubs";
  if (isApiConnected()) return `LIVE · ${getPortLabel()} · port-fed`;
  return `DISCONNECTED · ${getPortLabel()} · start clrty-api`;
}

export function portRequiredBlock(hint?: string): OutputLine[] {
  return [
    { text: "PORT REQUIRED", tone: "risk" },
    {
      text:
        hint ??
        `Full terminal use requires clrty-api on ${getPortLabel()}. Run: cargo run -p clrty-api`,
      tone: "muted",
    },
  ];
}

/** Use API payload when present; dev fallback only in VITE_PRISM_LOCAL mode. */
export function resolvePortPayload<T>(data: T | null, localFallback: T): T | null {
  if (data !== null) return data;
  if (isLocalTerminal()) return localFallback;
  return null;
}

export function finishPortCommand(
  header: OutputLine[],
  label: string,
  data: unknown | null,
  localFallback: unknown
): OutputLine[] {
  const payload = resolvePortPayload(data, localFallback);
  if (payload === null) {
    return [...header, ...portRequiredBlock()];
  }
  return [
    ...header,
    { text: label, tone: "helix" },
    { text: JSON.stringify(payload, null, 2), tone: "muted" },
  ];
}
