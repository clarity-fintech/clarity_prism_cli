import { EXCHANGES, createRateLimiter } from "@clrt/market-feeds";
import { apiFetch, getApiBaseUrl } from "../lib/api-client.js";
import { formatOutput, parseGlobalFlags, shouldDryRun } from "../middleware/json-dry-run.js";
import { header, done } from "../theme.js";
function parentFlags(cmd) {
    return parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
}
export function registerExchange(program) {
    const exchange = program.command("exchange").description("Exchange integration tools");
    exchange
        .command("list")
        .description("List exchange integrations")
        .action(async (_opts, cmd) => {
        const flags = parentFlags(cmd);
        header("EXCHANGE", "helix");
        const data = await apiFetch(getApiBaseUrl(), "/v1/integrations");
        done("LIST READY");
        formatOutput(data ?? {
            exchanges: EXCHANGES,
            rateLimit: {
                rps: process.env.EXCHANGE_RATE_LIMIT_RPS ?? "10",
                burst: process.env.EXCHANGE_RATE_LIMIT_BURST ?? "20",
            },
        }, flags.json);
    });
    exchange
        .command("status")
        .argument("[slug]", "exchange slug")
        .description("Exchange probe status")
        .action(async (slug, _opts, cmd) => {
        const flags = parentFlags(cmd);
        header("EXCHANGE", "helix");
        const target = slug ?? EXCHANGES[0];
        const data = await apiFetch(getApiBaseUrl(), `/v1/integrations/${encodeURIComponent(target)}/probe`);
        done("STATUS READY");
        formatOutput(data ?? { slug: target, status: "local-stub" }, flags.json);
    });
    exchange
        .command("test")
        .argument("<slug>", "exchange slug")
        .description("Exchange connectivity test")
        .action(async (slug, _opts, cmd) => {
        const flags = parentFlags(cmd);
        header("EXCHANGE", "helix");
        const limiters = createRateLimiter();
        const allowed = limiters[slug]?.take() ?? true;
        if (!allowed) {
            formatOutput({ slug, error: "rate limited" }, flags.json);
            process.exit(1);
        }
        if (shouldDryRun(flags)) {
            formatOutput({ dryRun: true, slug }, flags.json);
            return;
        }
        const data = await apiFetch(getApiBaseUrl(), `/v1/integrations/${encodeURIComponent(slug)}/probe`);
        done("TEST COMPLETE");
        formatOutput(data ?? { slug, ok: true, mode: "local-stub" }, flags.json);
    });
    exchange
        .command("qa")
        .description("Exchange algo QA suite")
        .action(async (_opts, cmd) => {
        const flags = parentFlags(cmd);
        header("EXCHANGE", "helix");
        const results = [];
        for (const slug of EXCHANGES) {
            const probe = await apiFetch(getApiBaseUrl(), `/v1/integrations/${slug}/probe`);
            results.push({ slug, ok: probe !== null, probe: probe ?? "local-stub" });
        }
        done("QA COMPLETE");
        formatOutput({ results }, flags.json);
    });
}
//# sourceMappingURL=exchange.js.map