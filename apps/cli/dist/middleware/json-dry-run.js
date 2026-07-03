export function parseGlobalFlags(opts) {
    return {
        json: Boolean(opts.json),
        dryRun: Boolean(opts.dryRun),
    };
}
export function shouldDryRun(flags) {
    return flags.dryRun;
}
export function formatOutput(data, json) {
    if (json) {
        console.log(JSON.stringify(data, null, 2));
        return;
    }
    if (typeof data === "string") {
        console.log(data);
        return;
    }
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
        console.log(data.message);
        return;
    }
    console.log(JSON.stringify(data, null, 2));
}
//# sourceMappingURL=json-dry-run.js.map