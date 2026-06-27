import { Command } from "commander";
import { HelixClient } from "@clrt/helix-core";
import { scanLiquidity } from "@clrt/helix-routing";
import { applyProtection } from "@clrt/helix-protect";
import { header, step, done, theme } from "../theme.js";

export function registerHelix(program: Command): void {
  const helix = program.command("helix").description("HELIX execution layer");

  helix
    .command("status")
    .description("HELIX kernel status")
    .action(async () => {
      header("HELIX EXECUTION ENGINE", "helix");
      const client = new HelixClient();
      const status = await client.status();
      done("STATUS");
      console.log(JSON.stringify(status, null, 2));
    });

  const execute = helix.command("execute").description("Execute optimized trade");
  execute
    .command("swap")
    .requiredOption("--from <asset>", "source asset")
    .requiredOption("--to <asset>", "destination asset")
    .requiredOption("--amount <n>", "amount")
    .description("Execute swap")
    .action((opts: { from: string; to: string; amount: string }) => {
      header("HELIX EXECUTION ENGINE", "helix");
      step("Simulating routes...");
      step("Checking liquidity...");
      step("Applying MEV protection...");
      applyProtection({ mevShield: true, privateLane: true });
      const client = new HelixClient();
      const result = client.executeSwap({
        from: opts.from,
        to: opts.to,
        amount: Number(opts.amount),
        optimize: true,
      });
      console.log("\nBest route selected:");
      for (const r of result.routes) step(r);
      console.log("");
      done("EXECUTION COMPLETE");
      console.log(`Slippage: ${result.slippage_pct}%`);
      console.log(`Savings: ${result.savings_pct}%`);
    });

  const simulate = helix.command("simulate").description("Simulation mode");
  simulate
    .command("swap")
    .requiredOption("--amount <n>", "amount")
    .option("--from <asset>", "from", "SOL")
    .option("--to <asset>", "to", "USDC")
    .action((opts: { from: string; to: string; amount: string }) => {
      header("HELIX EXECUTION ENGINE", "helix");
      const client = new HelixClient();
      const result = client.simulateSwap({
        from: opts.from,
        to: opts.to,
        amount: Number(opts.amount),
      });
      done("SIMULATION COMPLETE");
      console.log(JSON.stringify(result, null, 2));
    });

  const liquidity = helix.command("liquidity").description("Liquidity tools");
  liquidity
    .command("scan")
    .argument("<pair>", "pair e.g. SOL/USDC")
    .action((pair: string) => {
      header("HELIX EXECUTION ENGINE", "helix");
      const scan = scanLiquidity(pair);
      step(`Depth: $${scan.depth_usd.toLocaleString()}`);
      for (const v of scan.venues) {
        step(`${v.name}: $${Math.round(v.depth_usd).toLocaleString()} (${v.slippage_bps} bps)`);
      }
      done(`Best route: ${scan.best_route}`);
    });
}
