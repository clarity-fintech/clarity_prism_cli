import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { deriveGateAccessPassword, digestGateAccessPassword, } from "@clrt/gate-access";
import { formatOutput, parseGlobalFlags } from "../middleware/json-dry-run.js";
import { header, done, theme } from "../theme.js";
const CLI_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
function parseEnvFile(path) {
    const out = {};
    if (!existsSync(path))
        return out;
    for (const line of readFileSync(path, "utf8").split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#"))
            continue;
        const eq = trimmed.indexOf("=");
        if (eq <= 0)
            continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        out[key] = val;
    }
    return out;
}
function resolveMaster(opts) {
    const fromFlag = opts.master?.trim();
    if (fromFlag)
        return fromFlag;
    const rootEnv = parseEnvFile(join(CLI_ROOT, ".env"));
    const fromEnv = process.env.CLRTY_GATE_MASTER?.trim() || rootEnv.CLRTY_GATE_MASTER?.trim();
    if (fromEnv)
        return fromEnv;
    throw new Error("master secret required — pass --master <secret>, set CLRTY_GATE_MASTER in .env, or export CLRTY_GATE_MASTER");
}
export function registerGate(program) {
    const gate = program.command("gate").description("PRISM terminal access gate tools");
    gate
        .command("sync")
        .description("Sync terminal Vite env from CLRTY_GATE_MASTER (.env → apps/prism-cli/.env)")
        .action((_opts, cmd) => {
        const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
        header("GATE", "prism");
        execSync("node scripts/sync_gate_env.mjs", { cwd: CLI_ROOT, stdio: "inherit" });
        done("GATE ENV SYNCED");
        formatOutput({ ok: true, path: "apps/prism-cli/.env" }, flags.json);
    });
    gate
        .command("password")
        .description("Derive personal gate access code from your master secret (single source command)")
        .option("--master <secret>", "master secret (or CLRTY_GATE_MASTER env)")
        .option("--digest", "output SHA-256 digest for VITE_CLRTY_GATE_ACCESS_DIGEST")
        .action(async (opts, cmd) => {
        const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
        header("GATE", "prism");
        let master;
        try {
            master = resolveMaster(opts);
        }
        catch (err) {
            formatOutput({ error: String(err) }, flags.json);
            process.exit(1);
        }
        const password = await deriveGateAccessPassword(master);
        if (opts.digest) {
            const digest = await digestGateAccessPassword(password);
            done("GATE DIGEST READY");
            formatOutput({
                digest,
                hint: "Auto-synced via clrt gate sync — enter in PRISM terminal gate Personal access",
                env: "VITE_CLRTY_GATE_ACCESS_DIGEST",
            }, flags.json);
            if (!flags.json) {
                console.log(theme.dim("Digest (build-time env):"));
                console.log(theme.helix(digest));
            }
            return;
        }
        done("GATE ACCESS CODE");
        formatOutput({
            password,
            hint: "Enter this code in the PRISM terminal gate — Personal access",
            command: "clrt gate password",
        }, flags.json);
        if (!flags.json) {
            console.log(theme.prism("Personal gate access code:"));
            console.log(theme.prism(password));
            console.log(theme.dim("Share with approved users or enter in terminal gate UI."));
        }
    });
}
//# sourceMappingURL=gate.js.map