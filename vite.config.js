import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// SITE_URL (e.g. https://honeychain.example.com) makes social-preview URLs absolute at build time.
const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '')
const html = () => ({ name: 'site-url', transformIndexHtml: (h) => h.replaceAll('%SITE_URL%', siteUrl) })

// base './' keeps the build portable: root domains, GitHub Pages sub-paths, or a plain file server.
export default defineConfig({
  base: './',
  plugins: [react(), html()],
  build: { target: 'es2019', sourcemap: false, chunkSizeWarningLimit: 700 },
})
