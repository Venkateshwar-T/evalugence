'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function GlobalLogic() {
  const router = useRouter();
  const pathname = usePathname();

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
    } catch (e) {
      console.warn('Failed to access localStorage during GlobalLogic startup', e);
    }
  }, []);

  // Client-side redirection has been moved to src/middleware.ts using cookies

  return null;
}
