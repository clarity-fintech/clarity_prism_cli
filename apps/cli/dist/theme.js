import pc from "picocolors";
export const theme = {
    prism: (s) => pc.magenta(s),
    helix: (s) => pc.blue(s),
    risk: (s) => pc.red(s),
    success: (s) => pc.green(s),
    warn: (s) => pc.yellow(s),
    dim: (s) => pc.dim(s),
};
export function header(label, kind) {
    const paint = kind === "prism" ? theme.prism : theme.helix;
    console.log(paint(`${label} ACTIVE`));
    console.log(theme.dim("━".repeat(22)));
}
export function step(msg) {
    console.log(theme.dim(`→ ${msg}`));
}
export function done(msg) {
    console.log(theme.success(msg));
}
//# sourceMappingURL=theme.js.map