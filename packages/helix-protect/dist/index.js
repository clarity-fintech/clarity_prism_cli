export function applyProtection(opts = {}) {
    return {
        lane: opts.privateLane ? "helix_private_v1" : "helix_standard",
        mev_shield: opts.mevShield ?? true,
        front_run_resistance: true,
        encryption: opts.encryptPayload ? "aes-gcm-session" : "none",
    };
}
//# sourceMappingURL=index.js.map