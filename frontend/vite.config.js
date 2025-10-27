import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName = "/Study-Buddy/";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "production" ? repoName : "/",
  server: {
    host: true, // allow access from Docker container
    port: 5173,
    proxy: {
      "/api": {
        target: "http://backend:5000", // container-to-container call
        changeOrigin: true,
      },
    },
  },
}));
