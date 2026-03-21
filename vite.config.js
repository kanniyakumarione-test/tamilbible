import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png", "icon-192.png", "icon-512.png"],
      workbox: {
        maximumFileSizeToCacheInBytes: 16 * 1024 * 1024,
      },
      manifest: {
        name: "Tamil Bible Premium",
        short_name: "Tamil Bible",
        description: "Premium Tamil Bible reading app with search, settings, and offline install support.",
        theme_color: "#08111d",
        background_color: "#08111d",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        categories: ["books", "education", "lifestyle", "productivity"],
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
