import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "RemiXense",
        short_name: "RemiXense",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#0a0a0a",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-512x512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        sourcemap: false,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: { cacheName: "html-cache" }
          },
          {
            urlPattern: ({ request }) => ["style","script","worker"].includes(request.destination),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "asset-cache" }
          },
          {
            urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname.startsWith("/"),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "static-cache" }
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  },
  build: {
    rollupOptions: { external: [] }
  }
});