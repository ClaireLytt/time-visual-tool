import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'vite.svg'],
      manifest: false, // use existing manifest.webmanifest
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
          {
            // Cache dictionary lookups only — static reference data safe to cache
            urlPattern: /\/api\/dictionary\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'dictionary-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            // Transcribe/podcast APIs: network-first with short cache for offline fallback
            urlPattern: /\/api\/transcribe.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'transcribe-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 24 * 60 * 60 },
              networkTimeoutSeconds: 10,
            },
          },
          // Note: Firebase/Firestore APIs are NOT cached by the SW —
          // they use their own SDK caching and auth tokens.
        ],
      },
    }),
  ],
  base: '/time-visual-tool/',
  server: {
    open: '/time-visual-tool/',
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase'
            if (id.includes('recharts') || id.includes('d3-')) return 'charts'
            if (id.includes('date-fns')) return 'datefns'
            if (id.includes('react') || id.includes('scheduler')) return 'vendor'
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['server/**', 'node_modules/**'],
  },
})
