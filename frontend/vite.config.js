import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.FRONTEND_PORT || 5173);

  // Requests to /api are forwarded to the backend. Set API_PROXY_TARGET in frontend/.env
  // to wherever the backend runs (default http://localhost:5000).
  const proxy = {
    "/api": {
      target: env.API_PROXY_TARGET || "http://localhost:5000",
      // Keep the visitor's Host and pass X-Forwarded-* so the backend sees the real
      // site address (for unsubscribe links) and the real visitor IP (for rate limits).
      changeOrigin: false,
      xfwd: true,
    },
  };

  return {
    plugins: [react()],
    server: { port, host: true, proxy },
    preview: { port, host: true, proxy },
  };
});
