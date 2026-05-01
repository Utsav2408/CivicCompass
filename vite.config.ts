import path from "path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],

      // Web App Manifest — makes it installable as a PWA
      manifest: {
        name: "CivicCompass",
        short_name: "CivicCompass",
        description: "Your Personalized Election Companion",
        theme_color: "#B84200", // --sf Saffron from Rang Mahal
        background_color: "#FDF8F0", // --pg Parchment from Rang Mahal
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      // Workbox service worker configuration
      workbox: {
        // Cache the app shell immediately on install
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],

        runtimeCaching: [
          // Google Maps tiles — Stale While Revalidate
          {
            urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-maps-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
          {
            urlPattern: /^https:\/\/maps\.gstatic\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "maps-static-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },

          // User Polling Booth — Cache First + Background Update (StaleWhileRevalidate)
          {
            urlPattern:
              /^https:\/\/firestore\.googleapis\.com\/v1\/projects\/.*\/databases\/\(default\)\/documents\/pollingBooths\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "polling-booth-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },

          // Police Stations (Emergency Data) — Cache First, 7-day TTL
          {
            urlPattern:
              /^https:\/\/firestore\.googleapis\.com\/v1\/projects\/.*\/databases\/\(default\)\/documents\/policeStations.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "police-stations-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },

          // Election Schedule (Static) — Cache First
          {
            urlPattern:
              /^https:\/\/firestore\.googleapis\.com\/v1\/projects\/.*\/databases\/\(default\)\/documents\/elections\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "elections-static-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },

          // Party Performance Data — Stale While Revalidate
          {
            urlPattern:
              /^https:\/\/firestore\.googleapis\.com\/v1\/projects\/.*\/databases\/\(default\)\/documents\/parties\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "parties-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 12, // 12 hours
              },
            },
          },

          // Live Election Timeline — Network First with fallback
          {
            urlPattern:
              /^https:\/\/firestore\.googleapis\.com\/v1\/projects\/.*\/databases\/\(default\)\/documents\/live_updates\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "live-timeline-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              networkTimeoutSeconds: 3,
            },
          },

          // Process Steps (Election Process Screen) — Cache First, 7-day TTL
          // Enables the full /process screen to work offline after first visit.
          {
            urlPattern:
              /^https:\/\/firestore\.googleapis\.com\/v1\/projects\/.*\/databases\/\(default\)\/documents\/process-steps.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "process-steps-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },

          // Firestore General APIs — Network First
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "firestore-general-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              networkTimeoutSeconds: 5,
            },
          },

          // i18n JSON files — Cache First (stable, works offline)
          {
            urlPattern: /\/src\/i18n\/.*\.json$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "i18n-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },
    }),
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("firebase")) return "vendor-firebase";
          if (id.includes("recharts")) return "vendor-recharts";
          if (id.includes("@googlemaps")) return "vendor-maps";
          if (id.includes("i18next") || id.includes("react-i18next"))
            return "vendor-i18n";
          if (id.includes("zod")) return "vendor-zod";
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 60,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@features": path.resolve(__dirname, "./src/features"),
    },
  },
});
