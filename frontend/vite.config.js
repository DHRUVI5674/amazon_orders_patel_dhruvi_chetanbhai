import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const RENDER_API = "http://localhost:5000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: RENDER_API,
        changeOrigin: true,
        secure: true,
        timeout: 120000,
        proxyTimeout: 120000,
      },
    },
  },
});
