import { loadSession, loadProfile } from "@clrt/account-profile";
import { formatOutput, parseGlobalFlags } from "../middleware/json-dry-run.js";
import { header, done } from "../theme.js";
export function registerAudit(prism) {
    prism
        .command("audit")
        .option("--session", "include session token metadata")
        .description("Compliance audit export")
        .action((opts, cmd) => {
        const parent = cmd.parent?.parent?.opts() ?? {};
        const flags = parseGlobalFlags(parent);
        header("PRISM AUDIT", "prism");
        const profile = loadProfile();
        const session = opts.session ? loadSession() : undefined;
        const audit = {
            exportedAt: new Date().toISOString(),
            profile: profile
                ? {
                    entity: profile.entity,
                    correlationId: profile.correlationId,
                    investorStep: profile.investorStep,
                    tierInterest: profile.tierInterest,
                }
                : null,
            session: session
                ? {
                    method: session.method,
                    expiresAt: session.expiresAt,
                    hasToken: Boolean(session.token),
                }
                : undefined,
        };
        done("AUDIT EXPORT READY");
        formatOutput(audit, flags.json);
    });
}
//# sourceMappingURL=audit.js.map