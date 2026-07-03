import * as readline from "node:readline";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { apiFetch, getApiBaseUrl } from "../lib/api-client.js";
import { header, theme } from "../theme.js";
import { versionLabel } from "../version.js";
import { printPrismLogoAscii } from "../lib/prism-logo-ascii.js";
const CLI_ENTRY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../index.js");
const USAGE = `
${theme.prism("PRISM TERMINAL — full usage in this shell")}
${theme.dim("Terminal only · full clrt CLI · port :8545 feeds live data")}

${theme.helix("Navigation")}
  help              this guide
  exit | quit       leave terminal
  <any clrt cmd>    e.g. prism query "yield" · chain status · wallet balance

${theme.helix("Funnels (examples)")}
  prism query · predict · validate · trace · stats
  helix status · helix execute · pipeline via: run "intent"
  chain ready · chain status · wallet status · settlement status
  prism commons inbox  (send/cache → use PRISM web terminal Commons panel)

${theme.dim("No browser required — all output stays in this terminal.")}
`;
async function probePort() {
    const base = getApiBaseUrl();
    const status = await apiFetch(base, "/v1/status");
    const prism = await apiFetch(base, "/v1/prism/status");
    return status !== null && prism !== null;
}
function runClrtLine(line) {
    const trimmed = line.trim();
    if (!trimmed)
        return 0;
    const parts = trimmed.split(/\s+/);
    const args = parts[0] === "clrt" ? parts.slice(1) : parts;
    const result = spawnSync(process.execPath, [CLI_ENTRY, ...args], {
        env: process.env,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
    });
    if (result.stdout)
        process.stdout.write(result.stdout);
    if (result.stderr)
        process.stderr.write(result.stderr);
    return result.status ?? 1;
}
export async function runPrismTerminalShell() {
    const live = await probePort();
    const port = getApiBaseUrl().replace(/\/$/, "");
    header("PRISM TERMINAL", "prism");
    console.log(theme.dim(printPrismLogoAscii()));
    console.log(theme.dim(`Release ${versionLabel()}`));
    console.log(live
        ? theme.success(`LIVE · ${port} · port-fed data`)
        : theme.warn(`API offline · ${port} — start: cargo run -p clrty-api`));
    console.log(theme.dim("Type help for full usage · exit to quit\n"));
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
        prompt: theme.prism("prism> "),
    });
    rl.prompt();
    rl.on("line", (line) => {
        const trimmed = line.trim();
        if (!trimmed) {
            rl.prompt();
            return;
        }
        const lower = trimmed.toLowerCase();
        if (lower === "exit" || lower === "quit" || lower === "q") {
            console.log(theme.dim("PRISM terminal closed."));
            rl.close();
            return;
        }
        if (lower === "help" || lower === "full" || lower === "?") {
            console.log(USAGE);
            rl.prompt();
            return;
        }
        void (async () => {
            runClrtLine(trimmed);
            rl.prompt();
        })();
    });
    rl.on("close", () => {
        process.exit(0);
    });
}
//# sourceMappingURL=terminal-shell.js.map