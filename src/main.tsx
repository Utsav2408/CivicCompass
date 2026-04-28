import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Connect to emulators in development before anything else
if (import.meta.env['VITE_USE_EMULATORS'] === 'true') {
  const { connectToEmulators } = await import('./lib/emulators')
  connectToEmulators()
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)