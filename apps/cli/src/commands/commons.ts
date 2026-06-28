import { Command } from "commander";
import { defaultCommonsStore } from "@clrt/commons-cas";
import { formatOutput, parseGlobalFlags, shouldDryRun } from "../middleware/json-dry-run.js";
import { header, done } from "../theme.js";

export function registerCommons(prism: Command): void {
  const commons = prism.command("commons").description("PRISM Commons CAS");

  commons
    .command("put")
    .argument("<file>", "file to store")
    .option("--topic <topic>", "discovery topic")
    .description("Upload asset to local CAS")
    .action((file: string, opts: { topic?: string }, cmd) => {
      const parent = cmd.parent?.parent?.parent?.opts() ?? {};
      const flags = parseGlobalFlags(parent);
      header("PRISM COMMONS", "prism");

      if (shouldDryRun(flags)) {
        formatOutput({ dryRun: true, action: "put", file, topic: opts.topic }, flags.json);
        return;
      }

      const asset = defaultCommonsStore.put(file, opts.topic);
      done("PUT COMPLETE");
      formatOutput(asset, flags.json);
    });

  commons
    .command("get")
    .argument("<cid>", "content id")
    .description("Fetch CAS asset metadata")
    .action((cid: string, _opts, cmd) => {
      const parent = cmd.parent?.parent?.parent?.opts() ?? {};
      const flags = parseGlobalFlags(parent);
      header("PRISM COMMONS", "prism");
      const asset = defaultCommonsStore.get(cid);
      done(asset ? "GET COMPLETE" : "NOT FOUND");
      formatOutput(asset ?? { error: "not found", cid }, flags.json);
    });

  commons
    .command("discover")
    .argument("<topic>", "search topic")
    .description("Discover assets by topic")
    .action((topic: string, _opts, cmd) => {
      const parent = cmd.parent?.parent?.parent?.opts() ?? {};
      const flags = parseGlobalFlags(parent);
      header("PRISM COMMONS", "prism");
      const assets = defaultCommonsStore.discover(topic);
      done("DISCOVER COMPLETE");
      formatOutput({ topic, count: assets.length, assets }, flags.json);
    });

  commons
    .command("peers")
    .description("List commons mesh peers (stub)")
    .action((_opts, cmd) => {
      const parent = cmd.parent?.parent?.parent?.opts() ?? {};
      const flags = parseGlobalFlags(parent);
      header("PRISM COMMONS", "prism");
      const peers = defaultCommonsStore.peers();
      done("PEERS READY");
      formatOutput({ peers }, flags.json);
    });
}
