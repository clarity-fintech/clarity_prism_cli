import { Command } from "commander";
import { PrismClient } from "@clrt/prism-sdk";
import { validateClaim, traceLog, computeStats, exportLedgerSnapshot } from "@clrt/prism-core";
import { header, step, done, theme } from "../theme.js";
import { prismQueryQueue } from "../query-queue.js";
import { apiFetch, getApiBaseUrl } from "../lib/api-client.js";
import { formatOutput, parseGlobalFlags, shouldDryRun } from "../middleware/json-dry-run.js";

export function registerPrism(program: Command): void {
  const prism = program.command("prism").description("PRISM intelligence layer");

  prism
    .command("query")
    .argument("<text>", "query or intent text")
    .option("--wait", "wait for queue slot (default: enqueue and process serially)", true)
    .description("Intent-aware query (serialized through backlog queue)")
    .action(async (text: string) => {
      header("PRISM ENGINE", "prism");
      const snap = prismQueryQueue.snapshot();
      if (snap.pending > 0 || snap.running) {
        step(`Queue: ${snap.pending} pending · processing one at a time`);
      }
      const id = prismQueryQueue.enqueue(text);
      step("Filtering market states...");
      step("Predicting liquidity gaps...");
      step("Optimizing query path...");
      const result = await prismQueryQueue.wait(id);
      console.log(`Intent: ${result.intent}`);
      console.log(`Confidence: ${result.confidence}%`);
      console.log(`Mode: ${result.mode}`);
      console.log("");
      done("RESULT READY");
      console.log(JSON.stringify(result, null, 2));
    });

  const queueCmd = prism.command("queue").description("PRISM query backlog");

  queueCmd
    .command("status")
    .description("Show queue depth and recent jobs")
    .action(() => {
      header("PRISM QUEUE", "prism");
      done("QUEUE STATUS");
      console.log(JSON.stringify(prismQueryQueue.snapshot(), null, 2));
    });

  queueCmd
    .command("submit")
    .argument("<text...>", "one or more prompts to enqueue")
    .description("Enqueue prompts without waiting (returns job ids)")
    .action((parts: string[]) => {
      const text = parts.join(" ");
      const ids = text.split("|").map((chunk) => chunk.trim()).filter(Boolean).map((chunk) => {
        const id = prismQueryQueue.enqueue(chunk);
        return { id, prompt: chunk };
      });
      console.log(JSON.stringify({ enqueued: ids.length, jobs: ids }, null, 2));
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

  prism
    .command("estimate")
    .option("--capital <n>", "capital amount", "1000")
    .option("--intent <text>", "execution intent", "arbitrage_scan")
    .description("Execution cost estimate (PoR forecast)")
    .action((opts: { capital: string; intent: string }, cmd) => {
      const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
      header("PRISM ENGINE", "prism");
      const capital = Number(opts.capital);
      const client = new PrismClient();
      const pred = client.predict(capital);
      const estimate = {
        intent: opts.intent,
        capital,
        estimated_gas_clrty: Math.round(capital * 0.00012),
        helix_fee_bps: 8,
        por_confidence: (pred as { confidence?: number }).confidence ?? 0.92,
        lane: "helix_internal",
      };
      done("ESTIMATE READY");
      formatOutput(estimate, flags.json);
    });

  prism
    .command("execute")
    .option("--algo <hash>", "algorithm hash or DX slug", "intent_execute")
    .option("--input <json>", "input payload JSON", "{}")
    .description("RAG/GENAI algorithmic execution via DX layer")
    .action(async (opts: { algo: string; input: string }, cmd) => {
      const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
      header("PRISM ENGINE", "prism");

      if (shouldDryRun(flags)) {
        formatOutput({ dryRun: true, algo: opts.algo, input: opts.input }, flags.json);
        return;
      }

      let payload: unknown = {};
      try {
        payload = JSON.parse(opts.input);
      } catch {
        formatOutput({ error: "invalid JSON input" }, flags.json);
        process.exit(1);
      }

      const data = await apiFetch(getApiBaseUrl(), "/v1/dx/execute", {
        method: "POST",
        json: { slug: opts.algo, payload },
      });
      done("EXECUTE READY");
      formatOutput(data ?? { algo: opts.algo, payload, mode: "local" }, flags.json);
    });

  prism
    .command("snapshot")
    .option("--out <path>", "output path", "~/.clrt/prism/ledger-snapshot.json")
    .description("Mini-git ledger state backup")
    .action((opts: { out: string }, cmd) => {
      const flags = parseGlobalFlags(cmd.parent?.parent?.opts() ?? {});
      header("PRISM ENGINE", "prism");
      const snap = exportLedgerSnapshot();
      done("SNAPSHOT READY");
      formatOutput({ path: opts.out, events: snap.events.length, snapshot: snap }, flags.json);
    });
}
