'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Search, Box } from 'lucide-react';
import { createPortal } from 'react-dom';
import providersData from "@/data/providers.json";
import { useApiKeys } from "@/hooks/useApiKeys";
import { matchesSearch } from '@/utils/search';

interface ChooseModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModels: string[];
  onConfirm: (models: string[]) => void;
}

export default function ChooseModelsModal({ isOpen, onClose, selectedModels, onConfirm }: ChooseModelsModalProps) {
  const { providers: savedProviders } = useApiKeys();
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelected, setLocalSelected] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLocalSelected(selectedModels);
      setSearchQuery('');
    }
  }, [isOpen, selectedModels]);

  if (typeof document === 'undefined') return null;

  // Flatten connected models
  const connectedModels = Object.entries(savedProviders).flatMap(([providerId, data]) => {
    const providerInfo = providersData.find(p => p.id === providerId);
    return data.models.map(model => ({
      name: model,
      providerName: providerInfo?.name || providerId,
      logo: providerInfo?.logo || '',
    }));
  });

  // Filter based on search query
  const filteredModels = (() => {
    if (!searchQuery) return connectedModels;
    return connectedModels.filter(m => 
      matchesSearch(searchQuery, m.name) || 
      matchesSearch(searchQuery, m.providerName)
    );
  })();

  const handleToggle = (modelName: string) => {
    setLocalSelected(prev => {
      if (prev.includes(modelName)) {
        return prev.filter(m => m !== modelName);
      } else {
        if (prev.length >= 5) return prev;
        return [...prev, modelName];
      }
    });
  };

  return createPortal(
    <>
      {isOpen && (
        <>
          <div 
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[10010]"
          />
          <div 
            className="fixed inset-0 m-auto w-[90%] max-w-4xl h-fit max-h-[85vh] bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl md:rounded-2xl shadow-2xl z-[10011] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex flex-col gap-3 md:gap-4 px-4 py-3 md:px-6 md:py-5 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/20 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 flex items-center justify-center border border-blue-500/20 dark:border-blue-500/30">
                    <Box className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-[15px] md:text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">Compare Models</h3>
                    <p className="text-[11px] md:text-[13px] text-gray-500 dark:text-gray-400 font-medium mt-0 md:mt-0.5">Select up to 5 connected models to compare side-by-side.</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mt-1 md:mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search models or providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-9 md:pl-11 pr-3 md:pr-4 py-2 md:py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>

              {/* Selected Models Stack */}
              <div className="flex items-center flex-wrap gap-1.5 md:gap-2 pt-1 md:pt-2">
                <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mr-1 md:mr-2">
                  Selected ({localSelected.length}/6):
                </span>
                  {localSelected.map(modelName => {
                    const modelData = connectedModels.find(m => m.name === modelName);
                    return (
                      <div
                        key={modelName}
                        className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full border border-gray-200 dark:border-gray-700"
                      >
                        {modelData?.logo && (
                          <div className="w-3.5 h-3.5 md:w-4 md:h-4 bg-white rounded-full flex items-center justify-center shrink-0">
                            <img src={modelData.logo} alt={modelData.providerName} className="w-2 h-2 md:w-2.5 md:h-2.5 object-contain" />
                          </div>
                        )}
                        <span className="text-[10px] md:text-[11px] font-bold max-w-[80px] md:max-w-none truncate">{modelName}</span>
                        <button onClick={() => handleToggle(modelName)} className="ml-0.5 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 p-0.5 rounded-full hover:bg-blue-200/50 dark:hover:bg-blue-800/50 transition-colors">
                          <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </button>
                      </div>
                    );
                  })}
                  {selectedModels.length === 0 && (
                    <span className="text-[10px] md:text-xs font-medium text-gray-400 italic">None selected</span>
                  )}
              </div>
            </div>
            
            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/30 dark:bg-[#0a0a0a]">
              {filteredModels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                  {filteredModels.map((model) => {
                    const isSelected = localSelected.includes(model.name);
                    const isDisabled = !isSelected && localSelected.length >= 6;
                    
                    return (
                      <button
                        key={`${model.providerName}-${model.name}`}
                        onClick={() => handleToggle(model.name)}
                        disabled={isDisabled}
                        className={`relative flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl md:rounded-2xl border transition-all cursor-pointer text-left group ${
                          isSelected 
                            ? 'bg-blue-50/50 border-blue-500/50 dark:bg-blue-900/20 dark:border-blue-500/50 shadow-sm' 
                            : isDisabled 
                              ? 'bg-white dark:bg-[#111] border-transparent opacity-50 cursor-not-allowed'
                              : 'bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm'
                        }`}
                      >
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gray-50 dark:bg-white border border-gray-100 dark:border-gray-800 flex items-center justify-center p-1.5 md:p-2 shrink-0">
                          {model.logo ? (
                            <img src={model.logo} alt={model.providerName} className="w-full h-full object-contain" />
                          ) : (
                            <Box className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex flex-col overflow-hidden flex-1 pr-5 md:pr-6">
                          <span className={`font-bold text-xs md:text-[14px] truncate ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-white'}`}>
                            {model.name}
                          </span>
                          <span className="text-[10px] md:text-[12px] text-gray-500 font-medium truncate">
                            {model.providerName}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-3 w-4 h-4 md:w-5 md:h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Check className="w-2.5 h-2.5 md:w-3 md:h-3" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-3 md:mb-4">
                    <Search className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                  </div>
                  <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">No models found</h3>
                  <p className="text-xs md:text-sm font-medium text-gray-500 mt-1 max-w-sm">
                    {searchQuery ? "We couldn't find any connected models matching your search." : "You haven't connected any models yet. Head to the Models page to add your API keys."}
                  </p>
                </div>
              )}
            </div>
            
            <div className="px-5 py-3 md:px-8 md:py-5 border-t border-gray-100 dark:border-gray-800/60 bg-white dark:bg-[#0a0a0a] flex justify-end shrink-0">
              <button 
                onClick={() => {
                  onConfirm(localSelected);
                  onClose();
                }}
                disabled={localSelected.length < 2}
                className={`px-6 py-2 md:px-8 md:py-2.5 font-bold rounded-lg md:rounded-xl text-xs md:text-sm transition-colors ${localSelected.length < 2 ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed shadow-none' : 'bg-black dark:bg-white text-white dark:text-black shadow-md hover:bg-gray-800 dark:hover:bg-gray-200 cursor-pointer'}`}
              >
                {localSelected.length < 2 ? `Select ${2 - localSelected.length} more model${localSelected.length === 1 ? '' : 's'}` : 'Confirm Selection'}
              </button>
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  );
}
