/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/weight-tracker/",
  plugins: [react()],
  test: {
    environment: "node",
  },
});
