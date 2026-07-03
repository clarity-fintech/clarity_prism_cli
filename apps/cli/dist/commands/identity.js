import { loadProfile } from "@clrt/account-profile";
import { formatOutput, parseGlobalFlags } from "../middleware/json-dry-run.js";
import { header, done } from "../theme.js";
export function registerIdentity(prism) {
    prism
        .command("identity")
        .option("--cage", "show CAGE/DUNS identifier")
        .description("CAGE/DUNS identity from account profile")
        .action((opts, cmd) => {
        const parent = cmd.parent?.parent?.opts() ?? {};
        const flags = parseGlobalFlags(parent);
        const profile = loadProfile();
        header("PRISM IDENTITY", "prism");
        const result = {
            entity: profile?.entity ?? null,
            cage: profile?.cage ?? null,
            wallet: profile?.wallet ?? null,
            correlationId: profile?.correlationId ?? null,
            mode: opts.cage ? "cage" : "profile",
        };
        done("IDENTITY READY");
        formatOutput(result, flags.json);
    });
}
//# sourceMappingURL=identity.js.map