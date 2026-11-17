import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// in dev, vite forwards /api and /uploads to the backend.
// in production, nginx does the same job, so the code never changes.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
      "/uploads": "http://localhost:3001",
    },
  },
});
