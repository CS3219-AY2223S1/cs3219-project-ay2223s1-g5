/* eslint-disable no-undef */
import typescript from "@rollup/plugin-typescript";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:8080",
      "/socket.io": {
        target: "ws://localhost:8080",
        ws: true,
      },
    },
  },
  build: {
    outDir: "build",
  },
  test: {
    passWithNoTests: true,
  },
  plugins: [react(), typescript()],
});
