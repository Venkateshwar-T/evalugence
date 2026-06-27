'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Settings2, Clock, Sparkles, Box } from 'lucide-react';
import { createPortal } from 'react-dom';
import providersData from "@/data/providers.json";
import { useApiKeys } from "@/hooks/useApiKeys";
import Link from 'next/link';
import { matchesSearch } from '@/utils/search';
import { formatModelName } from '@/utils/formatters';

interface SelectModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (modelName: string, providerLogo: string, providerId: string) => void;
  selectedModelName?: string;
}

interface RecentModel {
  name: string;
  providerId: string;
  providerName: string;
  logo: string;
}

export default function SelectModelModal({ isOpen, onClose, onSelectModel, selectedModelName }: SelectModelModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const { providers: savedProviders } = useApiKeys();
  const [recentModels, setRecentModels] = useState<RecentModel[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setVisibleCount(20);
      const stored = localStorage.getItem('evalugence_recent_models');
      if (stored) {
        try {
          setRecentModels(JSON.parse(stored));
        } catch (e) {}
      }
    }
  }, [isOpen]);

  useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  const handleModelSelect = (modelName: string, providerLogo: string, providerId: string, providerName: string) => {
    // Update recently used
    const newRecent = { name: modelName, providerId, providerName, logo: providerLogo };
    const updatedRecent = [
      newRecent,
      ...recentModels.filter(m => m.name !== modelName || m.providerId !== providerId)
    ].slice(0, 4);
    
    setRecentModels(updatedRecent);
    localStorage.setItem('evalugence_recent_models', JSON.stringify(updatedRecent));

    onSelectModel(modelName, providerLogo, providerId);
    handleClose();
  };

  const connectedModels = Object.entries(savedProviders).flatMap(([providerId, data]) => {
    const pInfo = providersData.find(p => p.id === providerId);
    return (data.models || []).map(modelName => ({
      name: modelName,
      providerId: providerId,
      providerName: pInfo?.name || providerId,
      logo: pInfo?.logo || ''
    }));
  });

  const filteredModels = (() => {
    if (!searchQuery) return connectedModels;
    return connectedModels.filter(m => 
      matchesSearch(searchQuery, m.name) || 
      matchesSearch(searchQuery, m.providerName)
    );
  })();

  const hasConnections = Object.keys(savedProviders).length > 0;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      setVisibleCount(prev => prev + 20);
    }
  };

  return createPortal(
    <>
      {isOpen && (
        <>
          <div 
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[10010]"
          />
          <div 
            className="fixed inset-0 m-auto w-[90%] max-w-4xl h-fit max-h-[85vh] bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl md:rounded-2xl shadow-2xl z-[10011] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex flex-col gap-3 md:gap-4 px-4 py-3 md:px-6 md:py-5 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/20 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center border border-blue-500/20 dark:border-blue-500/30">
                    <Box className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-[15px] md:text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">Select Test Model</h3>
                    <p className="text-[11px] md:text-[13px] text-gray-500 dark:text-gray-400 font-medium mt-0 md:mt-0.5">Choose a model for standard chat.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <button 
                    onClick={handleClose}
                    className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
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
            </div>
            
            {/* Content Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50/30 dark:bg-[#0a0a0a]"
              onScroll={handleScroll}
            >
            {connectedModels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 md:gap-4 py-8 md:py-12">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-800">
                  <Settings2 className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-[15px] md:text-[17px] font-bold text-gray-900 dark:text-white mb-1">No Models Connected</h3>
                  <p className="text-[11px] md:text-[13px] text-gray-500 max-w-xs mx-auto">Connect your API keys in the models section to start testing.</p>
                </div>
                <Link 
                  href="/models" 
                  onClick={handleClose}
                  className="mt-2 px-6 py-2.5 md:py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl active:scale-95 transition-all text-xs md:text-sm hover:bg-gray-800 dark:hover:bg-gray-200"
                >
                  Configure Models
                </Link>
              </div>
            ) : (
            <div className="flex flex-col gap-6 md:gap-8">
              {recentModels.length > 0 && !searchQuery && (
                <div className="flex flex-col gap-2 md:gap-3">
                  <h4 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 md:gap-2 pl-1">
                    <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" /> Recently Used
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                    {recentModels.map((m, idx) => {
                      const isSelected = selectedModelName === m.name;
                      return (
                        <button
                          key={`recent-${m.name}-${idx}`}
                          onClick={() => handleModelSelect(m.name, m.logo, m.providerId, m.providerName)}
                          className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl md:rounded-2xl border transition-all cursor-pointer text-left ${isSelected ? 'bg-blue-50/50 border-blue-500/50 dark:bg-blue-900/20 dark:border-blue-500/50 shadow-sm' : 'bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm'}`}
                        >
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-50 dark:bg-white border border-gray-100 dark:border-gray-800 flex items-center justify-center p-1 md:p-1.5 shrink-0">
                            {m.logo ? (
                              <img src={m.logo} alt={m.providerName} className="w-full h-full object-contain" />
                            ) : (
                              <Box className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className={`font-bold text-xs md:text-[13px] truncate ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{formatModelName(m.name)}</span>
                            <span className="text-[10px] md:text-[11px] text-gray-500 font-medium truncate">{m.providerName}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 md:gap-3">
                <h4 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                  {searchQuery ? 'Search Results' : 'All Connected Models'}
                </h4>
                {filteredModels.length === 0 ? (
                  <div className="text-center py-8 md:py-12 text-gray-500 text-xs md:text-sm font-medium">
                    No models found matching "{searchQuery}"
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                    {filteredModels.slice(0, visibleCount).map((m, idx) => {
                      const isSelected = selectedModelName === m.name;
                      return (
                        <button
                          key={`${m.providerId}-${m.name}-${idx}`}
                          onClick={() => handleModelSelect(m.name, m.logo, m.providerId, m.providerName)}
                          className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl md:rounded-2xl border transition-all cursor-pointer text-left group ${isSelected ? 'bg-blue-50/50 border-blue-500/50 dark:bg-blue-900/20 dark:border-blue-500/50 shadow-sm' : 'bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm'}`}
                        >
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gray-50 dark:bg-white border border-gray-100 dark:border-gray-800 flex items-center justify-center p-1.5 md:p-2 shrink-0">
                            {m.logo ? (
                              <img src={m.logo} alt={m.providerName} className="w-full h-full object-contain" />
                            ) : (
                              <Box className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex flex-col overflow-hidden flex-1">
                            <span className={`font-bold text-xs md:text-[14px] truncate ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-white'}`}>{formatModelName(m.name)}</span>
                            <span className="text-[10px] md:text-[12px] text-gray-500 font-medium truncate">{m.providerName}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
          </div>
        </>
      )}
    </>,
    document.body
  );
}
