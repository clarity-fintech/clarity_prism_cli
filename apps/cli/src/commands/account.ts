import { Command } from "commander";
import {
  createProfile,
  loadProfile,
  loadSession,
  saveSession,
  maskEmail,
} from "@clrt/account-profile";
import { formatOutput, parseGlobalFlags, shouldDryRun } from "../middleware/json-dry-run.js";
import { header, step, done } from "../theme.js";

export function registerAccount(program: Command): void {
  const account = program.command("account").description("Passwordless account profile");

  account
    .command("create")
    .requiredOption("--entity <name>", "entity name")
    .requiredOption("--email <email>", "contact email")
    .requiredOption("--intent <intent>", "session intent")
    .option("--cage <cage>", "CAGE/DUNS code")
    .option("--wallet <wallet>", "wallet address")
    .option("--tier <tier>", "seed|strategic|hardware-node")
    .description("Create passwordless profile")
    .action((opts: {
      entity: string;
      email: string;
      intent: string;
      cage?: string;
      wallet?: string;
      tier?: string;
    }, cmd) => {
      const parent = cmd.parent?.parent?.opts() ?? {};
      const flags = parseGlobalFlags(parent);
      header("ACCOUNT", "prism");

      if (shouldDryRun(flags)) {
        formatOutput({ dryRun: true, entity: opts.entity, email: maskEmail(opts.email) }, flags.json);
        return;
      }

      const profile = createProfile({
        entity: opts.entity,
        email: opts.email,
        intent: opts.intent,
        cage: opts.cage,
        wallet: opts.wallet,
        tierInterest: opts.tier as "seed" | "strategic" | "hardware-node" | undefined,
      });

      step(`Profile created for ${maskEmail(profile.email)}`);
      done("ACCOUNT CREATED");
      formatOutput(profile, flags.json);
    });

  account
    .command("login")
    .option("--device", "use device code flow")
    .description("PKCE / device code login (stub)")
    .action((opts: { device?: boolean }, cmd) => {
      const parent = cmd.parent?.parent?.opts() ?? {};
      const flags = parseGlobalFlags(parent);
      header("ACCOUNT", "prism");

      const profile = loadProfile();
      if (!profile) {
        formatOutput({ error: "no profile — run clrt account create first" }, flags.json);
        process.exit(1);
      }

      if (shouldDryRun(flags)) {
        formatOutput({ dryRun: true, method: opts.device ? "device-code" : "pkce" }, flags.json);
        return;
      }

      const session = {
        method: (opts.device ? "device-code" : "pkce") as "device-code" | "pkce",
        deviceCode: opts.device ? `CLRT-${Date.now().toString(36).toUpperCase()}` : undefined,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };
      saveSession(session);

      done("LOGIN INITIATED");
      formatOutput({ profile: { entity: profile.entity, correlationId: profile.correlationId }, session }, flags.json);
    });

  account
    .command("status")
    .description("Profile and session status")
    .action((_opts, cmd) => {
      const parent = cmd.parent?.parent?.opts() ?? {};
      const flags = parseGlobalFlags(parent);
      header("ACCOUNT", "prism");

      const profile = loadProfile();
      const session = loadSession();

      done("STATUS READY");
      formatOutput(
        {
          profile: profile
            ? { entity: profile.entity, email: maskEmail(profile.email), correlationId: profile.correlationId, investorStep: profile.investorStep }
            : null,
          session,
        },
        flags.json
      );
    });
}
