export interface SkillManifestEntry {
    id: string;
    name: string;
    version: string;
    description: string;
    capital_aware: boolean;
}
export declare const MARKETPLACE_MANIFEST: SkillManifestEntry[];
export declare function listSkills(): SkillManifestEntry[];
export declare function getSkill(id: string): SkillManifestEntry | undefined;
//# sourceMappingURL=index.d.ts.map