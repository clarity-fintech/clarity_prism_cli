/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRISM_TERMINAL_PUBLIC?: string;
  readonly VITE_CLRTY_PRISM_ADMIN_PASS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
