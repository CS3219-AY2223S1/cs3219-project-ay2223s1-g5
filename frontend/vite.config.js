/* eslint-disable no-undef */
import react from "@vitejs/plugin-react";
import { resolve } from "path";
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
  resolve: {
    alias: [
      {
        find: "src",
        replacement: resolve(__dirname, "./src"),
      },
      {
        find: "lib",
        replacement: resolve(__dirname, "./lib"),
      },
      {
        find: "~shared",
        replacement: resolve(__dirname, "../shared/src"),
      },
    ],
  },
  build: {
    outDir: "build",
  },
  test: {
    passWithNoTests: true,
  },
  plugins: [react()],
});
