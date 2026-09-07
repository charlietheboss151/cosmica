import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/cosmica/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/testSetup.ts",
    // App and map renders can exceed the 5s default when the full suite runs together.
    testTimeout: 15_000,
    hookTimeout: 15_000,
    maxWorkers: process.env.CI ? 2 : "50%",
  },
});
