'use client';

import { useEffect } from 'react';

export default function GlobalLogic() {
  // Run ONLY on initial mount (true refresh)
  useEffect(() => {
    try {
      // 1. Auto delete API keys on refresh if enabled
      const autoDelete = localStorage.getItem('evalugence_auto_delete_keys');
      if (autoDelete !== 'false') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('evalugence_providers')) {
            localStorage.removeItem(key);
          }
        });
        // Specifically target our known storage key
        localStorage.removeItem('evalugence_providers');
        window.dispatchEvent(new Event('evalugence_providers_updated'));
      }

      // 2. Register Service Worker for PWA
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
          console.error('Service Worker registration failed:', err);
        });
      }
    } catch (e) {
      console.warn('Failed to execute GlobalLogic startup logic', e);
    }
  }, []);

  // Client-side redirection has been moved to src/middleware.ts using cookies

  return null;
}
