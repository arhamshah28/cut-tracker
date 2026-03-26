const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      // Never cache Supabase API calls
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: "NetworkOnly",
    },
    {
      // Cache Google Fonts
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      // Cache static assets with network-first (always get latest)
      urlPattern: /\/_next\/static\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "static-assets",
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      // Pages — network first so updates are picked up
      urlPattern: /^https:\/\/.*\.vercel\.app\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
  ],
});

module.exports = withPWA({
  turbopack: {},
});
