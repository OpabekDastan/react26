import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// after the build: write the list of built files and a new version into dist/sw.js
function serviceWorkerPlugin() {
  return {
    name: "service-worker-precache",
    apply: "build",
    closeBundle() {
      const distDir = path.resolve("dist");

      // all files of the build (js / css with hashes, icons, offline.html, ...)
      const files = fs
        .readdirSync(distDir, { recursive: true })
        .map((file) => file.split(path.sep).join("/"))
        .filter((file) => fs.statSync(path.join(distDir, file)).isFile())
        .filter((file) => file !== "sw.js");

      const precache = ["./", ...files.map((file) => "./" + file)];

      const swPath = path.join(distDir, "sw.js");
      const code = fs
        .readFileSync(swPath, "utf8")
        .replace("__BUILD_VERSION__", String(Date.now()))
        .replace('"__PRECACHE_FILES__"', JSON.stringify(precache, null, 2));

      fs.writeFileSync(swPath, code);
    },
  };
}

// base "./" makes the build work in any folder on GitHub Pages
export default defineConfig({
  plugins: [react(), serviceWorkerPlugin()],
  base: "./",
});
