import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

export default defineConfig({
  plugins: [
    react(),
-   checker({ eslint: { lintCommand: 'eslint "./src/**/*.{js,jsx}"' } }),
  ],
  server: { host: true },
});