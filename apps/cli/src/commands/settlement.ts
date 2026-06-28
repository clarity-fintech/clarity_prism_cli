import { Command } from "commander";
import { loadProfile } from "@clrt/account-profile";
import { apiFetch, getApiBaseUrl } from "../lib/api-client.js";
import { formatOutput, parseGlobalFlags, shouldDryRun } from "../middleware/json-dry-run.js";
import { header, done } from "../theme.js";

function parentFlags(cmd: Command): ReturnType<typeof parseGlobalFlags> {
  return parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
}

export function registerSettlement(program: Command): void {
  const settlement = program.command("settlement").description("Genesis settlement & compliance");

  settlement
    .command("instructions")
    .description("Fetch genesis deposit instructions")
    .action(async (_opts, cmd) => {
      const flags = parentFlags(cmd);
      header("SETTLEMENT", "prism");
      const data = await apiFetch(getApiBaseUrl(), "/v1/compliance/genesis-instructions");
      done("INSTRUCTIONS READY");
      formatOutput(data ?? { mode: "local", instructions: "Set CLRTY_API_URL for live attestations" }, flags.json);
    });

  settlement
    .command("register")
    .requiredOption("--wallet <address>", "wallet address")
    .description("Register wallet for compliance")
    .action(async (opts: { wallet: string }, cmd) => {
      const flags = parentFlags(cmd);
      header("SETTLEMENT", "prism");

      if (shouldDryRun(flags)) {
        formatOutput({ dryRun: true, wallet: opts.wallet }, flags.json);
        return;
      }

      const profile = loadProfile();
      const data = await apiFetch(getApiBaseUrl(), "/v1/compliance/wallet/register", {
        method: "POST",
        json: { wallet: opts.wallet, correlationId: profile?.correlationId },
      });
      done("REGISTERED");
      formatOutput(data ?? { wallet: opts.wallet, status: "queued-local" }, flags.json);
    });

  settlement
    .command("preview")
    .option("--wallet <address>", "wallet address")
    .description("Allocation preview")
    .action(async (opts: { wallet?: string }, cmd) => {
      const flags = parentFlags(cmd);
      header("SETTLEMENT", "prism");
      const wallet = opts.wallet ?? loadProfile()?.wallet;
      const path = wallet
        ? `/v1/compliance/allocation-preview?wallet=${encodeURIComponent(wallet)}`
        : "/v1/compliance/allocation-preview";
      const data = await apiFetch(getApiBaseUrl(), path);
      done("PREVIEW READY");
      formatOutput(data ?? { mode: "local", wallet: wallet ?? null }, flags.json);
    });

  settlement
    .command("confirm-deposit")
    .requiredOption("--tx <hash>", "deposit transaction hash")
    .option("--wallet <address>", "wallet address")
    .description("Confirm genesis deposit")
    .action(async (opts: { tx: string; wallet?: string }, cmd) => {
      const flags = parentFlags(cmd);
      header("SETTLEMENT", "prism");

      if (shouldDryRun(flags)) {
        formatOutput({ dryRun: true, tx: opts.tx, wallet: opts.wallet }, flags.json);
        return;
      }

      const data = await apiFetch(getApiBaseUrl(), "/v1/compliance/deposit/confirm", {
        method: "POST",
        json: { txHash: opts.tx, wallet: opts.wallet ?? loadProfile()?.wallet },
      });
      done("DEPOSIT CONFIRMED");
      formatOutput(data ?? { tx: opts.tx, status: "pending-local" }, flags.json);
    });

  settlement
    .command("status")
    .argument("[wallet]", "wallet address")
    .description("Wallet compliance status")
    .action(async (wallet: string | undefined, _opts, cmd) => {
      const flags = parentFlags(cmd);
      header("SETTLEMENT", "prism");
      const w = wallet ?? loadProfile()?.wallet;
      if (!w) {
        formatOutput({ error: "wallet required" }, flags.json);
        process.exit(1);
      }
      const data = await apiFetch(getApiBaseUrl(), `/v1/compliance/wallet/${encodeURIComponent(w)}/status`);
      done("STATUS READY");
      formatOutput(data ?? { wallet: w, status: "unknown-local" }, flags.json);
    });
}
