import type { SkillContext, SkillResult } from "./index.js";
export interface QuantumSkillMeta {
    id: string;
    slug: "mca" | "tsr" | "avr" | "ehl";
    name: string;
    tag: string;
}
export declare const QUANTUM_SKILLS: QuantumSkillMeta[];
export declare function runQuantumSkill(slug: QuantumSkillMeta["slug"], ctx?: SkillContext): Promise<SkillResult>;
export declare function listQuantumSkills(): QuantumSkillMeta[];
//# sourceMappingURL=quantum-skills.d.ts.map