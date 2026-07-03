import { apiFetch, getApiBaseUrl } from "../lib/api-client.js";
import { formatOutput, parseGlobalFlags } from "../middleware/json-dry-run.js";
import { header, done } from "../theme.js";
function parentFlags(cmd) {
    return parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
}
export function registerChain(program) {
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
        .action(async (address, _opts, cmd) => {
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
        .action(async (opts, cmd) => {
        const flags = parentFlags(cmd);
        header("CHAIN", "helix");
        const data = await apiFetch(getApiBaseUrl(), `/v1/indexer/${encodeURIComponent(opts.chain)}`);
        done("INDEXER READY");
        formatOutput(data ?? { chain: opts.chain, mode: "local" }, flags.json);
    });
    const dx = chain.command("dx").description("Developer DX primitives (list | parse | execute)");
    dx
        .command("list")
        .description("List DX primitives catalog")
        .action(async (_opts, cmd) => {
        const flags = parentFlags(cmd);
        header("CHAIN", "helix");
        const data = await apiFetch(getApiBaseUrl(), "/v1/dx/primitives");
        done("DX LIST READY");
        formatOutput(data ?? { primitives: [], mode: "local" }, flags.json);
    });
    dx
        .command("parse")
        .requiredOption("--input <json>", "DX payload JSON")
        .description("Parse DX trigger payload")
        .action(async (opts, cmd) => {
        const flags = parentFlags(cmd);
        header("CHAIN", "helix");
        let body;
        try {
            body = JSON.parse(opts.input);
        }
        catch {
            formatOutput({ error: "invalid JSON input" }, flags.json);
            process.exit(1);
        }
        const data = await apiFetch(getApiBaseUrl(), "/v1/dx/parse", {
            method: "POST",
            json: body,
        });
        done("DX PARSE READY");
        formatOutput(data ?? { parsed: body, mode: "local" }, flags.json);
    });
    dx
        .command("execute")
        .option("--slug <slug>", "DX primitive slug", "intent_execute")
        .option("--input <json>", "execution payload JSON", "{}")
        .description("Execute DX primitive on clrty-1")
        .action(async (opts, cmd) => {
        const flags = parentFlags(cmd);
        header("CHAIN", "helix");
        let payload = {};
        try {
            payload = JSON.parse(opts.input);
        }
        catch {
            formatOutput({ error: "invalid JSON input" }, flags.json);
            process.exit(1);
        }
        const data = await apiFetch(getApiBaseUrl(), "/v1/dx/execute", {
            method: "POST",
            json: { slug: opts.slug, payload },
        });
        done("DX EXECUTE READY");
        formatOutput(data ?? {
            slug: opts.slug,
            payload,
            mode: "local",
            note: opts.slug === "cross_chain_transfer" ? "deferred per DEFERRED_BRIDGE.md" : undefined,
        }, flags.json);
    });
    chain
        .command("transfer")
        .option("--wallet <addr>", "source wallet")
        .option("--amount <n>", "amount")
        .description("Intelligent transfer via DX intelligent_transfer slug")
        .action(async (opts, cmd) => {
        const flags = parentFlags(cmd);
        header("CHAIN", "helix");
        const data = await apiFetch(getApiBaseUrl(), "/v1/dx/execute", {
            method: "POST",
            json: {
                slug: "intelligent_transfer",
                payload: { wallet: opts.wallet, amount: opts.amount },
            },
        });
        done("TRANSFER READY");
        formatOutput(data ?? { slug: "intelligent_transfer", mode: "local" }, flags.json);
    });
    chain
        .command("simulate")
        .option("--events <n>", "event count", "10")
        .description("Sim event replay")
        .action(async (opts, cmd) => {
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
        .action(async (opts, cmd) => {
        const flags = parentFlags(cmd);
        header("CHAIN", "helix");
        const base = getApiBaseUrl();
        const wallet = opts.wallet ?? "local";
        const probes = [
            { id: "status", path: "/v1/status", label: "API status" },
            { id: "indexer", path: "/v1/indexer/clrty-l1", label: "L1 indexer" },
            { id: "sets", path: `/v1/sets/${encodeURIComponent(wallet)}`, label: "Set tier lookup" },
            { id: "dx", path: "/v1/dx/primitives", label: "DX primitives" },
        ];
        const results = await Promise.all(probes.map(async (p) => {
            const data = await apiFetch(base, p.path);
            return {
                id: p.id,
                label: p.label,
                path: p.path,
                pass: data !== null,
                data: data ?? { mode: "unavailable" },
            };
        }));
        const passCount = results.filter((r) => r.pass).length;
        const ready = passCount === results.length;
        done(ready ? "CHAIN READY" : "CHAIN NOT READY");
        formatOutput({
            chain: "clrty-1",
            ready,
            pass: passCount,
            total: results.length,
            matrix: results.map(({ id, label, path, pass }) => ({ id, label, path, pass })),
            details: results,
        }, flags.json);
        if (!ready && process.env.CLRTY_API_STRICT === "1")
            process.exit(1);
    });
    chain
        .command("devnet")
        .description("Local devnet status")
        .action(async (_opts, cmd) => {
        const flags = parentFlags(cmd);
        header("CHAIN", "helix");
        const data = await apiFetch(getApiBaseUrl(), "/v1/status");
        done("DEVNET READY");
        formatOutput(data ?? {
            devnet: true,
            rpc: getApiBaseUrl(),
            note: "Connect CLRTY_API_URL for live devnet",
        }, flags.json);
    });
}
//# sourceMappingURL=chain.js.map