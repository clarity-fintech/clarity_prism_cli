import { loadProfile } from "@clrt/account-profile";
import { requestPartnerAccess, getPartnerAccessStatus } from "@clrt/skills-sdk";
import { formatOutput, parseGlobalFlags, shouldDryRun } from "../middleware/json-dry-run.js";
import { header, done } from "../theme.js";
export function registerPartner(program) {
    const partner = program.command("partner").description("Partner early access");
    partner
        .command("request-access")
        .option("--tier <tier>", "requested tier", "seed")
        .description("Submit early access request")
        .action(async (opts, cmd) => {
        const parent = cmd.parent?.parent?.opts() ?? {};
        const flags = parseGlobalFlags(parent);
        header("PARTNER ACCESS", "prism");
        const profile = loadProfile();
        if (shouldDryRun(flags)) {
            formatOutput({ dryRun: true, tier: opts.tier, profile: profile?.entity ?? null }, flags.json);
            return;
        }
        const result = await requestPartnerAccess({
            entity: profile?.entity ?? "anonymous",
            email: profile?.email,
            tier: opts.tier,
            correlationId: profile?.correlationId,
        });
        done("REQUEST SUBMITTED");
        formatOutput(result, flags.json);
    });
    partner
        .command("status")
        .description("Partner access status")
        .action(async (_opts, cmd) => {
        const parent = cmd.parent?.parent?.opts() ?? {};
        const flags = parseGlobalFlags(parent);
        header("PARTNER ACCESS", "prism");
        const profile = loadProfile();
        const status = await getPartnerAccessStatus(profile?.correlationId);
        done("STATUS READY");
        formatOutput(status, flags.json);
    });
}
//# sourceMappingURL=partner.js.map