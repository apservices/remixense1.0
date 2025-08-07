export function registerServiceWorker() {
  if (import.meta && import.meta.env && import.meta.env.PROD) {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registrado (produção):', registration.scope);
          })
          .catch((error) => {
            console.error('Falha ao registrar Service Worker:', error);
          });
      });
    }
  }
}

