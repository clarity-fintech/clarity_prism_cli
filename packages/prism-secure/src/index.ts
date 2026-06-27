import { createHash, randomBytes } from "node:crypto";

export interface SecureQueryWrap<T> {
  payload: T;
  obfuscated_intent: string;
  enclave_lane: string;
  mev_shield: boolean;
}

export function wrapPrivateQuery<T extends Record<string, unknown>>(
  payload: T
): SecureQueryWrap<T> {
  const salt = randomBytes(8).toString("hex");
  const obfuscated = createHash("sha256")
    .update(JSON.stringify(payload) + salt)
    .digest("hex")
    .slice(0, 16);
  return {
    payload,
    obfuscated_intent: `enc-${obfuscated}`,
    enclave_lane: "secure_rpc_v1",
    mev_shield: true,
  };
}

export function strategyObfuscation(strategy: string): string {
  return createHash("sha256").update(strategy).digest("hex").slice(0, 24);
}
