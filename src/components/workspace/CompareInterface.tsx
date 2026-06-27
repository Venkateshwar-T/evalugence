'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize2, Plus, X, Power, Database, Globe } from 'lucide-react';
import CompareModelChatBox from './CompareModelChatBox';
import SystemPromptModal from './SystemPromptModal';
import CompareMetricsSideMenu from './CompareMetricsSideMenu';
import ModelMetadataViewer from './ModelMetadataViewer';
import SelectModelModal from './SelectModelModal';
import ThemeToggle from '../ThemeToggle';
import providersData from '@/data/providers.json';
import { useApiKeys } from '@/hooks/useApiKeys';
import { createPortal } from 'react-dom';
import { formatModelName } from '@/utils/formatters';



interface CompareModel {
  id: string; // Box ID
  name: string;
  logo: string;
  providerId: string;
  isActive: boolean;
}

interface CompareInterfaceProps {
  initialModelNames?: string[];
  globalMessages?: any[];
  onReset?: () => void;
  onOpenModal?: () => void;
  onUpdateModelNames?: (names: string[]) => void;
  mode?: 'test' | 'compare';
  setMode?: (mode: 'test' | 'compare') => void;
  onExit?: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  initialCompareMessages?: Record<string, any[]>;
  onCompareMessagesSync?: (messages: Record<string, any[]>) => void;
  stopSignal?: number;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

export default function CompareInterface({ 
  initialModelNames = [], 
  globalMessages = [], 
  onReset, 
  onOpenModal, 
  onUpdateModelNames,
  mode = 'compare',
  setMode,
  onExit,
  onMinimize,
  isMinimized = false,
  initialCompareMessages = {},
  onCompareMessagesSync,
  stopSignal = 0,
  onGeneratingChange
}: CompareInterfaceProps) {
  const { providers: savedProviders } = useApiKeys();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [viewingMetadataModel, setViewingMetadataModel] = useState<string | null>(null);
  const [changingModelId, setChangingModelId] = useState<string | null>(null);
  const [configObj, setConfigObj] = useState<any>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const configObjStr = localStorage.getItem('evalugence_config_global');
      setConfigObj(configObjStr ? JSON.parse(configObjStr) : {});
    }
  }, [isConfigOpen]); // Refresh config when config modal closes

  // Build master connected models list
  const connectedModels = Object.entries(savedProviders).flatMap(([providerId, data]) => {
    const pInfo = providersData.find(p => p.id === providerId);
    return data.models.map(m => ({
      name: m,
      providerId,
      providerName: pInfo?.name || providerId,
      logo: pInfo?.logo || '',
    }));
  });

  const [models, setModels] = useState<CompareModel[]>([]);
  const [compareMetrics, setCompareMetrics] = useState<Record<string, Record<string, { timeMs: number; tokens: number }>>>({});
  const [allModelMessages, setAllModelMessages] = useState<Record<string, any[]>>(initialCompareMessages);
  const [generatingModels, setGeneratingModels] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (onGeneratingChange) {
      const isAnyGenerating = Object.values(generatingModels).some(isGen => isGen);
      onGeneratingChange(isAnyGenerating);
    }
  }, [generatingModels, onGeneratingChange]);

  const handleGeneratingChange = useCallback((modelName: string, isGenerating: boolean) => {
    setGeneratingModels(prev => ({
      ...prev,
      [modelName]: isGenerating
    }));
  }, []);

  const handleMetricsChange = useCallback((modelId: string, metrics: Record<string, { timeMs: number; tokens: number }>) => {
    setCompareMetrics(prev => ({
      ...prev,
      [modelId]: metrics
    }));
  }, []);

  const handleMessagesChange = useCallback((modelName: string, messages: any[]) => {
    setAllModelMessages(prev => ({ ...prev, [modelName]: messages }));
  }, []);

  useEffect(() => {
    if (onCompareMessagesSync) {
      onCompareMessagesSync(allModelMessages);
    }
  }, [allModelMessages, onCompareMessagesSync]);

  // Sync models state with incoming selections from Modal
  useEffect(() => {
    if (!initialModelNames) return;
    setModels(prev => {
      // Keep existing models that are still selected (preserve their isActive state & IDs)
      const keptModels = prev.filter(m => initialModelNames.includes(m.name));
      const keptNames = keptModels.map(m => m.name);
      
      // Add newly selected models
      const newlyAddedNames = initialModelNames.filter(name => !keptNames.includes(name));
      const newlyAdded = newlyAddedNames.map((name, index) => {
        const found = connectedModels.find(m => m.name === name);
        return {
          id: `box-${Date.now()}-${index}-${Math.random()}`,
          name: name,
          logo: found?.logo || '',
          providerId: found?.providerId || '',
          isActive: true
        };
      });
      
      return [...keptModels, ...newlyAdded];
    });
  }, [initialModelNames]); // connectedModels not in deps to avoid unnecessary re-renders, assuming they rarely change

  const addModel = () => {
    if (onOpenModal) onOpenModal();
  };

  const removeModel = (id: string) => {
    const nextModels = models.filter(m => m.id !== id);
    setModels(nextModels);
    
    if (onUpdateModelNames) {
      onUpdateModelNames(nextModels.map(m => m.name));
    }

    if (nextModels.length === 0 && onReset) {
      onReset();
    }
  };

  const toggleModelActive = (id: string) => {
    setModels(models.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m));
  };

  const handleSwapModel = (newModelName: string, providerLogo: string, providerId: string) => {
    if (!changingModelId) return;

    if (models.some(m => m.name === newModelName && m.id !== changingModelId)) {
      // Model is already in another box, just close
      setChangingModelId(null);
      return;
    }

    const nextModels = models.map(m => {
      if (m.id === changingModelId) {
        return { ...m, name: newModelName, logo: providerLogo, providerId: providerId };
      }
      return m;
    });

    setModels(nextModels);
    
    if (onUpdateModelNames) {
      onUpdateModelNames(nextModels.map(m => m.name));
    }
    setChangingModelId(null);
  };

  const containerClass = "flex-1 flex gap-2 md:gap-4 overflow-x-auto w-full items-stretch min-h-0 scroll-smooth snap-x snap-mandatory px-0 md:px-6 pb-0 md:pb-2 before:content-[''] md:before:m-auto after:content-[''] md:after:m-auto";
  const boxClass = "min-w-full w-full md:min-w-[600px] md:w-[600px] flex-shrink-0 snap-center md:snap-none";

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full relative">
      {/* FULL SCREEN MODE TOP BAR - Rendered at document.body level via Portal to bypass stacking contexts */}
      {!isMinimized && globalMessages.length > 0 && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 z-[9999] flex items-center justify-between px-3 md:px-6 shadow-sm">
          {/* Left: Context & Branding */}
          <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-3">
            <span className="font-extrabold text-base md:text-lg tracking-tight text-gray-900 dark:text-white">Lab</span>
            <div className="hidden md:block h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
            <span className="text-[10px] md:text-[13px] font-bold text-gray-600 dark:text-gray-300 md:mt-0 leading-tight">Compare Models</span>
          </div>

          {/* Center: Core Workspace Actions */}
          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 bg-gray-100/50 dark:bg-gray-900/50 p-1 rounded-full border border-gray-200/50 dark:border-gray-800/50 shadow-inner backdrop-blur-sm">
            <button 
              onClick={addModel}
              disabled={models.length >= 6}
              className="flex items-center gap-1 md:gap-2 px-2.5 md:px-4 py-1.5 md:py-1.5 text-[13px] font-bold bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> 
              <span className="hidden md:inline">Add Model</span>
              <span className="text-gray-500 dark:text-gray-400 font-medium text-[9px] md:text-[11px] bg-gray-100 dark:bg-gray-800 px-1 md:px-1.5 py-0.5 rounded-md md:ml-1">
                {models.filter(m => m.isActive).length}/6<span className="hidden md:inline"> Active</span>
              </span>
            </button>


            <div className="relative group/config">
              <button 
                onClick={() => setIsConfigOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">System Prompt</span>
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 p-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/config:opacity-100 transition-all z-50 text-center">
                System Prompt
              </div>
            </div>
          </div>

          {/* Right: Window Controls & Display */}
          <div className="flex items-center gap-1 md:gap-4">
            <div className="hidden md:block"><ThemeToggle /></div>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>
            <button
              onClick={onMinimize}
              className="p-1.5 md:p-2 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="Minimize"
            >
              <Minimize2 className="w-5 h-5 md:w-5 md:h-5" />
            </button>
            <button
              onClick={onExit}
              className="p-1.5 md:px-4 md:py-1.5 rounded-full md:rounded-lg text-[13px] font-bold transition-all cursor-pointer border border-transparent md:border-gray-200 dark:md:border-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 md:bg-white md:dark:bg-[#0a0a0a] shadow-none md:shadow-sm flex items-center justify-center"
            >
              <X className="w-5 h-5 block md:hidden" />
              <span className="hidden md:block">Exit</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Model Metadata Viewer Modal */}
      {viewingMetadataModel && (
        <ModelMetadataViewer 
          isOpen={!!viewingMetadataModel} 
          onClose={() => setViewingMetadataModel(null)} 
          modelName={viewingMetadataModel} 
        />
      )}

      {/* Global Configuration Panel Modal */}
      <SystemPromptModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        modelName="global" 
      />

      <SelectModelModal
        isOpen={!!changingModelId}
        onClose={() => setChangingModelId(null)}
        onSelectModel={handleSwapModel}
        selectedModelName={changingModelId ? models.find(m => m.id === changingModelId)?.name : undefined}
      />

      {/* Response Boxes Area */}
      <div className={containerClass}>
        <AnimatePresence mode="popLayout">
          {models.map((model) => {
            // Dynamically look up the latest provider info to prevent stale state from hydration
            const foundConnected = connectedModels.find(m => m.name === model.name);
            const activeProviderId = foundConnected?.providerId || model.providerId;
            const activeLogo = foundConnected?.logo || model.logo;
            const apiKey = activeProviderId ? (savedProviders[activeProviderId]?.apiKey || '') : '';

            return (
              <motion.div 
                key={model.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`flex flex-col bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-800/50 rounded-none md:rounded-xl overflow-hidden h-full ${boxClass} ${!model.isActive ? 'opacity-40 grayscale transition-all' : 'transition-all group/box'}`}
              >
                {/* Box Header */}
                <div className="flex items-center justify-between px-4 py-1.5 md:py-3 bg-gray-50/30 dark:bg-gray-900/10 border-b border-gray-100/50 dark:border-gray-800/30 relative z-20 shrink-0">
                  <div className="relative">
                    <button 
                      onClick={() => setChangingModelId(model.id)}
                      title="Change Model"
                      className="flex items-center gap-2.5 hover:bg-gray-200/40 dark:hover:bg-gray-800/40 py-1.5 px-2 pr-4 rounded-xl transition-all cursor-pointer group backdrop-blur-sm"
                    >
                      <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full shrink-0 shadow-sm border border-gray-200">
                        {activeLogo && <img src={activeLogo} alt={model.name} className="w-3.5 h-3.5 object-contain" />}
                      </div>
                      <span className="font-extrabold text-[13px] md:text-[15px] text-gray-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {formatModelName(model.name)}
                      </span>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setViewingMetadataModel(model.name)}
                      title="View Model Metadata"
                      className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
                    >
                      <Database className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => toggleModelActive(model.id)}
                      title={model.isActive ? "Turn Off" : "Turn On"}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${model.isActive ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => removeModel(model.id)}
                      title="Remove Model"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Box Content (Response) */}
                <div className="flex-1 min-h-0 bg-transparent">
                  <CompareModelChatBox 
                    modelId={model.id}
                    modelName={model.name}
                    providerId={activeProviderId}
                    isActive={model.isActive}
                    globalMessages={globalMessages} 
                    apiKey={apiKey}
                    config={configObj}
                    onMetricsChange={handleMetricsChange}
                    onMessagesChange={handleMessagesChange}
                    initialMessages={initialCompareMessages[model.name]}
                    stopSignal={stopSignal}
                    onGeneratingChange={handleGeneratingChange}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Evaluation Metrics Side Menu */}
      {globalMessages.length > 0 && !isMinimized && (
        <CompareMetricsSideMenu 
          compareMetrics={compareMetrics}
          models={models.map(m => {
            const foundConnected = connectedModels.find(c => c.name === m.name);
            return { ...m, logo: foundConnected?.logo || m.logo };
          })}
          globalMessages={globalMessages}
        />
      )}
    </div>
  );
}
