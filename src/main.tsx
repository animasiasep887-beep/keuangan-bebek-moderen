import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Force-refresh browser tab favicon to instantly clear stale browser cache
try {
  const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
  link.type = 'image/png';
  link.rel = 'shortcut icon';
  link.href = './favicon.png?v=' + Date.now();
  document.getElementsByTagName('head')[0].appendChild(link);
} catch {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
