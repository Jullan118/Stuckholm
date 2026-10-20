// Builds the React site as a Shopify theme bundle and puts it in assets/.
// Run with: npm run build:theme
import { execSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import path from "node:path";

// The globe model is served from GitHub through jsDelivr, because theme
// assets cannot hold a .glb file. The repo must stay public and the file on main.
const GLOBE_URL =
  "https://cdn.jsdelivr.net/gh/Jullan118/Stuckholm@main/public/models/globe_19oct.glb";

execSync("npx vite build --config vite.theme.config.ts", {
  stdio: "inherit",
  env: {
    ...process.env,
    VITE_USE_HASH_ROUTER: "1",
    VITE_BLOB_MODEL_URL: GLOBE_URL,
  },
});

mkdirSync("assets", { recursive: true });
copyFileSync("theme-build/stuckholm-app.js", "assets/stuckholm-app.js");

// Favicons come from public/ so there is one source of truth.
for (const file of ["favicon.ico", "favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png"]) {
  copyFileSync(path.join("public", file), path.join("assets", file));
}

rmSync("theme-build", { recursive: true, force: true });
console.log("Theme bundle written to assets/stuckholm-app.js");
