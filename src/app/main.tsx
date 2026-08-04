import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { bootPalette } from '@/entities/site'
import { App } from './App'

// Apply any saved palette before first paint so the site never flashes
// the default colors.
bootPalette()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
