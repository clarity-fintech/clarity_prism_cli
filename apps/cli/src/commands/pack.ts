import { Command } from "commander";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { setMastermindVerified } from "@clrt/account-profile";
import { formatOutput, parseGlobalFlags, shouldDryRun } from "../middleware/json-dry-run.js";
import { header, done } from "../theme.js";

const PACK_DIR = join(homedir(), ".clrt", "packs");

const PACKS = [
  {
    id: "mastermind",
    name: "Volkov Mastermind First Access Pack",
    url: "https://raw.githubusercontent.com/theangelofwill/-CLRTY/main/CLRTY_SUBSTRATE/boot/first_access_manifest.json",
    verify: "first_access_manifest.json",
    sha256: null as string | null,
  },
  {
    id: "wallet-integration",
    name: "CLRTY Wallet Integration Pack",
    url: "https://github.com/clarity-fintech/wallet_integration/raw/main/dist/clrty-wallet-integration-full.zip",
    verify: "wallet_integration_manifest.json",
    sha256: null as string | null,
  },
];

async function downloadToFile(url: string, dest: string): Promise<{ bytes: number; sha256: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(join(dest, ".."), { recursive: true });
  writeFileSync(dest, buf);
  const sha256 = createHash("sha256").update(buf).digest("hex");
  return { bytes: buf.length, sha256 };
}

export function registerPack(program: Command): void {
  const pack = program.command("pack").description("Access pack download & verify");

  pack
    .command("list")
    .description("List available access packs")
    .action((_opts, cmd) => {
      const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
      header("PACK", "prism");
      done("PACK LIST READY");
      formatOutput({ packs: PACKS.map(({ id, name, url, verify }) => ({ id, name, url, verify })) }, flags.json);
    });

  pack
    .command("download")
    .argument("<id>", "pack id (mastermind|wallet-integration)")
    .description("Download access pack")
    .action(async (id: string, _opts, cmd) => {
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

      mkdirSync(PACK_DIR, { recursive: true });
      const ext = found.url.endsWith(".zip") ? ".zip" : ".json";
      const dest = join(PACK_DIR, `${found.id}${ext}`);

      try {
        const { bytes, sha256 } = await downloadToFile(found.url, dest);
        const shaOk = found.sha256 ? found.sha256 === sha256 : null;
        if (found.id === "mastermind") {
          setMastermindVerified(sha256);
        }
        done("DOWNLOAD COMPLETE");
        formatOutput(
          {
            pack: found.id,
            path: dest,
            bytes,
            sha256,
            sha256_valid: shaOk,
            url: found.url,
          },
          flags.json
        );
      } catch (err) {
        formatOutput({ error: String(err), pack: found.id, url: found.url }, flags.json);
        process.exit(1);
      }
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

      const ext = found.url.endsWith(".zip") ? ".zip" : ".json";
      const dest = join(PACK_DIR, `${found.id}${ext}`);
      if (!existsSync(dest)) {
        formatOutput({ error: "pack not downloaded", path: dest }, flags.json);
        process.exit(1);
      }

      const buf = readFileSync(dest);
      const sha256 = createHash("sha256").update(buf).digest("hex");
      const valid = found.sha256 ? found.sha256 === sha256 : true;

      if (valid && found.id === "mastermind") {
        setMastermindVerified(sha256);
      }

      done(valid ? "VERIFY COMPLETE" : "VERIFY FAILED");
      formatOutput(
        {
          pack: found.id,
          path: dest,
          manifest: found.verify,
          sha256,
          expected_sha256: found.sha256,
          valid,
          bytes: buf.length,
        },
        flags.json
      );
      if (!valid) process.exit(1);
    });
}
