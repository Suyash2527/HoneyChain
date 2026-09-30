import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { StoreProvider } from './lib/store.jsx'
import { SettingsProvider } from './lib/settings.jsx'
import './styles.css'
import './motion.css'

createRoot(document.getElementById('root')).render(
  <SettingsProvider>
    <StoreProvider>
      <App />
    </StoreProvider>
  </SettingsProvider>
)

// Offline-first PWA: register the service worker in production builds only.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}))
}
