import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom so React components can render in a browser-like environment
    environment: "jsdom",
    // Makes describe, it, expect etc. available without importing them
    globals: true,
    // Runs setup file before every test file
    setupFiles: ["./src/test/setup.ts"],
    env: {
      // Makes the API URL available to components during tests
      NEXT_PUBLIC_API_URL: "http://localhost:3000",
    },
  },
  resolve: {
    alias: {
      // Maps @/ to src/ so imports like @/components/X work in tests
      "@": path.resolve(__dirname, "./src"),
    },
  },
});