/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Relative base so the build works from any sub-path (e.g. GitHub Pages /bible-app/).
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Bible",
        short_name: "Bible",
        description: "A paragraph-formatted Bible reader (KJV).",
        theme_color: "#7a4b2a",
        background_color: "#faf7f0",
        display: "standalone",
        icons: [{ src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
      },
      workbox: {
        // Precache the whole Bible so it works fully offline (~5 MB, ~1.5 MB over the wire).
        globPatterns: ["**/*.{js,css,html,svg,woff2,json}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  test: { include: ["tests/**/*.test.ts"] },
});
