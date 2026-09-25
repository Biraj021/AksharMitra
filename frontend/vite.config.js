import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'AksharMitra - Early Phonics & Assistive Literacy Companion',
        short_name: 'AksharMitra',
        description: 'Playful early literacy learning support and adaptive phonics practice for every child.',
        theme_color: '#4F46E5',
        background_color: '#FFFDF7',
        display: 'standalone',
        orientation: 'portrait-primary',
        categories: ['education', 'kids', 'accessibility'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}']
      }
    })
  ],
  resolve: {
    alias: {
      '@ai':       fileURLToPath(new URL('../ai/src',       import.meta.url)),
      '@database': fileURLToPath(new URL('../database/src', import.meta.url)),
      '@backend':  fileURLToPath(new URL('../backend/src',  import.meta.url)),
    }
  },
  server: {
    port: 3000,
    open: false,
    watch: {
      ignored: ['**/*.apk', '**/*.zip', '**/temp_*/**', '**/.git/**']
    }
  },
});
