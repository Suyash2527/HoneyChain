import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { StoreProvider } from './lib/store.jsx'
import { SettingsProvider } from './lib/settings.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <SettingsProvider>
    <StoreProvider>
      <App />
    </StoreProvider>
  </SettingsProvider>
)
