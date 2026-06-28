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
    .command("ready")
    .option("--wallet <addr>", "wallet for sets probe")
    .description("Unified clrty-1 readiness gate")
    .action(async (opts: { wallet?: string }, cmd) => {
      const flags = parentFlags(cmd);
      header("CHAIN", "helix");
      const base = getApiBaseUrl();
      const wallet = opts.wallet ?? "local";

      const probes = [
        { id: "status", path: "/v1/status", label: "API status" },
        { id: "indexer", path: "/v1/indexer/clrty-l1", label: "L1 indexer" },
        { id: "sets", path: `/v1/sets/${encodeURIComponent(wallet)}`, label: "Set tier lookup" },
        { id: "dx", path: "/v1/dx/primitives", label: "DX primitives" },
      ] as const;

      const results = await Promise.all(
        probes.map(async (p) => {
          const data = await apiFetch(base, p.path);
          return {
            id: p.id,
            label: p.label,
            path: p.path,
            pass: data !== null,
            data: data ?? { mode: "unavailable" },
          };
        })
      );

      const passCount = results.filter((r) => r.pass).length;
      const ready = passCount === results.length;

      done(ready ? "CHAIN READY" : "CHAIN NOT READY");
      formatOutput(
        {
          chain: "clrty-1",
          ready,
          pass: passCount,
          total: results.length,
          matrix: results.map(({ id, label, path, pass }) => ({ id, label, path, pass })),
          details: results,
        },
        flags.json
      );
      if (!ready && process.env.CLRTY_API_STRICT === "1") process.exit(1);
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
