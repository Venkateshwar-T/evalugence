'use client';

import { useState, useEffect } from "react";
import { Search, Info, CheckCircle2, X, Key, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

import providersData from "@/data/providers.json";
import { useApiKeys } from "@/hooks/useApiKeys";
import { matchesSearch } from "@/utils/search";

const PROVIDERS = providersData;

export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProvider, setActiveProvider] = useState<any | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [deleteKeysOnRefresh, setDeleteKeysOnRefresh] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateState = () => {
        const stored = localStorage.getItem('evalugence_auto_delete_keys');
        setDeleteKeysOnRefresh(stored === null ? true : stored === 'true');
      };
      
      updateState(); // Initial check

      window.addEventListener('storage', updateState);
      return () => window.removeEventListener('storage', updateState);
    }
  }, []);
  
  const { providers: savedProviders, connectedProviderIds, saveProvider, removeProvider, isLoaded } = useApiKeys();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [expandedProviders, setExpandedProviders] = useState<string[]>([]);

  const toggleExpanded = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedProviders(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const getProviderModels = (providerId: string) => {
    if (savedProviders[providerId] && savedProviders[providerId].models.length > 0) {
      return savedProviders[providerId].models;
    }
    return PROVIDERS.find(p => p.id === providerId)?.models || [];
  };

  const filteredProviders = PROVIDERS.filter(p => 
    matchesSearch(searchQuery, p.name) || 
    getProviderModels(p.id).some((m: string) => matchesSearch(searchQuery, m))
  );
  const connectedProvidersList = filteredProviders.filter(p => connectedProviderIds.includes(p.id));
  const popularProviders = filteredProviders.filter(p => p.category === 'POPULAR' && !connectedProviderIds.includes(p.id));
  const aggregatorProviders = filteredProviders.filter(p => p.category === 'AGGREGATOR' && !connectedProviderIds.includes(p.id));

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProvider || !apiKeyInput) return;
    
    setIsConnecting(true);
    setConnectionError('');

    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: activeProvider.id, apiKey: apiKeyInput })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to connect');
      }

      saveProvider(activeProvider.id, apiKeyInput, data.models);

      setActiveProvider(null);
      setApiKeyInput('');
    } catch (err: any) {
      setConnectionError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectProvider = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeProvider(id);
  };

  return (
    <main className="flex-1 flex flex-col w-full min-h-screen bg-transparent relative">
      {/* Background glow container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-[60vw] max-w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[60vw] max-w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full" />
      </div>
      
      <div className={`flex flex-col w-full max-w-5xl mx-auto flex-1 relative z-10 px-4 md:px-6 lg:px-8 pt-[80px] md:pt-24 pb-8 md:pb-12 transition-opacity duration-300 ${(!mounted || !isLoaded) ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 shrink-0 gap-4 md:gap-6">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Available Models</h1>
            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 md:mt-2">Connect and manage your AI model providers</p>
          </div>

          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search Providers and Models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-8 md:gap-12">
          {/* CONNECTED SECTION */}
          {connectedProvidersList.length > 0 && (
            <section className="flex flex-col gap-2 md:gap-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Connected</h2>
              <div className="flex flex-col gap-3 md:gap-4">
                {connectedProvidersList.map(provider => {
                  const isConnected = true;
                  const displayModels = getProviderModels(provider.id);
                  const sortedModels = [...displayModels].sort((a, b) => {
                    if (!searchQuery) return 0;
                    const aMatch = matchesSearch(searchQuery, a);
                    const bMatch = matchesSearch(searchQuery, b);
                    if (aMatch && !bMatch) return -1;
                    if (!aMatch && bMatch) return 1;
                    return 0;
                  });
                  const isExpanded = expandedProviders.includes(provider.id) || (searchQuery !== '' && displayModels.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())));
                  return (
                    <div 
                      key={provider.id}
                      onClick={() => {
                        setActiveProvider(provider);
                        setApiKeyInput(savedProviders[provider.id]?.apiKey || '');
                        setConnectionError('');
                      }}
                      className={`group relative flex flex-col p-3 md:p-4 bg-white dark:bg-[#0a0a0a] border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.05)] rounded-2xl hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer overflow-hidden`}
                    >
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-green-400 to-emerald-500" />
                      
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-50 dark:bg-white border border-gray-100 dark:border-gray-800 flex items-center justify-center p-1.5 md:p-2 shadow-inner shrink-0">
                            <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain" />
                          </div>
                          <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">{provider.name}</h3>
                        </div>
                        
                        <div className="flex items-center gap-3 pr-2">
                          <button 
                            onClick={(e) => toggleExpanded(e, provider.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400 transition-colors mr-2"
                          >
                            Models <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold tracking-wide">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col mt-4 ml-[60px] mr-4 pt-4 border-t border-gray-100 dark:border-gray-800/60" onClick={(e) => e.stopPropagation()}>
                              <div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                                {sortedModels.map((model: string) => (
                                  <div key={model} className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 dark:hover:bg-[#111] rounded-xl transition-colors cursor-pointer group/model">
                                    <span className={`text-sm ${searchQuery && matchesSearch(searchQuery, model) ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>
                                      {model}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* POPULAR SECTION */}
          {popularProviders.length > 0 && (
            <section className="flex flex-col gap-2 md:gap-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Popular</h2>
              <div className="flex flex-col gap-3 md:gap-4">
                {popularProviders.map(provider => {
                  const isConnected = connectedProviderIds.includes(provider.id);
                  const displayModels = getProviderModels(provider.id);
                  const sortedModels = [...displayModels].sort((a, b) => {
                    if (!searchQuery) return 0;
                    const aMatch = matchesSearch(searchQuery, a);
                    const bMatch = matchesSearch(searchQuery, b);
                    if (aMatch && !bMatch) return -1;
                    if (!aMatch && bMatch) return 1;
                    return 0;
                  });
                  const isExpanded = expandedProviders.includes(provider.id) || (searchQuery !== '' && displayModels.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())));
                  return (
                    <div 
                      key={provider.id}
                      onClick={() => {
                        setActiveProvider(provider);
                        setApiKeyInput(savedProviders[provider.id]?.apiKey || '');
                        setConnectionError('');
                      }}
                      className={`group relative flex flex-col p-3 md:p-4 bg-white dark:bg-[#0a0a0a] border ${isConnected ? 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.05)]' : 'border-gray-200 dark:border-gray-800 shadow-sm'} rounded-2xl hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer overflow-hidden`}
                    >
                      {isConnected && <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-green-400 to-emerald-500" />}
                      
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-50 dark:bg-white border border-gray-100 dark:border-gray-800 flex items-center justify-center p-1.5 md:p-2 shadow-inner shrink-0">
                            <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain" />
                          </div>
                          <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">{provider.name}</h3>
                        </div>
                        
                        <div className="flex items-center gap-3 pr-2">
                          {isConnected && (
                            <button 
                              onClick={(e) => toggleExpanded(e, provider.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400 transition-colors mr-2"
                            >
                              Models <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                          {isConnected ? (
                            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold tracking-wide">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-400 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isConnected && isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col mt-4 ml-[60px] mr-4 pt-4 border-t border-gray-100 dark:border-gray-800/60" onClick={(e) => e.stopPropagation()}>
                              <div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                                {sortedModels.map((model: string) => (
                                  <div key={model} className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 dark:hover:bg-[#111] rounded-xl transition-colors cursor-pointer group/model">
                                    <span className={`text-sm ${searchQuery && matchesSearch(searchQuery, model) ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>
                                      {model}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* AGGREGATOR SECTION */}
          {aggregatorProviders.length > 0 && (
            <section className="flex flex-col gap-2 md:gap-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">More Providers</h2>
              <div className="flex flex-col gap-3 md:gap-4">
                {aggregatorProviders.map(provider => {
                  const isConnected = connectedProviderIds.includes(provider.id);
                  const displayModels = getProviderModels(provider.id);
                  const sortedModels = [...displayModels].sort((a, b) => {
                    if (!searchQuery) return 0;
                    const aMatch = matchesSearch(searchQuery, a);
                    const bMatch = matchesSearch(searchQuery, b);
                    if (aMatch && !bMatch) return -1;
                    if (!aMatch && bMatch) return 1;
                    return 0;
                  });
                  const isExpanded = expandedProviders.includes(provider.id) || (searchQuery !== '' && displayModels.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())));
                  return (
                    <div 
                      key={provider.id}
                      onClick={() => {
                        setActiveProvider(provider);
                        setApiKeyInput(savedProviders[provider.id]?.apiKey || '');
                        setConnectionError('');
                      }}
                      className={`group relative flex flex-col p-3 md:p-4 bg-white dark:bg-[#0a0a0a] border ${isConnected ? 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.05)]' : 'border-gray-200 dark:border-gray-800 shadow-sm'} rounded-2xl hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer overflow-hidden`}
                    >
                      {isConnected && <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-green-400 to-emerald-500" />}
                      
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-50 dark:bg-white border border-gray-100 dark:border-gray-800 flex items-center justify-center p-1.5 md:p-2 shadow-inner shrink-0">
                            <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain" />
                          </div>
                          <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">{provider.name}</h3>
                        </div>
                        
                        <div className="flex items-center gap-3 pr-2">
                          {isConnected && (
                            <button 
                              onClick={(e) => toggleExpanded(e, provider.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400 transition-colors mr-2"
                            >
                              Models <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                          {isConnected ? (
                            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold tracking-wide">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-400 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isConnected && isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col mt-4 ml-[60px] mr-4 pt-4 border-t border-gray-100 dark:border-gray-800/60" onClick={(e) => e.stopPropagation()}>
                              <div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                                {sortedModels.map((model: string) => (
                                  <div key={model} className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 dark:hover:bg-[#111] rounded-xl transition-colors cursor-pointer group/model">
                                    <span className={`text-sm ${searchQuery && matchesSearch(searchQuery, model) ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>
                                      {model}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {filteredProviders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <Search className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No providers found</h3>
              <p className="text-sm font-medium text-gray-500">Try adjusting your search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* API Key Modal */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {activeProvider && (
            <div className="fixed inset-0 z-[50000] flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
              <div 
                onClick={() => setActiveProvider(null)}
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
              />
              <div 
                className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-5 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/20 shrink-0">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-50 dark:bg-white border border-gray-100 dark:border-gray-800 flex items-center justify-center p-1.5 md:p-2 shadow-inner shrink-0">
                      <img src={activeProvider.logo} alt={activeProvider.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="text-[15px] md:text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">
                        {connectedProviderIds.includes(activeProvider.id) ? `Manage ${activeProvider.name}` : `Connect ${activeProvider.name}`}
                      </h3>
                      <p className="text-[11px] md:text-[13px] text-gray-500 dark:text-gray-400 font-medium mt-0 md:mt-0.5">
                        Setup API Key for {activeProvider.name}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveProvider(null)}
                    className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
                
                {connectedProviderIds.includes(activeProvider.id) ? (
                  <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-6">
                    <div className="flex flex-col items-center justify-center py-2 md:py-4 text-center gap-2 md:gap-3">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-1 md:mb-2">
                        <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                      </div>
                      <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">API Key Connected</h4>
                      <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
                        You are actively connected to {activeProvider.name}.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 md:gap-3 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                      <p className="text-[10px] md:text-xs font-medium text-gray-500 text-center px-2 md:px-4">
                        Disconnecting will permanently delete the stored API key from your browser.
                      </p>
                      <button 
                        onClick={(e) => {
                          disconnectProvider(e, activeProvider.id);
                          setActiveProvider(null);
                        }}
                        className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-xs md:text-sm cursor-pointer"
                      >
                        Disconnect & Delete Key
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveKey} className="p-4 md:p-6 flex flex-col gap-4 md:gap-6">
                    {connectionError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                        {connectionError}
                      </div>
                    )}
                    <div className="flex flex-col gap-2 relative">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] md:text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                          API Key
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                          <Key className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" />
                        </div>
                        <input 
                          type="password" 
                          placeholder="Enter your API key..." 
                          autoFocus
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          className="w-full pl-9 md:pl-11 pr-3 md:pr-4 py-2.5 md:py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div className="mt-1 text-[11px] md:text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Your API key is securely stored locally in your browser. It is never sent to our servers.<br/>
                        {deleteKeysOnRefresh ? (
                          <span className="text-orange-500 dark:text-orange-400 font-medium mt-1 inline-block">Because "Volatile API Keys" setting is ON, this key will be deleted when you refresh or close the site.</span>
                        ) : (
                          <span className="text-green-600 dark:text-green-500 font-medium mt-1 inline-block">Your key will be securely saved across sessions.</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-1 md:pt-2">
                      <button 
                        type="submit"
                        disabled={isConnecting || !apiKeyInput}
                        className="flex items-center justify-center gap-1.5 md:gap-2 w-full md:w-auto px-4 md:px-6 py-2.5 md:py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all text-xs md:text-sm cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isConnecting && <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />}
                        {isConnecting ? 'Verifying...' : 'Save Key'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </main>
  );
}
