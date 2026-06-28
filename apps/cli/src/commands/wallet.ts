import { Command } from "commander";
import { CLRTYWallet } from "@clrt/clarity-wallet";
import { loadProfile, linkWallet, usernameNamespace } from "@clrt/account-profile";
import { getApiBaseUrl } from "../lib/api-client.js";
import { formatOutput, parseGlobalFlags, shouldDryRun } from "../middleware/json-dry-run.js";
import { header, done } from "../theme.js";

function walletClient(): CLRTYWallet {
  const profile = loadProfile();
  return CLRTYWallet.connect({
    api: getApiBaseUrl(),
    username: profile?.username,
  });
}

export function registerWallet(program: Command): void {
  const wallet = program.command("wallet").description("CLRTY Wallet — registry, balance, nodes");

  wallet
    .command("status")
    .description("Registry + linked username")
    .action(async (_opts, cmd) => {
      const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
      header("WALLET", "prism");
      const profile = loadProfile();
      const client = walletClient();
      const registry = await client.fetchRegistry();
      done("WALLET STATUS");
      formatOutput(
        {
          username: profile?.username ?? null,
          namespace: profile?.username ? usernameNamespace(profile.username) : null,
          linkedAddress: profile?.wallet ?? null,
          registry: registry ?? { mode: "local" },
        },
        flags.json
      );
    });

  wallet
    .command("balance")
    .argument("[address]", "wallet address (defaults to profile wallet)")
    .description("clrty-1 balance via RPC")
    .action(async (address: string | undefined, _opts, cmd) => {
      const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
      header("WALLET", "helix");
      const profile = loadProfile();
      const addr = address ?? profile?.wallet;
      if (!addr) {
        formatOutput({ error: "no address — pass [address] or run clrt wallet connect" }, flags.json);
        process.exit(1);
      }
      const client = walletClient();
      const balance = await client.getBalance(addr);
      done("BALANCE READY");
      formatOutput(balance, flags.json);
    });

  wallet
    .command("registry")
    .description("GET /v1/wallet/registry")
    .action(async (_opts, cmd) => {
      const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
      header("WALLET", "prism");
      const data = await walletClient().fetchRegistry();
      done("REGISTRY READY");
      formatOutput(data ?? { mode: "local", chain: "clrty-1" }, flags.json);
    });

  wallet
    .command("nodes")
    .description("25 leverage nodes manifest")
    .action(async (_opts, cmd) => {
      const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
      header("WALLET", "prism");
      const data = await walletClient().fetchNodes();
      done("NODES READY");
      formatOutput(data, flags.json);
    });

  wallet
    .command("connect")
    .requiredOption("--address <addr>", "wallet address to link")
    .description("Link wallet address to username profile")
    .action(async (opts: { address: string }, cmd) => {
      const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
      header("WALLET", "prism");
      const profile = loadProfile();
      if (!profile?.username) {
        formatOutput({ error: "account required — run clrt account create --username ..." }, flags.json);
        process.exit(1);
      }

      if (shouldDryRun(flags)) {
        formatOutput({ dryRun: true, address: opts.address, username: profile.username }, flags.json);
        return;
      }

      const client = walletClient();
      const remote = await client.registerWallet({ address: opts.address, username: profile.username });
      const updated = linkWallet(opts.address);
      done("WALLET CONNECTED");
      formatOutput(
        {
          username: updated.username,
          namespace: usernameNamespace(updated.username),
          address: updated.wallet,
          api: remote,
        },
        flags.json
      );
    });
}
