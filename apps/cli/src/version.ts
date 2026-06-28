/** Semantic release + micro counter (incremented on each CLI reprep within a patch). */
export const CLRTY_VERSION = "1.0.2";
export const CLRTY_MICRO = 1;

export function versionLabel(): string {
  return `${CLRTY_VERSION}.μ${CLRTY_MICRO}`;
}

export const CLRTY_RELEASE = {
  codename: "Wallet-P2P-Chain",
  date: "2026-06-18",
  highlights: [
    "Username P2P identity + commons send/inbox/receive",
    "CLRTY Wallet funnel + clrt wallet commands",
    "clrty-1 chain ready gate",
    "Real pack downloads from CLRTY-WALLET-INTEGRATION",
    "Cross-repo prism sync manifest",
  ],
} as const;
