import { useState, useEffect } from 'react';

export interface ProviderCache {
  apiKey: string;
  models: string[];
}

export function useApiKeys() {
  const [providers, setProviders] = useState<Record<string, ProviderCache>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const loadProviders = () => {
    const stored = localStorage.getItem('evalugence_providers');
    if (stored) {
      try {
        setProviders(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse providers from local storage");
      }
    } else {
      setProviders({});
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    loadProviders();
    window.addEventListener('evalugence_providers_updated', loadProviders);
    return () => window.removeEventListener('evalugence_providers_updated', loadProviders);
  }, []);

  const saveProvider = (providerId: string, apiKey: string, models: string[]) => {
    const currentStored = JSON.parse(localStorage.getItem('evalugence_providers') || '{}');
    const updated = {
      ...currentStored,
      [providerId]: { apiKey, models }
    };
    localStorage.setItem('evalugence_providers', JSON.stringify(updated));
    setProviders(updated);
    window.dispatchEvent(new Event('evalugence_providers_updated'));
  };

  const removeProvider = (providerId: string) => {
    const currentStored = JSON.parse(localStorage.getItem('evalugence_providers') || '{}');
    delete currentStored[providerId];
    localStorage.setItem('evalugence_providers', JSON.stringify(currentStored));
    setProviders(currentStored);
    window.dispatchEvent(new Event('evalugence_providers_updated'));
  };

  return {
    providers,
    isLoaded,
    saveProvider,
    removeProvider,
    connectedProviderIds: Object.keys(providers)
  };
}
