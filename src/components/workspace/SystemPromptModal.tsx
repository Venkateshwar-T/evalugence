'use client';

import { useState, useEffect } from 'react';
import { X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useModelConfig } from '@/hooks/useModelConfig';
import { createPortal } from 'react-dom';

export default function SystemPromptModal({ isOpen, onClose, modelName = 'global' }: { isOpen: boolean, onClose: () => void, modelName?: string }) {
  const { config, saveConfig, resetToDefault, isLoaded } = useModelConfig(modelName);
  const [localSystemPrompt, setLocalSystemPrompt] = useState("");

  useEffect(() => {
    if (isLoaded && config) {
      setLocalSystemPrompt(config.systemPrompt);
    }
  }, [config, isLoaded]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {isOpen && (
        <>
          <div 
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[10010]"
          />
          <div 
            className="fixed inset-0 m-auto w-[90%] max-w-2xl h-fit max-h-[75vh] md:max-h-[85vh] bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl md:rounded-2xl shadow-2xl z-[10011] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-5 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/20">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 flex items-center justify-center border border-blue-500/20 dark:border-blue-500/30">
                  <Globe className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-[15px] md:text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">
                    System Prompt
                  </h2>
                  <p className="text-[11px] md:text-[13px] text-gray-500 dark:text-gray-400 font-medium mt-0 md:mt-0.5">
                    {modelName === 'global' ? 'Global constraints applied to all models' : `Constraints for ${modelName}`}
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
              <div className="flex flex-col gap-3">
                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest dark:text-white">
                  Instructions
                </label>
                <textarea 
                  value={localSystemPrompt}
                  onChange={(e) => {
                    setLocalSystemPrompt(e.target.value);
                    saveConfig({ systemPrompt: e.target.value });
                  }}
                  placeholder="e.g. You are a helpful AI assistant. Answer concisely."
                  className="w-full min-h-[200px] p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-[14px] text-gray-900 dark:text-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all leading-relaxed"
                />
                <p className="text-xs text-gray-500 mt-2">
                  The system prompt guides the behavior of the AI model. 
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/20 gap-3">
              <Button 
                variant="secondary" 
                onClick={() => {
                  resetToDefault();
                  setLocalSystemPrompt("");
                }}
                className="text-xs md:text-sm bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1a1a] dark:hover:bg-[#222] text-gray-700 dark:text-gray-300 rounded-lg font-bold cursor-pointer px-3 py-1.5 h-auto border border-transparent dark:border-gray-800/50"
              >
                Restore to default
              </Button>
              <Button 
                onClick={onClose}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-sm"
              >
                Done
              </Button>
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  );
}
