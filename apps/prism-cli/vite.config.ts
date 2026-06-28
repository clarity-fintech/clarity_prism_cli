import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@clrt/prism-core": path.resolve(__dirname, "../../packages/prism-core/src/intent-engine.ts"),
      "@clrt/prism-models": path.resolve(__dirname, "../../packages/prism-models/src/index.ts"),
    },
  },
  server: { port: 5174, strictPort: false },
  build: { outDir: "dist", emptyOutDir: true },
});
