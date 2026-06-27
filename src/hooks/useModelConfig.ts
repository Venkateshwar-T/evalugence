import { useState, useEffect } from 'react';

export interface ModelConfig {
  systemPrompt: string;
  parameters?: Record<string, any>;
}

export const DEFAULT_CONFIG: ModelConfig = {
  systemPrompt: "",
};

const LEGACY_DEFAULT_PROMPT = "You are a highly capable, helpful, and honest AI assistant. You provide clear, accurate, and direct answers while maintaining a polite and professional tone.";

export function useModelConfig(modelName: string | 'global') {
  const [config, setConfig] = useState<ModelConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadConfig = () => {
    if (!modelName) return;
    const key = `evalugence_config_${modelName.replace(/\s+/g, '_')}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.systemPrompt === LEGACY_DEFAULT_PROMPT) {
          parsed.systemPrompt = "";
        }
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      } catch {
        setConfig(DEFAULT_CONFIG);
      }
    } else {
      // If per-model config doesn't exist, try falling back to global config
      if (modelName !== 'global') {
        const globalSaved = localStorage.getItem('evalugence_config_global');
        if (globalSaved) {
          try {
            const parsedGlobal = JSON.parse(globalSaved);
            if (parsedGlobal.systemPrompt === LEGACY_DEFAULT_PROMPT) {
              parsedGlobal.systemPrompt = "";
            }
            setConfig({ ...DEFAULT_CONFIG, ...parsedGlobal });
          } catch {
            setConfig(DEFAULT_CONFIG);
          }
        } else {
          setConfig(DEFAULT_CONFIG);
        }
      } else {
        setConfig(DEFAULT_CONFIG);
      }
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    loadConfig();

    const handleUpdate = () => {
      loadConfig();
    };

    window.addEventListener('evalugence_config_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    
    return () => {
      window.removeEventListener('evalugence_config_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [modelName]);

  const saveConfig = (newConfig: ModelConfig) => {
    if (!modelName) return;
    const key = `evalugence_config_${modelName.replace(/\s+/g, '_')}`;
    localStorage.setItem(key, JSON.stringify(newConfig));
    setConfig(newConfig);
    window.dispatchEvent(new Event('evalugence_config_updated'));
  };

  const resetToDefault = () => {
    saveConfig(DEFAULT_CONFIG);
  };

  return { config, saveConfig, resetToDefault, isLoaded };
}
