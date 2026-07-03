import { defaultCommonsStore } from "@clrt/commons-cas";
import { loadProfile } from "@clrt/account-profile";
import { apiFetch, getApiBaseUrl } from "../lib/api-client.js";
import { formatOutput, parseGlobalFlags, shouldDryRun } from "../middleware/json-dry-run.js";
import { header, done } from "../theme.js";
const commonsApi = {
    postTransfer: (body) => apiFetch(getApiBaseUrl(), "/v1/commons/transfer", { method: "POST", json: body }),
    getInbox: (username) => apiFetch(getApiBaseUrl(), `/v1/commons/inbox/${encodeURIComponent(username)}`),
    postReceive: (body) => apiFetch(getApiBaseUrl(), "/v1/commons/receive", { method: "POST", json: body }),
};
export function registerCommons(prism) {
    const commons = prism.command("commons").description("PRISM Commons CAS + username P2P");
    commons
        .command("put")
        .argument("<file>", "file to store")
        .option("--topic <topic>", "discovery topic")
        .description("Upload asset to local CAS")
        .action((file, opts, cmd) => {
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
        .command("send")
        .requiredOption("--to <username>", "recipient username")
        .requiredOption("--file <path>", "file to send")
        .description("Send file to username — use PRISM terminal Commons panel (TERMINAL USE ONLY)")
        .action(async (_opts, cmd) => {
        const parent = cmd.parent?.parent?.parent?.opts() ?? {};
        const flags = parseGlobalFlags(parent);
        header("PRISM COMMONS", "prism");
        formatOutput({
            error: "TERMINAL USE ONLY",
            message: "File send, cache, and library are only available in the PRISM terminal Commons panel.",
        }, flags.json);
        process.exit(1);
    });
    commons
        .command("inbox")
        .description("List inbound transfers for your username")
        .action(async (_opts, cmd) => {
        const parent = cmd.parent?.parent?.parent?.opts() ?? {};
        const flags = parseGlobalFlags(parent);
        header("PRISM COMMONS", "prism");
        const profile = loadProfile();
        if (!profile?.username) {
            formatOutput({ error: "account required" }, flags.json);
            process.exit(1);
        }
        const data = await commonsApi.getInbox(profile.username);
        done("INBOX READY");
        formatOutput(data ?? { username: profile.username, transfers: [], mode: "local-outbox-only" }, flags.json);
    });
    commons
        .command("receive")
        .argument("<transfer-id>", "transfer id from inbox")
        .description("Mark transfer received")
        .action(async (transferId, _opts, cmd) => {
        const parent = cmd.parent?.parent?.parent?.opts() ?? {};
        const flags = parseGlobalFlags(parent);
        header("PRISM COMMONS", "prism");
        const profile = loadProfile();
        if (!profile?.username) {
            formatOutput({ error: "account required" }, flags.json);
            process.exit(1);
        }
        if (shouldDryRun(flags)) {
            formatOutput({ dryRun: true, transferId }, flags.json);
            return;
        }
        const data = await commonsApi.postReceive({ transfer_id: transferId, username: profile.username });
        done("RECEIVED");
        formatOutput(data ?? { transferId, status: "local-stub" }, flags.json);
    });
    commons
        .command("get")
        .argument("<cid>", "content id")
        .description("Fetch CAS asset metadata")
        .action((cid, _opts, cmd) => {
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
        .action((topic, _opts, cmd) => {
        const parent = cmd.parent?.parent?.parent?.opts() ?? {};
        const flags = parseGlobalFlags(parent);
        header("PRISM COMMONS", "prism");
        const assets = defaultCommonsStore.discover(topic);
        done("DISCOVER COMPLETE");
        formatOutput({ topic, count: assets.length, assets }, flags.json);
    });
    commons
        .command("peers")
        .description("List commons mesh peers")
        .action((_opts, cmd) => {
        const parent = cmd.parent?.parent?.parent?.opts() ?? {};
        const flags = parseGlobalFlags(parent);
        header("PRISM COMMONS", "prism");
        const peers = defaultCommonsStore.peers();
        done("PEERS READY");
        formatOutput({ peers }, flags.json);
    });
}
//# sourceMappingURL=commons.js.map