#!/usr/bin/env node
import { Command } from "commander";
import { PrismHelix } from "@clrt/prism-helix";
import { registerPrism } from "./commands/prism.js";
import { registerHelix } from "./commands/helix.js";
import { registerSkill } from "./commands/skill.js";
import { header, step, done, theme } from "./theme.js";

const program = new Command();

program
  .name("clrt")
  .description("CLRTY OS — PRISM intelligence + HELIX execution")
  .version("1.0.0");

registerPrism(program);
registerHelix(program);
registerSkill(program);

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
    console.log(JSON.stringify({ chain_commit: result.chain_commit, execution: result.execution }, null, 2));
  });

program.parseAsync(process.argv).catch((err: Error) => {
  console.error(theme.risk(err.message));
  process.exit(1);
});
