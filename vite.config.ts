import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 8080,
    strictPort: false, // Auto-fallback to next available port if 8080 is in use
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["framer-motion", "react", "react-dom", "react/jsx-runtime"],
    esbuildOptions: {
      jsx: "automatic",
    },
  },
}));
