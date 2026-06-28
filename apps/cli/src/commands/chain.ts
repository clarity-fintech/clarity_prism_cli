import { Command } from "commander";
import { apiFetch, getApiBaseUrl } from "../lib/api-client.js";
import { formatOutput, parseGlobalFlags } from "../middleware/json-dry-run.js";
import { header, done } from "../theme.js";

function parentFlags(cmd: Command): ReturnType<typeof parseGlobalFlags> {
  return parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
}

export function registerChain(program: Command): void {
  const chain = program.command("chain").description("clrty-l1 chain tools");

  chain
    .command("status")
    .description("Chain status")
    .action(async (_opts, cmd) => {
      const flags = parentFlags(cmd);
      header("CHAIN", "helix");
      const data = await apiFetch(getApiBaseUrl(), "/v1/status");
      done("STATUS READY");
      formatOutput(data ?? { chain: "clrty-l1", mode: "local" }, flags.json);
    });

  chain
    .command("sets")
    .argument("[address]", "wallet or set address")
    .description("Set tier lookup")
    .action(async (address: string | undefined, _opts, cmd) => {
      const flags = parentFlags(cmd);
      header("CHAIN", "helix");
      const path = address ? `/v1/sets/${encodeURIComponent(address)}` : "/v1/sets/local";
      const data = await apiFetch(getApiBaseUrl(), path);
      done("SETS READY");
      formatOutput(data ?? { address: address ?? "local", set: 99 }, flags.json);
    });

  chain
    .command("indexer")
    .option("--chain <name>", "chain name", "clrty-l1")
    .description("L1 indexer snapshot")
    .action(async (opts: { chain: string }, cmd) => {
      const flags = parentFlags(cmd);
      header("CHAIN", "helix");
      const data = await apiFetch(getApiBaseUrl(), `/v1/indexer/${encodeURIComponent(opts.chain)}`);
      done("INDEXER READY");
      formatOutput(data ?? { chain: opts.chain, mode: "local" }, flags.json);
    });

  chain
    .command("dx")
    .description("DX primitives catalog")
    .action(async (_opts, cmd) => {
      const flags = parentFlags(cmd);
      header("CHAIN", "helix");
      const data = await apiFetch(getApiBaseUrl(), "/v1/dx/primitives");
      done("DX PRIMITIVES READY");
      formatOutput(data ?? { primitives: [], mode: "local" }, flags.json);
    });

  chain
    .command("simulate")
    .option("--events <n>", "event count", "10")
    .description("Sim event replay")
    .action(async (opts: { events: string }, cmd) => {
      const flags = parentFlags(cmd);
      header("CHAIN", "helix");
      const data = await apiFetch(getApiBaseUrl(), `/v1/sim/events?limit=${encodeURIComponent(opts.events)}`);
      done("SIMULATION READY");
      formatOutput(data ?? { events: Number(opts.events), mode: "local" }, flags.json);
    });

  chain
    .command("devnet")
    .description("Local devnet status")
    .action(async (_opts, cmd) => {
      const flags = parentFlags(cmd);
      header("CHAIN", "helix");
      const data = await apiFetch(getApiBaseUrl(), "/v1/status");
      done("DEVNET READY");
      formatOutput(
        data ?? {
          devnet: true,
          rpc: getApiBaseUrl(),
          note: "Connect CLRTY_API_URL for live devnet",
        },
        flags.json
      );
    });
}
