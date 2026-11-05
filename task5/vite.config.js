import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" makes the build work in any folder on GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: "./",
});
