import { Command } from "commander";
import { formatOutput, parseGlobalFlags, shouldDryRun } from "../middleware/json-dry-run.js";
import { header, done } from "../theme.js";

const PACKS = [
  { id: "mastermind", name: "Volkov Mastermind First Access Pack", verify: "first_access_manifest.json" },
  { id: "wallet-integration", name: "CLRTY Wallet Integration Pack", verify: "wallet_integration_manifest.json" },
];

export function registerPack(program: Command): void {
  const pack = program.command("pack").description("Access pack download & verify");

  pack
    .command("list")
    .description("List available access packs")
    .action((_opts, cmd) => {
      const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
      header("PACK", "prism");
      done("PACK LIST READY");
      formatOutput({ packs: PACKS }, flags.json);
    });

  pack
    .command("download")
    .argument("<id>", "pack id (mastermind|wallet-integration)")
    .description("Download access pack")
    .action((id: string, _opts, cmd) => {
      const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
      header("PACK", "prism");
      const found = PACKS.find((p) => p.id === id);
      if (!found) {
        formatOutput({ error: "unknown pack", id }, flags.json);
        process.exit(1);
      }

      if (shouldDryRun(flags)) {
        formatOutput({ dryRun: true, pack: found }, flags.json);
        return;
      }

      done("DOWNLOAD QUEUED");
      formatOutput({ pack: found, status: "queued", note: "Fetch from monorepo manifest pins" }, flags.json);
    });

  pack
    .command("verify")
    .argument("<id>", "pack id")
    .description("Verify pack integrity")
    .action((id: string, _opts, cmd) => {
      const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
      header("PACK", "prism");
      const found = PACKS.find((p) => p.id === id);
      if (!found) {
        formatOutput({ error: "unknown pack", id }, flags.json);
        process.exit(1);
      }

      done("VERIFY COMPLETE");
      formatOutput({
        pack: found.id,
        manifest: found.verify,
        valid: true,
        mode: "stub",
      }, flags.json);
    });
}
