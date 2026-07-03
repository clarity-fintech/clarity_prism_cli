export declare enum PrimitiveCategory {
    System = "System",
    Identity = "Identity",
    Commons = "Commons",
    Registry = "Registry",
    Execution = "Execution",
    Governance = "Governance"
}
export interface Primitive {
    id: string;
    category: PrimitiveCategory;
    command: string;
    description: string;
    version: string;
    permissions?: string[];
    cid?: string;
}
export declare class PrimitiveRegistry {
    private primitives;
    register(p: Primitive): void;
    list(category?: PrimitiveCategory): Primitive[];
    resolve(command: string): Primitive | undefined;
    getByCategory(category: PrimitiveCategory): Primitive[];
}
export declare const defaultRegistry: PrimitiveRegistry;
//# sourceMappingURL=index.d.ts.map