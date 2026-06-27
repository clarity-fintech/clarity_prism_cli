import pc from "picocolors";

export const theme = {
  prism: (s: string) => pc.magenta(s),
  helix: (s: string) => pc.blue(s),
  risk: (s: string) => pc.red(s),
  success: (s: string) => pc.green(s),
  warn: (s: string) => pc.yellow(s),
  dim: (s: string) => pc.dim(s),
};

export function header(label: string, kind: "prism" | "helix"): void {
  const paint = kind === "prism" ? theme.prism : theme.helix;
  console.log(paint(`${label} ACTIVE`));
  console.log(theme.dim("━".repeat(22)));
}

export function step(msg: string): void {
  console.log(theme.dim(`→ ${msg}`));
}

export function done(msg: string): void {
  console.log(theme.success(msg));
}
