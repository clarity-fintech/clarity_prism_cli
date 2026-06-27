import { Command } from "commander";
import { PrismClient } from "@clrt/prism-sdk";
import { validateClaim, traceLog, computeStats } from "@clrt/prism-core";
import { header, step, done, theme } from "../theme.js";

export function registerPrism(program: Command): void {
  const prism = program.command("prism").description("PRISM intelligence layer");

  prism
    .command("query")
    .argument("<text>", "query or intent text")
    .description("Intent-aware query")
    .action(async (text: string) => {
      header("PRISM ENGINE", "prism");
      const client = new PrismClient();
      step("Filtering market states...");
      step("Predicting liquidity gaps...");
      step("Optimizing query path...");
      const result = await client.query({
        intent: text.includes(" ") ? text.split(" ")[0]! : text,
        query: text,
      });
      console.log(`Intent: ${result.intent}`);
      console.log(`Confidence: ${result.confidence}%`);
      console.log("");
      done("RESULT READY");
      console.log(JSON.stringify(result, null, 2));
    });

  prism
    .command("predict")
    .option("--capital <n>", "capital amount", "1000")
    .description("Predict execution path from capital context")
    .action((opts: { capital: string }) => {
      header("PRISM ENGINE", "prism");
      const capital = Number(opts.capital);
      const client = new PrismClient();
      const pred = client.predict(capital);
      step(`Capital context: ${capital}`);
      step("Running PoR forecast model...");
      done("PREDICTION READY");
      console.log(JSON.stringify(pred, null, 2));
    });

  const cacheCmd = prism.command("cache").description("Cache intelligence");
  cacheCmd
    .command("status")
    .description("Cache inspection")
    .action(() => {
      header("PRISM ENGINE", "prism");
      const client = new PrismClient();
      done("CACHE STATUS");
      console.log(JSON.stringify(client.cache.status(), null, 2));
    });

  prism
    .command("validate")
    .option("--claim <text>", "trader claim")
    .option("--intent <text>", "session intent", "arbitrage_scan")
    .option("--capital <n>", "capital", "1000")
    .description("Adversarial validation gate")
    .action((opts: { claim?: string; intent: string; capital: string }) => {
      header("PRISM ENGINE", "prism");
      const result = validateClaim({
        claim: opts.claim ?? "Market opportunity within risk bounds",
        intent: opts.intent,
        capital: Number(opts.capital),
      });
      for (const line of result.reasoning) {
        if (line.includes("FAILED")) console.log(theme.risk(line));
        else step(line);
      }
      done(result.passed ? "VALIDATION PASSED" : "VALIDATION FAILED");
      console.log(
        JSON.stringify({ passed: result.passed, hash: result.event.content_hash }, null, 2)
      );
    });

  prism
    .command("trace")
    .option("-n <num>", "limit", "20")
    .description("Mini-git reasoning log")
    .action((opts: { n: string }) => {
      header("PRISM ENGINE", "prism");
      const events = traceLog(Number(opts.n));
      for (const e of events) {
        console.log(
          `${theme.dim(e.timestamp)} ${theme.prism(e.type)} ${e.intent ?? ""} ${e.content_hash.slice(0, 8)}`
        );
      }
    });

  prism
    .command("stats")
    .description("Network and agent metrics")
    .action(() => {
      header("PRISM ENGINE", "prism");
      const stats = computeStats();
      done("STATS READY");
      console.log(JSON.stringify(stats, null, 2));
    });
}
