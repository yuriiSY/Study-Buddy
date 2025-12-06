import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName = "/Study-Buddy/";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: "/",
  server: {
    host: true, // allow access from Docker container
    port: 5173,
    open: '/Study-Buddy', // open the app in the browser on server start
    proxy: {
      "/api": {
        target: "http://backend:5000", // container-to-container call
        changeOrigin: true,
      },
    },
  },
}));
