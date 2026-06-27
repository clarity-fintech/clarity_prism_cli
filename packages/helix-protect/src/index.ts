export interface ProtectOptions {
  privateLane?: boolean;
  encryptPayload?: boolean;
  mevShield?: boolean;
}

export interface ProtectedExecution {
  lane: string;
  mev_shield: boolean;
  front_run_resistance: boolean;
  encryption: string;
}

export function applyProtection(opts: ProtectOptions = {}): ProtectedExecution {
  return {
    lane: opts.privateLane ? "helix_private_v1" : "helix_standard",
    mev_shield: opts.mevShield ?? true,
    front_run_resistance: true,
    encryption: opts.encryptPayload ? "aes-gcm-session" : "none",
  };
}
