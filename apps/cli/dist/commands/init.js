import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { syncRepos, getDrift, listRepos } from "@clrt/repo-sync";
import { formatOutput, parseGlobalFlags, shouldDryRun } from "../middleware/json-dry-run.js";
import { header, step, done } from "../theme.js";
const PRISM_HOME = join(homedir(), ".clrt", "prism");
export function registerInit(prism) {
    registerSync(prism);
    prism
        .command("init")
        .description("Seed ~/.clrt/prism/ local node config")
        .action((_opts, cmd) => {
        const parent = cmd.parent?.parent?.opts() ?? {};
        const flags = parseGlobalFlags(parent);
        if (flags.dryRun) {
            formatOutput({ dryRun: true, wouldCreate: PRISM_HOME, subdirs: ["commons", "cache", "ledger"] }, flags.json);
            return;
        }
        header("PRISM INIT", "prism");
        mkdirSync(join(PRISM_HOME, "commons"), { recursive: true });
        mkdirSync(join(PRISM_HOME, "cache"), { recursive: true });
        mkdirSync(join(PRISM_HOME, "ledger"), { recursive: true });
        const configPath = join(PRISM_HOME, "config.json");
        if (!existsSync(configPath)) {
            writeFileSync(configPath, JSON.stringify({
                version: 1,
                createdAt: new Date().toISOString(),
                apiUrl: process.env.CLRTY_API_URL ?? "http://127.0.0.1:8545",
            }, null, 2));
        }
        step(`Seeded ${PRISM_HOME}`);
        done("INIT COMPLETE");
        formatOutput({ home: PRISM_HOME, config: configPath }, flags.json);
    });
}
function registerSync(prism) {
    const sync = prism.command("sync").description("Sync repo manifest pins");
    sync
        .option("--repos", "list pinned repos")
        .option("--drift", "show drift report")
        .action((opts, cmd) => {
        const parent = cmd.parent?.parent?.opts() ?? {};
        const flags = parseGlobalFlags({ ...parent, dryRun: parent.dryRun });
        if (opts.repos) {
            formatOutput({ repos: listRepos() }, flags.json);
            return;
        }
        if (opts.drift) {
            formatOutput({ drift: getDrift() }, flags.json);
            return;
        }
        header("PRISM SYNC", "prism");
        const result = syncRepos({ dryRun: shouldDryRun(flags) });
        done("SYNC COMPLETE");
        formatOutput(result, flags.json);
    });
}
//# sourceMappingURL=init.js.map