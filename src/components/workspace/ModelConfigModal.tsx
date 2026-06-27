'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Settings2, Save, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useModelConfig } from '@/hooks/useModelConfig';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

function CustomSelect({ options, value, onChange, disabled, openUpwards }: { options: string[], value: string, onChange: (val: string) => void, disabled?: boolean, openUpwards?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        <span className="capitalize">{value}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: openUpwards ? 5 : -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: openUpwards ? 5 : -5 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[10020] w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden ${openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'}`}
          >
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${value === opt ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
              >
                <span className="capitalize">{opt}</span>
                {value === opt && <Check className="w-4 h-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Default schema for known parameters
const PARAM_SCHEMA: Record<string, { type: 'number' | 'string' | 'boolean' | 'enum', label: string, min?: number, max?: number, step?: number, options?: string[], default: any }> = {
  temperature: { type: 'number', label: 'Temperature', min: 0, max: 2, step: 0.1, default: 1 },
  top_p: { type: 'number', label: 'Top P', min: 0, max: 1, step: 0.05, default: 1 },
  top_k: { type: 'number', label: 'Top K', min: 0, step: 1, default: 0 },
  min_p: { type: 'number', label: 'Min P', min: 0, max: 1, step: 0.05, default: 0 },
  max_tokens: { type: 'number', label: 'Max Tokens', min: 1, step: 1, default: 2048 },
  frequency_penalty: { type: 'number', label: 'Frequency Penalty', min: -2, max: 2, step: 0.1, default: 0 },
  presence_penalty: { type: 'number', label: 'Presence Penalty', min: -2, max: 2, step: 0.1, default: 0 },
  repetition_penalty: { type: 'number', label: 'Repetition Penalty', min: 0, max: 2, step: 0.1, default: 1 },
  seed: { type: 'number', label: 'Seed', step: 1, default: '' },
  stop: { type: 'string', label: 'Stop Sequences', default: '' },
  reasoning_effort: { type: 'enum', label: 'Reasoning Effort', options: ['low', 'medium', 'high'], default: 'medium' },
  include_reasoning: { type: 'boolean', label: 'Enable Reasoning', default: true }
};

interface ModelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelName: string;
  providerId: string;
}

export default function ModelConfigModal({ isOpen, onClose, modelName, providerId }: ModelConfigModalProps) {
  const { config, saveConfig } = useModelConfig(modelName);
  const [modelMeta, setModelMeta] = useState<any>(null);
  const [localParams, setLocalParams] = useState<Record<string, any>>({});
  const [localSystemPrompt, setLocalSystemPrompt] = useState<string>('');
  
  const isSupportedProvider = providerId === 'openai' || providerId === 'openrouter' || providerId === 'google';

  useEffect(() => {
    if (typeof window !== 'undefined' && modelName && isOpen) {
      try {
        const metaCache = JSON.parse(localStorage.getItem('evalugence_model_metadata') || '{}');
        setModelMeta(metaCache[modelName] || null);
      } catch (e) {
        setModelMeta(null);
      }
    }
  }, [modelName, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setLocalParams(config.parameters || {});
      setLocalSystemPrompt(config.systemPrompt || '');
    }
  }, [isOpen, config.parameters, config.systemPrompt]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveConfig({ ...config, parameters: localParams, systemPrompt: localSystemPrompt });
    onClose();
  };

  const handleReset = () => {
    setLocalParams({});
    setLocalSystemPrompt('');
  };

  // Determine which parameters to show
  let supportedParams: string[] = [];
  if (modelMeta?.supported_parameters && Array.isArray(modelMeta.supported_parameters)) {
    // If metadata specifically lists them, filter to only the ones we support rendering
    supportedParams = modelMeta.supported_parameters.filter((p: string) => Object.keys(PARAM_SCHEMA).includes(p));
  } else {
    // Fallback to standard ones if not specified in metadata but provider is supported
    if (providerId === 'google') {
      supportedParams = ['temperature', 'top_p', 'top_k', 'max_tokens', 'stop'];
    } else {
      supportedParams = ['temperature', 'top_p', 'max_tokens', 'frequency_penalty', 'presence_penalty', 'stop'];
    }
    if (modelName.includes('o1') || modelName.includes('o3')) {
      supportedParams.push('reasoning_effort');
    }
    if (providerId === 'openrouter') {
      supportedParams.push('top_k', 'min_p', 'repetition_penalty');
    }
  }

  // Handle explicit reasoning object in metadata
  let dynamicReasoningSchema = PARAM_SCHEMA.reasoning_effort;
  if (modelMeta?.reasoning) {
    if (!modelMeta.reasoning.mandatory && !supportedParams.includes('include_reasoning')) {
      supportedParams.push('include_reasoning');
    }
    
    if (modelMeta.reasoning.supported_efforts && modelMeta.reasoning.supported_efforts.length > 0) {
      if (!supportedParams.includes('reasoning_effort')) {
        supportedParams.push('reasoning_effort');
      }
      const efforts = modelMeta.reasoning.supported_efforts;
      dynamicReasoningSchema = {
        type: 'enum',
        label: 'Reasoning Effort',
        options: efforts,
        default: modelMeta.reasoning.default_effort || efforts[0] || 'medium'
      };
    }
  }

  return createPortal(
    <>
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[10010]"
      />
      <div 
        className="fixed inset-0 m-auto w-[95%] max-w-xl h-fit max-h-[85vh] bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl md:rounded-2xl shadow-2xl z-[10011] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-5 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/20">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center border border-blue-500/20">
              <Settings2 className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-[15px] md:text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">
                Model Configuration
              </h2>
              <p className="text-[11px] md:text-[13px] text-gray-500 dark:text-gray-400 font-medium mt-0 md:mt-0.5">
                {modelName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-white dark:bg-gray-950">
          {!isSupportedProvider ? (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
              <Settings2 className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-gray-600 dark:text-gray-300 font-medium text-sm">Configuration not supported for this provider.</p>
            </div>
          ) : supportedParams.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No supported parameters found in metadata for this model.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* System Prompt Section */}
              <div className="flex flex-col gap-2 border-b border-gray-100 dark:border-gray-800 pb-5">
                <label htmlFor="modal-system-prompt" className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
                  System Prompt
                </label>
                <textarea
                  id="modal-system-prompt"
                  value={localSystemPrompt}
                  onChange={(e) => setLocalSystemPrompt(e.target.value)}
                  placeholder="You are a helpful assistant..."
                  className="w-full h-24 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white resize-none custom-scrollbar focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Override the global system prompt for this specific model.
                </p>
              </div>

              {supportedParams.length > 0 && supportedParams.map((param) => {
                const schema = param === 'reasoning_effort' ? dynamicReasoningSchema : PARAM_SCHEMA[param];
                if (!schema) return null;

                let defaultVal = schema.default;
                if (modelMeta) {
                  if (modelMeta[param] !== undefined && typeof modelMeta[param] !== 'object') {
                    defaultVal = modelMeta[param];
                  } else if (modelMeta.parameters?.[param]?.default !== undefined) {
                    defaultVal = modelMeta.parameters[param].default;
                  } else if (modelMeta.default_parameters?.[param] !== undefined) {
                    defaultVal = modelMeta.default_parameters[param];
                  } else if (modelMeta.architecture?.[param] !== undefined) {
                    defaultVal = modelMeta.architecture[param];
                  }
                }

                const val = localParams[param] !== undefined ? localParams[param] : defaultVal;

                return (
                  <div key={param} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor={`param-${param}`} className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {schema.label}
                      </label>
                      {schema.type === 'number' && (
                        <span className="text-[12px] text-gray-500 font-mono">{val}</span>
                      )}
                    </div>

                    {schema.type === 'number' && schema.max !== undefined ? (
                      <input 
                        id={`param-${param}`}
                        type="range" 
                        min={schema.min} 
                        max={schema.max} 
                        step={schema.step} 
                        value={val ?? schema.min ?? 0}
                        onChange={(e) => setLocalParams({ ...localParams, [param]: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                      />
                    ) : schema.type === 'number' ? (
                      <input 
                        id={`param-${param}`}
                        type="number" 
                        min={schema.min}
                        step={schema.step}
                        value={val ?? ''}
                        placeholder={param === 'seed' ? 'Random' : ''}
                        onChange={(e) => setLocalParams({ ...localParams, [param]: e.target.value ? parseFloat(e.target.value) : '' })}
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      />
                    ) : schema.type === 'boolean' ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          id={`param-${param}`}
                          type="checkbox" 
                          checked={val ?? false} 
                          onChange={(e) => setLocalParams({ ...localParams, [param]: e.target.checked })}
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    ) : schema.type === 'enum' ? (
                      <CustomSelect 
                        options={schema.options || []} 
                        value={val ?? ''} 
                        onChange={(newVal) => setLocalParams({ ...localParams, [param]: newVal })} 
                        disabled={param === 'reasoning_effort' && localParams['include_reasoning'] === false}
                        openUpwards={param === 'reasoning_effort'}
                      />
                    ) : (
                      <input 
                        id={`param-${param}`}
                        type="text" 
                        value={val ?? ''}
                        placeholder={param === 'stop' ? 'word1, word2' : ''}
                        onChange={(e) => setLocalParams({ ...localParams, [param]: e.target.value })}
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {isSupportedProvider && supportedParams.length > 0 && (
          <div className="p-4 md:p-5 border-t border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/20 flex justify-between gap-3">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="text-gray-600 dark:text-gray-300"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Reset
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave}
              className="px-6"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Config
            </Button>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}
