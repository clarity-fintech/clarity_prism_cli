#!/usr/bin/env node
import { Command } from "commander";
import { PrismHelix } from "@clrt/prism-helix";
import { defaultRegistry } from "@clrt/primitive-registry";
import { registerPrism } from "./commands/prism.js";
import { registerHelix } from "./commands/helix.js";
import { registerSkill } from "./commands/skill.js";
import { registerInit } from "./commands/init.js";
import { registerIdentity } from "./commands/identity.js";
import { registerCommons } from "./commands/commons.js";
import { registerAudit } from "./commands/audit.js";
import { registerAccount } from "./commands/account.js";
import { registerPartner } from "./commands/partner.js";
import { registerSettlement } from "./commands/settlement.js";
import { registerChain } from "./commands/chain.js";
import { registerExchange } from "./commands/exchange.js";
import { registerPack } from "./commands/pack.js";
import { registerWallet } from "./commands/wallet.js";
import { registerGate } from "./commands/gate.js";
import { registerLabs } from "./commands/labs.js";
import { header, step, done, theme } from "./theme.js";
import { CLRTY_RELEASE, CLRTY_MICRO, versionLabel } from "./version.js";

const program = new Command();

program
  .name("clrt")
  .description("CLRTY OS — PRISM intelligence + HELIX execution")
  .version(versionLabel(), "-V, --version", "show version (includes micro counter μ)")
  .option("--json", "structured JSON output")
  .option("--dry-run", "validate inputs; skip network writes");

registerPrism(program);
registerHelix(program);
registerSkill(program);
registerAccount(program);
registerPartner(program);
registerSettlement(program);
registerChain(program);
registerExchange(program);
registerPack(program);
registerWallet(program);
registerLabs(program);
registerGate(program);

const prismCmd = program.commands.find((c) => c.name() === "prism");
if (prismCmd) {
  registerInit(prismCmd);
  registerIdentity(prismCmd);
  registerCommons(prismCmd);
  registerAudit(prismCmd);
}

program
  .command("version")
  .description("Show release info and micro update counter")
  .action(() => {
    const parent = program.opts();
    const payload = {
      version: versionLabel(),
      semver: CLRTY_RELEASE,
      micro_counter: CLRTY_MICRO,
      primitives: defaultRegistry.list().length,
      chain_id: "clrty-1",
    };
    if (parent.json) {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      header("CLRTY PRISM CLI", "prism");
      console.log(theme.prism(`Release: ${versionLabel()} (${CLRTY_RELEASE.codename})`));
      console.log(theme.dim(`Micro counter: μ${CLRTY_MICRO} · ${CLRTY_RELEASE.date}`));
      for (const h of CLRTY_RELEASE.highlights) {
        step(`→ ${h}`);
      }
      done(`${defaultRegistry.list().length} primitives registered`);
    }
  });

program
  .command("registry")
  .option("--category <cat>", "filter by category")
  .description("List registered CLI primitives")
  .action((opts: { category?: string }) => {
    const parent = program.opts();
    const list = opts.category
      ? defaultRegistry.getByCategory(opts.category as never)
      : defaultRegistry.list();
    if (parent.json) {
      console.log(JSON.stringify(list, null, 2));
    } else {
      for (const p of list) {
        console.log(`${p.id} [${p.category}] ${p.command} — ${p.description}`);
      }
    }
  });

program
  .command("run")
  .argument("<intent>", "natural language intent")
  .option("--capital <n>", "capital", "5000")
  .description("Full PRISM → HELIX pipeline")
  .action(async (intent: string, opts: { capital: string }) => {
    console.log(theme.prism("PRISM: interpreting intent"));
    console.log(theme.prism("PRISM: forecasting outcomes"));
    console.log(theme.helix("HELIX: simulating execution paths"));
    console.log(theme.helix("HELIX: selecting optimal route"));
    console.log(theme.success("CHAIN: executing transaction"));
    console.log("");

    const pipeline = new PrismHelix();
    const result = await pipeline.execute({
      intent,
      capital: Number(opts.capital),
    });

    header("CLRTY PIPELINE", "prism");
    for (const s of result.steps) {
      const paint = s.layer === "PRISM" ? theme.prism : s.layer === "HELIX" ? theme.helix : theme.success;
      step(paint(`[${s.layer}] ${s.action}${s.detail ? `: ${s.detail}` : ""}`));
    }
    done("PIPELINE COMPLETE");
    const parent = program.opts();
    const payload = { chain_commit: result.chain_commit, execution: result.execution };
    if (parent.json) {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      console.log(JSON.stringify(payload, null, 2));
    }
  });

program.parseAsync(process.argv).catch((err: Error) => {
  console.error(theme.risk(err.message));
  process.exit(1);
});
