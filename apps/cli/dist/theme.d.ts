export declare const theme: {
    prism: (s: string) => string;
    helix: (s: string) => string;
    risk: (s: string) => string;
    success: (s: string) => string;
    warn: (s: string) => string;
    dim: (s: string) => string;
};
export declare function header(label: string, kind: "prism" | "helix"): void;
export declare function step(msg: string): void;
export declare function done(msg: string): void;
//# sourceMappingURL=theme.d.ts.map