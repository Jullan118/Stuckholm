import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Builds the Shopify theme bundle: one JavaScript file, no hashes in the name.
// Run through scripts/build-theme.mjs, which copies the result into assets/.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "theme-build",
    emptyOutDir: true,
    modulePreload: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        format: "iife",
        inlineDynamicImports: true,
        entryFileNames: "stuckholm-app.js",
        assetFileNames: "stuckholm-app[extname]",
        chunkFileNames: "stuckholm-app.js",
      },
    },
  },
});
