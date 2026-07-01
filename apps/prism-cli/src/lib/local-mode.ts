/** True when launched with VITE_PRISM_LOCAL=1 (offline stubs, skip API probe). */
export function isLocalTerminal(): boolean {
  return import.meta.env.VITE_PRISM_LOCAL === "1";
}
