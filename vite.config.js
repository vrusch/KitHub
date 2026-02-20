import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import packageJson from "./package.json";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Tyto soubory by měly být v /public složce
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: "KitHub - Professional Tool",
        short_name: "KitHub",
        description: "Professional tool for developers and modelers",
        // Barva okolí aplikace (v Androidu záhlaví prohlížeče)
        theme_color: "#0d1117",
        // Barva pozadí při startu aplikace
        background_color: "#0d1117",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  define: {
    "import.meta.env.PACKAGE_VERSION": JSON.stringify(packageJson.version),
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
