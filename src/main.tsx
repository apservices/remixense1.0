import { enablePWA } from './pwa/register-sw';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

createRoot(document.getElementById("root")!).render(<App />);

// Configure PWA registration with update prompt
const updateSW = registerSW({
  immediate: false,
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('pwa:need-refresh'))
  },
  onOfflineReady() {
    // Optional: show a toast informing offline capability
  }
})

// Expose updater for UI components
window.__PWA_UPDATE_SW = updateSW

 enablePWA();

