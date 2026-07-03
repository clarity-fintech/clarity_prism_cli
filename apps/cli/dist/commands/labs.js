import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getApiBaseUrl } from "../lib/api-client.js";
import { formatOutput, parseGlobalFlags } from "../middleware/json-dry-run.js";
import { header, done } from "../theme.js";
function walkthroughPath() {
    return resolve(process.cwd(), "frontend/labs/walkthrough/steps.json");
}
export function registerLabs(program) {
    const labs = program.command("labs").description("Clarity Fortress walkthrough — dev.clrty.io/labs");
    labs
        .command("status")
        .description("Fortress API + manifest status")
        .action(async (_opts, cmd) => {
        const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
        header("LABS", "prism");
        const api = getApiBaseUrl();
        let remote = null;
        try {
            const res = await fetch(`${api}/v1/labs/status`);
            remote = await res.json();
        }
        catch {
            remote = { offline: true };
        }
        done("LABS STATUS");
        formatOutput({
            api,
            remote,
            labs_url: "https://dev.clrty.io/labs",
            pages_url: "https://0af3a55b.clrty-labs.pages.dev",
            chain_id: "clrty-1",
            rpc: "https://rpc.clarity-fintech.com",
        }, flags.json);
    });
    labs
        .command("step")
        .argument("<n>", "walkthrough step 1-13")
        .description("Show walkthrough step from steps.json")
        .action(async (n, _opts, cmd) => {
        const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
        const stepNum = Number(n);
        const raw = readFileSync(walkthroughPath(), "utf8");
        const data = JSON.parse(raw);
        const step = data.steps.find((s) => s.id === stepNum);
        formatOutput(step ?? { error: "step not found", id: stepNum }, flags.json);
    });
}
//# sourceMappingURL=labs.js.map