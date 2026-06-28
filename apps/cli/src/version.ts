/** Semantic release + micro counter (incremented on each CLI reprep within a patch). */
export const CLRTY_VERSION = "1.0.1";
export const CLRTY_MICRO = 1;

export function versionLabel(): string {
  return `${CLRTY_VERSION}.μ${CLRTY_MICRO}`;
}

export const CLRTY_RELEASE = {
  codename: "Tier5-Enterprise",
  date: "2026-06-28",
  highlights: [
    "Primitive registry + --json/--dry-run",
    "clrty-1 chain commands",
    "Passwordless account + investor settlement",
    "QA exchange hub + antiban rate limits",
    "Mastermind pack + 18 funnel terminal UI",
  ],
} as const;
