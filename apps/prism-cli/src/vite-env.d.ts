/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRISM_TERMINAL_PUBLIC?: string;
  readonly VITE_PRISM_LOCAL?: string;
  readonly VITE_CLRTY_PRISM_ADMIN_PASS?: string;
  readonly VITE_CLRTY_GATE_ACCESS_DIGEST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
