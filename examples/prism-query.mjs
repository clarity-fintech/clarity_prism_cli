#!/usr/bin/env node
/**
 * Example: PRISM intent query + metrics
 * Run: node examples/prism-query.mjs
 */
import { PrismClient } from "../packages/prism-sdk/dist/index.js";

const prism = new PrismClient({
  apiUrl: process.env.CLRTY_API_URL,
  apiKey: process.env.CLRTY_API_KEY,
  network: "mainnet",
});

const result = await prism.query({
  intent: "portfolio_state",
  query: "portfolio_state wallet analysis",
  context: { capital: 10000, includeDeFi: true },
});

console.log("Intent:", result.intent);
console.log("Confidence:", result.confidence + "%");
console.log("PoR:", result.proof_of_relevance);
console.log("Routes:", result.suggested_routes.join(", "));
console.log("Mode:", result.mode);

const metrics = await prism.metrics();
console.log("\nMetrics:", JSON.stringify(metrics, null, 2));
