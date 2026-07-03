export interface SkillContext {
    capital?: number;
    maxExposure?: number;
    [key: string]: unknown;
}
export interface SkillResult {
    skill: string;
    status: "ok" | "blocked" | "error";
    output: Record<string, unknown>;
}
export type SkillHandler = (ctx: SkillContext) => Promise<SkillResult>;
export declare class SkillAgent {
    install(name: string): boolean;
    isInstalled(name: string): boolean;
    locks(): {
        active: string | null;
        installed: string[];
    };
    use(name: string, ctx?: SkillContext): Promise<SkillResult>;
}
/** Alias map for CLI short names */
export declare function resolveSkillName(short: string): string;
export declare const BUILTIN_SKILLS: string[];
export { requestPartnerAccess, getPartnerAccessStatus, type PartnerAccessRequest, type PartnerAccessResult, type PartnerAccessStatus, } from "./partner-access.js";
export { runQuantumSkill, listQuantumSkills, QUANTUM_SKILLS, type QuantumSkillMeta, } from "./quantum-skills.js";
//# sourceMappingURL=index.d.ts.map