#!/usr/bin/env node
/**
 * Example: full PRISM → HELIX pipeline
 * Run: node examples/pipeline.mjs
 */
import { PrismHelix } from "../packages/prism-helix/dist/index.js";

const pipeline = new PrismHelix({
  apiUrl: process.env.CLRTY_API_URL,
  apiKey: process.env.CLRTY_API_KEY,
});

const result = await pipeline.execute({
  intent: "optimize yield strategy",
  capital: 5000,
  from: "USDC",
  to: "SOL",
  amount: 5000,
});

console.log("\n--- Pipeline steps ---");
for (const step of result.steps) {
  console.log(`[${step.layer}] ${step.action}${step.detail ? `: ${step.detail}` : ""}`);
}

console.log("\n--- Result ---");
console.log("Chain commit:", result.chain_commit);
console.log("Execution:", JSON.stringify(result.execution, null, 2));
