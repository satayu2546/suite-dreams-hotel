import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    // Use the React plugin for SWC
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Enable Fast Refresh for better HMR
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  // Use esbuild options if necessary for HMR (optional)
  esbuild: {
    jsxInject: `import React from 'react'`,  // ensure JSX transformation works correctly
  }
});
