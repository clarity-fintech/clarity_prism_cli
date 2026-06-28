export interface GlobalFlags {
  json: boolean;
  dryRun: boolean;
}

export function parseGlobalFlags(opts: { json?: boolean; dryRun?: boolean }): GlobalFlags {
  return {
    json: Boolean(opts.json),
    dryRun: Boolean(opts.dryRun),
  };
}

export function shouldDryRun(flags: GlobalFlags): boolean {
  return flags.dryRun;
}

export function formatOutput(data: unknown, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  if (typeof data === "string") {
    console.log(data);
    return;
  }
  if (data && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string") {
    console.log((data as { message: string }).message);
    return;
  }
  console.log(JSON.stringify(data, null, 2));
}
