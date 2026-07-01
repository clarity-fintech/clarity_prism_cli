import { appendFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

export interface TaxBreakdown {
  transferFee: number;
  complianceTax: number;
  gasEquivalent: number;
  totalTax: number;
  currency: string;
  jurisdiction: string;
  basisPoints: {
    transfer: number;
    compliance: number;
  };
}

export interface BlockchainTransferLog {
  id: string;
  txId: string;
  transferId?: string;
  fromUsername: string;
  toUsername: string;
  cid: string;
  sizeBytes: number;
  notionalClrt: number;
  taxes: TaxBreakdown;
  netAfterTax: number;
  chainId: string;
  blockRef: string;
  loggedAt: string;
  status: "pending" | "confirmed" | "received";
}

const LEDGER_PATH = join(homedir(), ".clrt", "prism", "commons", "transfer-ledger.jsonl");

/** Compute all-inclusive tax on a commons file transfer (basis + compliance + gas). */
export function computeTransferTax(sizeBytes: number, notionalClrt = 0): TaxBreakdown {
  const transferBps = 10; // 0.10%
  const complianceBps = 25; // 0.25%
  const notional = notionalClrt > 0 ? notionalClrt : Math.max(sizeBytes, 1);
  const transferFee = Math.ceil((notional * transferBps) / 10_000);
  const complianceTax = Math.ceil((notional * complianceBps) / 10_000);
  const gasEquivalent = 21_000;
  return {
    transferFee,
    complianceTax,
    gasEquivalent,
    totalTax: transferFee + complianceTax + gasEquivalent,
    currency: "CLRTY",
    jurisdiction: "US",
    basisPoints: { transfer: transferBps, compliance: complianceBps },
  };
}

function ensureLedgerDir(): void {
  mkdirSync(join(homedir(), ".clrt", "prism", "commons"), { recursive: true });
}

export function logBlockchainTransfer(input: {
  transferId?: string;
  fromUsername: string;
  toUsername: string;
  cid: string;
  sizeBytes: number;
  notionalClrt?: number;
  status?: BlockchainTransferLog["status"];
}): BlockchainTransferLog {
  ensureLedgerDir();
  const taxes = computeTransferTax(input.sizeBytes, input.notionalClrt);
  const notional = input.notionalClrt ?? Math.max(input.sizeBytes, 1);
  const entry: BlockchainTransferLog = {
    id: randomUUID(),
    txId: `clrty-1-${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    transferId: input.transferId,
    fromUsername: input.fromUsername.trim().toLowerCase(),
    toUsername: input.toUsername.trim().toLowerCase(),
    cid: input.cid,
    sizeBytes: input.sizeBytes,
    notionalClrt: notional,
    taxes,
    netAfterTax: Math.max(0, notional - taxes.totalTax),
    chainId: "clrty-1",
    blockRef: `0x${randomUUID().replace(/-/g, "").slice(0, 8)}`,
    loggedAt: new Date().toISOString(),
    status: input.status ?? "pending",
  };
  appendFileSync(LEDGER_PATH, `${JSON.stringify(entry)}\n`);
  return entry;
}

export function readTransferLedger(limit = 50): BlockchainTransferLog[] {
  if (!existsSync(LEDGER_PATH)) return [];
  const lines = readFileSync(LEDGER_PATH, "utf8").trim().split("\n").filter(Boolean);
  return lines
    .slice(-limit)
    .map((line) => JSON.parse(line) as BlockchainTransferLog)
    .reverse();
}

export function getLedgerPath(): string {
  return LEDGER_PATH;
}
