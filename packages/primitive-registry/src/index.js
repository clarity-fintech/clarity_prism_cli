export var PrimitiveCategory;
(function (PrimitiveCategory) {
    PrimitiveCategory["System"] = "System";
    PrimitiveCategory["Identity"] = "Identity";
    PrimitiveCategory["Commons"] = "Commons";
    PrimitiveCategory["Registry"] = "Registry";
    PrimitiveCategory["Execution"] = "Execution";
    PrimitiveCategory["Governance"] = "Governance";
})(PrimitiveCategory || (PrimitiveCategory = {}));
export class PrimitiveRegistry {
    primitives = new Map();
    register(p) {
        this.primitives.set(p.command, p);
    }
    list(category) {
        const all = [...this.primitives.values()];
        return category ? all.filter((p) => p.category === category) : all;
    }
    resolve(command) {
        return this.primitives.get(command);
    }
    getByCategory(category) {
        return this.list(category);
    }
}
function seedRegistry(reg) {
    const entries = [
        { id: "SYS-01", category: PrimitiveCategory.System, command: "prism init", description: "Seed local node config" },
        { id: "SYS-02", category: PrimitiveCategory.System, command: "prism sync", description: "Sync repo manifest" },
        { id: "ID-01", category: PrimitiveCategory.Identity, command: "prism identity", description: "CAGE/DUNS identity" },
        { id: "ID-02", category: PrimitiveCategory.Identity, command: "account create", description: "Passwordless profile" },
        { id: "ID-03", category: PrimitiveCategory.Identity, command: "account login", description: "PKCE / device code" },
        { id: "ID-04", category: PrimitiveCategory.Identity, command: "account status", description: "Profile + session status" },
        { id: "CM-01", category: PrimitiveCategory.Commons, command: "prism commons get", description: "Fetch CAS asset" },
        { id: "CM-02", category: PrimitiveCategory.Commons, command: "prism commons put", description: "Upload CAS asset" },
        { id: "CM-03", category: PrimitiveCategory.Commons, command: "prism commons discover", description: "GHT search" },
        { id: "CM-04", category: PrimitiveCategory.Commons, command: "prism commons peers", description: "List commons peers" },
        { id: "RG-01", category: PrimitiveCategory.Registry, command: "skill run", description: "Execute skill primitive" },
        { id: "RG-02", category: PrimitiveCategory.Registry, command: "skill list", description: "List installed skills" },
        { id: "EX-01", category: PrimitiveCategory.Execution, command: "prism query", description: "Intent-aware query" },
        { id: "EX-02", category: PrimitiveCategory.Execution, command: "helix execute", description: "HELIX execution" },
        { id: "EX-03", category: PrimitiveCategory.Execution, command: "chain status", description: "clrty-l1 status" },
        { id: "EX-04", category: PrimitiveCategory.Execution, command: "chain sets", description: "Set tier lookup" },
        { id: "EX-05", category: PrimitiveCategory.Execution, command: "chain indexer", description: "L1 indexer snapshot" },
        { id: "EX-06", category: PrimitiveCategory.Execution, command: "chain dx", description: "DX primitives catalog" },
        { id: "EX-07", category: PrimitiveCategory.Execution, command: "chain simulate", description: "Sim event replay" },
        { id: "EX-08", category: PrimitiveCategory.Execution, command: "chain devnet", description: "Local devnet status" },
        { id: "EX-09", category: PrimitiveCategory.Execution, command: "exchange list", description: "List exchange integrations" },
        { id: "EX-10", category: PrimitiveCategory.Execution, command: "exchange status", description: "Exchange probe status" },
        { id: "EX-11", category: PrimitiveCategory.Execution, command: "exchange test", description: "Exchange connectivity test" },
        { id: "EX-12", category: PrimitiveCategory.Execution, command: "exchange qa", description: "Exchange algo QA" },
        { id: "EX-13", category: PrimitiveCategory.Execution, command: "run", description: "PRISM → HELIX → CHAIN" },
        { id: "GV-01", category: PrimitiveCategory.Governance, command: "prism audit", description: "Compliance audit export" },
        { id: "GV-02", category: PrimitiveCategory.Governance, command: "partner request-access", description: "Early access request" },
        { id: "GV-03", category: PrimitiveCategory.Governance, command: "partner status", description: "Partner access status" },
        { id: "GV-04", category: PrimitiveCategory.Governance, command: "settlement instructions", description: "Genesis instructions" },
        { id: "GV-05", category: PrimitiveCategory.Governance, command: "settlement register", description: "Wallet registration" },
        { id: "GV-06", category: PrimitiveCategory.Governance, command: "settlement preview", description: "Allocation preview" },
        { id: "GV-07", category: PrimitiveCategory.Governance, command: "settlement confirm-deposit", description: "Genesis deposit confirm" },
        { id: "GV-08", category: PrimitiveCategory.Governance, command: "settlement status", description: "Wallet compliance status" },
        { id: "GV-09", category: PrimitiveCategory.Governance, command: "pack list", description: "List access packs" },
        { id: "GV-10", category: PrimitiveCategory.Governance, command: "pack download", description: "Download access pack" },
        { id: "GV-11", category: PrimitiveCategory.Governance, command: "pack verify", description: "Verify pack integrity" },
    ];
    for (const e of entries) {
        reg.register({ ...e, version: "1.0.0" });
    }
}
export const defaultRegistry = new PrimitiveRegistry();
seedRegistry(defaultRegistry);
//# sourceMappingURL=index.js.map