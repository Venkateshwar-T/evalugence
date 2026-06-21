'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import MetricsSideMenu from "@/components/workspace/MetricsSideMenu";
import ChatInterface from "@/components/workspace/ChatInterface";
import ChatHeader from "@/components/workspace/ChatHeader";
import CompareInterface from "@/components/workspace/CompareInterface";
import { saveSession, getSession } from "@/utils/storage";
import GlobalPromptInput from "@/components/workspace/GlobalPromptInput";
import ChooseModelsModal from "@/components/workspace/ChooseModelsModal";
import SelectModelModal from "@/components/workspace/SelectModelModal";
import { useSearchParams, useRouter } from "next/navigation";
import providersData from "@/data/providers.json";
import { useChat } from "@ai-sdk/react";
import { useApiKeys } from "@/hooks/useApiKeys";
import { estimateTokens, formatTime } from "@/utils/metrics";
import { useModelConfig } from "@/hooks/useModelConfig";

import { Suspense } from "react";

let hasHandledReload = false;

function LabContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<'test' | 'compare'>('test');
  const [compareMessages, setCompareMessages] = useState<any[]>([]);
  const [isChooseModelsOpen, setIsChooseModelsOpen] = useState(false);
  const [isSelectModelOpen, setIsSelectModelOpen] = useState(false);
  const [testModel, setTestModel] = useState({ name: 'Select Model', logo: '', id: '' });
  const [selectedCompareModels, setSelectedCompareModels] = useState<string[]>([]);
  const [wiggle, setWiggle] = useState(false);
  const { providers: savedProviders, isLoaded: isProvidersLoaded } = useApiKeys();
  const startTimeRef = useRef<number>(0);
  const ttftRef = useRef<number>(0);
  const [msgMetrics, setMsgMetrics] = useState<Record<string, { timeMs: number; tokens: number; ttftMs?: number }>>({});
  const compareModelMessagesRef = useRef<Record<string, any[]>>({});
  const compareSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [initialCompareMessages, setInitialCompareMessages] = useState<Record<string, any[]>>({});
  const [isCompareMinimized, setIsCompareMinimized] = useState(false);
  const isInitialMountMode = useRef(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const { config: testModelConfig } = useModelConfig(testModel.name === 'Select Model' ? 'global' : testModel.name);

  useEffect(() => {
    const saved = localStorage.getItem('evalugence_test_model');
    if (saved) {
      try {
        setTestModel(JSON.parse(saved));
      } catch (e) {}
    }

    const savedCompare = localStorage.getItem('evalugence_compare_models');
    if (savedCompare) {
      try {
        setSelectedCompareModels(JSON.parse(savedCompare));
      } catch (e) {}
    }

    // Detect if this is a hard refresh
    let isReload = false;
    if (!hasHandledReload && typeof performance !== 'undefined' && performance.getEntriesByType) {
      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === 'reload') {
        isReload = true;
      }
      hasHandledReload = true;
    }

    if (isReload) {
      sessionStorage.removeItem('evalugence_test_messages');
      sessionStorage.removeItem('evalugence_compare_messages');
      sessionStorage.removeItem('evalugence_msg_metrics');
      sessionStorage.removeItem('evalugence_compare_all_messages');
    }

    const savedTestMessages = sessionStorage.getItem('evalugence_test_messages');
    if (savedTestMessages) {
      try {
        setTestMessages(JSON.parse(savedTestMessages));
      } catch (e) {}
    }

    const savedCompareMessages = sessionStorage.getItem('evalugence_compare_messages');
    if (savedCompareMessages) {
      try {
        setCompareMessages(JSON.parse(savedCompareMessages));
      } catch (e) {}
    }
    
    const savedMetrics = sessionStorage.getItem('evalugence_msg_metrics');
    if (savedMetrics) {
      try {
        setMsgMetrics(JSON.parse(savedMetrics));
      } catch (e) {}
    }

    const savedAllCompareMessages = sessionStorage.getItem('evalugence_compare_all_messages');
    if (savedAllCompareMessages) {
      try {
        setInitialCompareMessages(JSON.parse(savedAllCompareMessages));
        compareModelMessagesRef.current = JSON.parse(savedAllCompareMessages);
      } catch (e) {}
    }

    const savedMinimized = sessionStorage.getItem('evalugence_is_compare_minimized');
    if (savedMinimized === 'true') {
      setIsCompareMinimized(true);
    }

    const savedMode = sessionStorage.getItem('evalugence_lab_mode');
    if (savedMode === 'test' || savedMode === 'compare') {
      setMode(savedMode);
    }
    
    setIsMounted(true);
  }, []);

  const previousModelRef = useRef<string | null>(null);

  useEffect(() => {
    if (testModel.id) {
      localStorage.setItem('evalugence_test_model', JSON.stringify(testModel));
      
      if (previousModelRef.current && previousModelRef.current !== testModel.name) {
        setTestMessages((prev: any) => {
          if (prev.length === 0) return prev;
          return [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'data',
              content: `Model switched from ${previousModelRef.current} to ${testModel.name}. No previous memory will be retained from here on.`
            }
          ];
        });
      }
      previousModelRef.current = testModel.name;
    }
  }, [testModel]);

  useEffect(() => {
    if (selectedCompareModels.length > 0) {
      localStorage.setItem('evalugence_compare_models', JSON.stringify(selectedCompareModels));
    }
  }, [selectedCompareModels]);

  // Clean up selected models if their API keys/providers are deleted
  useEffect(() => {
    if (!isProvidersLoaded) return;
    
    // Reset test model if its provider is gone
    if (testModel.id && !savedProviders[testModel.id]) {
      setTestModel({ name: 'Select Model', logo: '', id: '' });
      localStorage.removeItem('evalugence_test_model');
    }

    // Filter compare models that no longer have a provider
    const availableModelNames = new Set(
      Object.values(savedProviders).flatMap(p => p.models)
    );
    const validCompareModels = selectedCompareModels.filter(m => availableModelNames.has(m));
    if (validCompareModels.length !== selectedCompareModels.length) {
      setSelectedCompareModels(validCompareModels);
      if (validCompareModels.length === 0) {
        localStorage.removeItem('evalugence_compare_models');
      } else {
        localStorage.setItem('evalugence_compare_models', JSON.stringify(validCompareModels));
      }
    }
  }, [savedProviders, isProvidersLoaded]);

  const chat = useChat();
  
  const { messages: testMessages, setMessages: setTestMessages, status, error, stop: testStop } = chat;
  const appendTestMessage = (chat as any).append || (chat as any).sendMessage || (() => console.error("No append/sendMessage function found"));

  const [compareStopSignal, setCompareStopSignal] = useState(0);
  const [isCompareGenerating, setIsCompareGenerating] = useState(false);

  useEffect(() => {
    const lastMsg = testMessages[testMessages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant') {
      const msgAny = lastMsg as any;
      const hasContent = msgAny.content || (msgAny.parts && msgAny.parts.length > 0);
      if (hasContent && startTimeRef.current > 0 && ttftRef.current === 0) {
        ttftRef.current = Date.now() - startTimeRef.current;
      }
    }
  }, [testMessages]);

  const isLoading = status === 'submitted' || status === 'streaming';
  const prevLoadingRef = useRef(isLoading);

  useEffect(() => {
    if (testMessages.length > 0) {
      sessionStorage.setItem('evalugence_test_messages', JSON.stringify(testMessages));
    } else {
      sessionStorage.removeItem('evalugence_test_messages');
    }
  }, [testMessages]);

  useEffect(() => {
    if (compareMessages.length > 0) {
      sessionStorage.setItem('evalugence_compare_messages', JSON.stringify(compareMessages));
    } else {
      sessionStorage.removeItem('evalugence_compare_messages');
    }
  }, [compareMessages]);

  useEffect(() => {
    if (Object.keys(msgMetrics).length > 0) {
      sessionStorage.setItem('evalugence_msg_metrics', JSON.stringify(msgMetrics));
    } else {
      sessionStorage.removeItem('evalugence_msg_metrics');
    }
  }, [msgMetrics]);

  useEffect(() => {
    sessionStorage.setItem('evalugence_is_compare_minimized', isCompareMinimized.toString());
  }, [isCompareMinimized]);
  useEffect(() => {
    if (isInitialMountMode.current) {
      isInitialMountMode.current = false;
      return;
    }
    sessionStorage.setItem('evalugence_lab_mode', mode);
  }, [mode]);
  
  useEffect(() => {
    if (prevLoadingRef.current && !isLoading) {
      // Stream just finished
      const lastMsg = testMessages[testMessages.length - 1];
      let updatedMetrics = msgMetrics;
      
      if (lastMsg && lastMsg.role === 'assistant' && startTimeRef.current > 0) {
        const timeMs = Date.now() - startTimeRef.current;
        const msgAny = lastMsg as any;
        let text = msgAny.content || '';
        if (!text && lastMsg.parts) {
          text = lastMsg.parts.map((p: any) => p.text || p.content || '').join('');
        }
        
        updatedMetrics = {
          ...msgMetrics,
          [lastMsg.id]: { 
            ...(msgMetrics[lastMsg.id] || {}),
            timeMs, 
            tokens: estimateTokens(text), 
            ttftMs: ttftRef.current 
          }
        };
        
        setMsgMetrics(updatedMetrics);
        ttftRef.current = 0; // reset
      }

      if (mode === 'test' && testMessages.length > 0) {
        saveSession({
          id: testMessages[0].id || Date.now().toString(),
          type: 'test',
          timestamp: Date.now(),
          models: [testModel].filter(m => m.id).map(m => ({ id: m.name, name: m.name, logo: m.logo, providerId: m.id })),
          messages: testMessages,
          metrics: updatedMetrics
        });
      }
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading, mode, testMessages, testModel]);

  // Handle Resuming Sessions and Using Saved Prompts
  useEffect(() => {
    const resumeId = searchParams.get('resume');
    if (resumeId) {
      getSession(resumeId).then(session => {
        if (session) {
          setMode(session.type);
          if (session.type === 'test') {
            setTestMessages(session.messages);
            if (session.models.length > 0) {
              previousModelRef.current = session.models[0].name; // Prevent "Model switched" wipe
              setTestModel({ 
                name: session.models[0].name, 
                logo: session.models[0].logo, 
                id: session.models[0].providerId || session.models[0].id // Fallback for older sessions
              });
            }
            if (session.metrics) setMsgMetrics(session.metrics);
          } else {
            // Restore compare session
            setSelectedCompareModels(session.models.map(m => m.name));
            setCompareMessages(session.messages);
            if (session.compareModelMessages) {
              setInitialCompareMessages(session.compareModelMessages);
            }
          }
          // Remove param from URL without triggering Next.js route reload
          window.history.replaceState(null, '', '/lab');
        }
      });
    }

    const pendingPrompt = localStorage.getItem('evalugence_pending_prompt');
    if (pendingPrompt) {
      // Auto-trigger send with this prompt if in test mode
      localStorage.removeItem('evalugence_pending_prompt');
      setTimeout(() => {
        handleSend(pendingPrompt);
      }, 500);
    }
  }, [searchParams, router]);

  const hasStarted = mode === 'test' ? testMessages.length > 0 : compareMessages.length > 0;
  const currentMessages = mode === 'test' ? testMessages : compareMessages;

  let activeStartIndex = 0;
  for (let i = currentMessages.length - 1; i >= 0; i--) {
    if (currentMessages[i].role === 'data' && (currentMessages[i].content as string)?.includes('Model switched')) {
      activeStartIndex = i + 1;
      break;
    }
  }
  const activeMessages = currentMessages.slice(activeStartIndex);

  const totalPromptTokens = activeMessages
    .filter(m => m.role === 'user')
    .reduce((sum, m) => {
      let text = m.content || m.text || '';
      if (!text && m.parts) text = m.parts.map((p: any) => p.text || p.content || '').join('');
      return sum + estimateTokens(text);
    }, 0);

  const totalGeneratedTokens = activeMessages
    .filter(m => m.role === 'assistant')
    .reduce((sum, m) => sum + (msgMetrics[m.id]?.tokens || 0), 0);

  const totalTokens = totalPromptTokens + totalGeneratedTokens;
  const maxTokens = 128000; // Default or could be fetched from localStorage evalugence_model_metadata
  const contextPercentage = Math.min(100, Math.round((totalTokens / maxTokens) * 100));
  const estimatedCost = (totalPromptTokens * 0.000005) + (totalGeneratedTokens * 0.000015);

  const activeAssistantMessages = activeMessages.filter(m => m.role === 'assistant');
  const activeTotalResponseTime = activeAssistantMessages.reduce((sum, m) => sum + (msgMetrics[m.id]?.timeMs || 0), 0);
  const totalResponseTimeSec = activeTotalResponseTime / 1000;
  const averageSpeed = totalResponseTimeSec > 0 ? (totalGeneratedTokens / totalResponseTimeSec).toFixed(1) : '0.0';

  const latencyMessages = activeAssistantMessages.filter(m => msgMetrics[m.id]?.ttftMs);
  const activeTotalLatency = latencyMessages.reduce((sum, m) => sum + (msgMetrics[m.id]?.ttftMs || 0), 0);
  const averageLatencyMs = latencyMessages.length > 0 ? Math.round(activeTotalLatency / latencyMessages.length) : 0;

  const handleCompareMessagesSync = useCallback((messages: Record<string, any[]>) => {
    compareModelMessagesRef.current = messages;
    sessionStorage.setItem('evalugence_compare_all_messages', JSON.stringify(messages));
    
    if (compareSaveTimeoutRef.current) clearTimeout(compareSaveTimeoutRef.current);
    compareSaveTimeoutRef.current = setTimeout(() => {
      if (mode === 'compare' && compareMessages.length > 0) {
        saveSession({
          id: compareMessages[0].id || Date.now().toString(),
          type: 'compare',
          timestamp: Date.now(),
          models: selectedCompareModels.map(name => {
            const found = providersData.flatMap(p => p.models).find(m => m === name);
            // Re-find provider id, logo
            const pInfo = providersData.find(p => p.models.includes(name));
            return { id: name, name: name, logo: pInfo?.logo || '', providerId: pInfo?.id || '' };
          }),
          messages: compareMessages,
          compareModelMessages: compareModelMessagesRef.current
        });
      }
    }, 2000);
  }, [compareMessages, mode, selectedCompareModels]);

  const handleSend = (msg: string) => {
    if (mode === 'test') {
      if (testModel.name === 'Select Model' || !testModel.id) {
        setWiggle(true);
        setTimeout(() => setWiggle(false), 500);
        return;
      }
      const currentApiKey = savedProviders[testModel.id]?.apiKey;
      startTimeRef.current = Date.now();
      ttftRef.current = 0;
      
      const newMessageTokens = estimateTokens(msg);
      if (totalTokens + newMessageTokens > maxTokens) {
        setTestMessages(prev => [...prev, {
          id: Date.now().toString() + '-err',
          role: 'data',
          content: `Error: Message exceeds configured context window of ${maxTokens} tokens. Please clear chat or increase the limit in settings.`
        } as any]);
        return;
      }
      
      appendTestMessage(
        { 
          role: 'user', 
          content: msg
        } as any,
        ({ 
          data: { providerId: testModel.id, modelName: testModel.name, apiKey: currentApiKey, config: testModelConfig },
          headers: {
            'x-provider-id': testModel.id,
            'x-model-name': testModel.name,
            'x-api-key': currentApiKey || '',
            'x-config': JSON.stringify(testModelConfig || {})
          }
        } as any)
      );
    } else {
      if (selectedCompareModels.length < 2) {
        setWiggle(true);
        setTimeout(() => setWiggle(false), 500);
        return;
      }
      
      // Force the chat view to open (expand) whenever a new prompt is sent
      setIsCompareMinimized(false);

      setCompareMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'user', 
        content: msg
      } as any]);
    }
  };

  const toggleCompareModel = (modelName: string) => {
    setSelectedCompareModels(prev => 
      prev.includes(modelName) 
        ? prev.filter(m => m !== modelName)
        : [...prev, modelName]
    );
  };

  if (!isMounted || !isProvidersLoaded) {
    return <div className="flex w-full h-[100dvh] items-center justify-center bg-gray-50/30 dark:bg-black/30" />;
  }

  return (
    <main className={`flex-1 flex flex-col w-full ${(mode === 'compare' && !isCompareMinimized) ? 'h-[100dvh] overflow-hidden' : (hasStarted ? 'min-h-[100dvh] pb-24 md:pb-32' : 'h-[100dvh] overflow-hidden')} pt-[80px] md:pt-24 bg-gray-50/30 dark:bg-black/30 relative px-4 md:px-6 lg:px-8`}>
      {/* Global Background Glow for Active Modes */}
      {(
        (mode === 'compare' && compareMessages.length > 0 && !isCompareMinimized) ||
        (mode === 'test' && testMessages.length > 0)
      ) && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
          <div className="absolute top-[-5%] right-[-5%] w-[60vw] max-w-[800px] h-[800px] bg-blue-500/15 blur-[150px] rounded-full" />
          <div className="absolute top-[20%] left-[-10%] w-[60vw] max-w-[600px] h-[600px] bg-purple-500/15 blur-[150px] rounded-full" />
          <div className="absolute bottom-[10%] right-[-10%] w-[60vw] max-w-[600px] h-[600px] bg-green-500/15 blur-[150px] rounded-full" />
        </div>
      )}
      
      <div className="flex flex-col w-full mx-auto flex-1 min-h-0 relative z-10 max-w-full">
        
        {/* Header Section */}
        {!(hasStarted && mode === 'compare' && !isCompareMinimized) && (
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 shrink-0 gap-4 max-w-7xl mx-auto w-full relative z-50">
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Lab</h1>
              <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 md:mt-2">Workspace</p>
            </div>

            <div className="flex flex-row sm:items-center gap-1 bg-white dark:bg-[#0a0a0a] p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm w-full sm:w-fit overflow-x-auto hide-scrollbar shrink-0">
              <button 
                onClick={() => setMode('test')}
                className={`relative flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap z-10 ${mode === 'test' ? 'text-white dark:text-black' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'}`}
              >
                {mode === 'test' && (
                  <motion.div layoutId="labTab" className="absolute inset-0 bg-black dark:bg-white rounded-lg shadow-md -z-10" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                )}
                Test Model
              </button>
              <button 
                onClick={() => setMode('compare')}
                className={`relative flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap z-10 ${mode === 'compare' ? 'text-white dark:text-black' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'}`}
              >
                {mode === 'compare' && (
                  <motion.div layoutId="labTab" className="absolute inset-0 bg-black dark:bg-white rounded-lg shadow-md -z-10" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                )}
                Compare Models
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Content Area */}
        <div className="flex-1 w-full grid grid-cols-1 grid-rows-1 relative min-h-0">
          {/* Test Mode */}
          <div className={`col-start-1 row-start-1 w-full h-full flex flex-col transition-all duration-300 ${mode === 'test' ? 'opacity-100 z-10 pointer-events-auto relative' : 'opacity-0 -z-10 pointer-events-none absolute inset-0'}`}>
            {testMessages.length === 0 ? (
              <div className="w-full flex-1 flex flex-col items-center justify-center gap-3 md:gap-6 -translate-y-16 md:-translate-y-20 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[800px] h-[300px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-[100px] rounded-[100%] pointer-events-none -z-10" />
                <div className="w-fit mx-auto relative z-[60]">
                  <ChatHeader 
                    isStandalone 
                    modelName={testModel.name} 
                    providerLogo={testModel.logo} 
                    onOpenSelectModal={() => setIsSelectModelOpen(true)} 
                    wiggle={wiggle}
                  />
                </div>
                <GlobalPromptInput isFixed={false} onSend={handleSend} placeholder="Type a prompt..." />
              </div>
            ) : (
              <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col gap-6">
                <div className="sticky top-[72px] md:top-20 w-fit mx-auto z-[60] shrink-0 transition-all">
                  <ChatHeader 
                    modelName={testModel.name}
                    providerLogo={testModel.logo}
                    onOpenSelectModal={() => setIsSelectModelOpen(true)}
                    onNewChat={() => {
                      setTestMessages([]);
                      setMsgMetrics({});
                    }}
                    wiggle={wiggle}
                  />
                </div>
                <div className="flex flex-1 relative z-10 w-full gap-6">
                  <div className="flex-1 min-w-0">
                    <ChatInterface 
                      messages={testMessages as any} 
                      isLoading={isLoading} 
                      error={error} 
                      modelName={testModel.name} 
                      providerLogo={testModel.logo}
                      msgMetrics={msgMetrics}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Compare Mode */}
          <div className={`col-start-1 row-start-1 w-full h-full flex flex-col transition-all duration-300 ${mode === 'compare' ? 'opacity-100 z-10 pointer-events-auto relative' : 'opacity-0 -z-10 pointer-events-none absolute inset-0'}`}>
            {compareMessages.length === 0 ? (
              <div className="w-full flex-1 flex flex-col items-center justify-center gap-3 md:gap-6 -translate-y-16 md:-translate-y-20 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[800px] h-[300px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-[100px] rounded-[100%] pointer-events-none -z-10" />
                <div className={`w-fit mx-auto flex items-center px-1 py-1 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border ${wiggle ? 'border-red-500 shadow-red-500/20' : 'border-gray-200/80 dark:border-gray-800/80'} rounded-full shadow-lg relative z-50 transition-colors gap-3`}>
                  <button 
                    onClick={() => setIsChooseModelsOpen(true)}
                    className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 text-gray-900 dark:text-gray-100 transition-all active:scale-95 cursor-pointer"
                  >
                    {(() => {
                      const modelsToRender = Object.entries(savedProviders).flatMap(([providerId, data]) => {
                        const pInfo = providersData.find(p => p.id === providerId);
                        return data.models.map(m => ({ name: m, logo: pInfo?.logo || '' }));
                      }).filter(m => selectedCompareModels.includes(m.name)).slice(0, 3);

                      if (modelsToRender.length === 0) return null;

                      return (
                        <div className="flex items-center -space-x-2 mr-0.5">
                          {modelsToRender.map((model, i) => (
                            <div key={i} className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white dark:border-[#0a0a0a] bg-white flex items-center justify-center shadow-sm overflow-hidden relative">
                              <img src={model.logo} alt={model.name} className="w-3.5 h-3.5 md:w-4 md:h-4 object-contain" />
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    <span className="font-bold text-[12px] md:text-[14px] tracking-wide">
                      {selectedCompareModels.length > 0 ? `${selectedCompareModels.length} Models` : 'Choose Models'}
                    </span>
                  </button>
                </div>
                <GlobalPromptInput 
                  isFixed={false} 
                  onSend={handleSend} 
                  placeholder="Type a prompt..."
                  isGenerating={isCompareGenerating}
                  onStop={() => setCompareStopSignal(s => s + 1)}
                />
              </div>
            ) : (
              <>
                <div className={`w-full fixed top-[64px] md:top-[88px] bottom-[120px] left-0 right-0 z-10 flex flex-col px-0 md:px-6 lg:px-8 ${isCompareMinimized ? 'hidden' : ''}`}>
                  <CompareInterface 
                    initialModelNames={selectedCompareModels} 
                    globalMessages={compareMessages}
                    onReset={() => {
                      setSelectedCompareModels([]);
                      setCompareMessages([]);
                      setInitialCompareMessages({});
                    }}
                    onOpenModal={() => setIsChooseModelsOpen(true)}
                    onUpdateModelNames={setSelectedCompareModels}
                    mode={mode}
                    setMode={setMode}
                    onExit={() => {
                      setMode('test');
                      setCompareMessages([]);
                      setInitialCompareMessages({});
                      setIsCompareMinimized(false);
                    }}
                    onMinimize={() => setIsCompareMinimized(true)}
                    isMinimized={isCompareMinimized}
                    initialCompareMessages={initialCompareMessages}
                    onCompareMessagesSync={handleCompareMessagesSync}
                    stopSignal={compareStopSignal}
                    onGeneratingChange={setIsCompareGenerating}
                  />
                </div>
                {isCompareMinimized && (
                  <div className="w-full flex-1 flex flex-col items-center justify-center gap-6 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[800px] h-[300px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-[100px] rounded-[100%] pointer-events-none -z-10" />
                    <div className="flex flex-col items-center gap-4 md:gap-6 relative z-50 px-4">

                      <div className="text-center">
                        <h2 className="text-base md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">Active Compare Session in Progress</h2>
                        <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">You have {selectedCompareModels.length} models active in the current session.</p>
                      </div>
                      <div className="flex gap-3 md:gap-4">
                        <button 
                          onClick={() => setIsCompareMinimized(false)} 
                          className="px-4 md:px-6 py-1.5 md:py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs md:text-sm font-bold shadow-md cursor-pointer transition-transform hover:scale-105"
                        >
                          Expand Session
                        </button>
                        <button 
                          onClick={() => {
                            setCompareMessages([]);
                            setIsCompareMinimized(false);
                            setInitialCompareMessages({});
                            sessionStorage.removeItem('evalugence_compare_all_messages');
                          }} 
                          className="px-4 md:px-6 py-1.5 md:py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-full text-xs md:text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
                        >
                          Close Session
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {(hasStarted && (mode === 'test' || !isCompareMinimized)) && (
        <GlobalPromptInput 
          isFixed={true} 
          placeholder="Type a prompt..." 
          onSend={handleSend}
          isGenerating={mode === 'test' ? isLoading : isCompareGenerating}
          onStop={() => {
            if (mode === 'test') {
              testStop();
            } else {
              setCompareStopSignal(s => s + 1);
            }
          }}
        />
      )}
      {mode === 'test' && hasStarted && (
        <MetricsSideMenu 
          contextPercentage={contextPercentage}
          totalTokens={totalTokens}
          maxTokens={maxTokens}
          totalPromptTokens={totalPromptTokens}
          totalGeneratedTokens={totalGeneratedTokens}
          averageSpeed={averageSpeed}
          averageLatencyMs={averageLatencyMs}
        />
      )}
      <ChooseModelsModal 
        isOpen={isChooseModelsOpen} 
        onClose={() => setIsChooseModelsOpen(false)} 
        selectedModels={selectedCompareModels} 
        onConfirm={setSelectedCompareModels} 
      />
      <SelectModelModal 
        isOpen={isSelectModelOpen} 
        onClose={() => setIsSelectModelOpen(false)}
        onSelectModel={async (name, logo, id) => {
          setTestModel({ name, logo, id });

          // --- METADATA FETCH ---
          const apiKey = savedProviders[id]?.apiKey;
          if (!apiKey) {
            console.log(`[Metadata Check] No API key for ${id}`);
            return;
          }
          try {
            const res = await fetch('/api/metadata', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ providerId: id, apiKey, modelName: name })
            });
            const result = await res.json();
            
            if (result.success && result.metadata) {
              const modelData = result.metadata;

              // Save the full metadata
              const metaCache = JSON.parse(localStorage.getItem('evalugence_model_metadata') || '{}');
              metaCache[name] = modelData;
              localStorage.setItem('evalugence_model_metadata', JSON.stringify(metaCache));
            }
          } catch (e) {
            console.error('[Metadata Check] Error fetching:', e);
          }
        }}
        selectedModelName={testModel.name}
      />
    </main>
  );
}

export default function LabPage() {
  return (
    <Suspense fallback={<div className="flex w-full h-screen items-center justify-center">Loading...</div>}>
      <LabContent />
    </Suspense>
  );
}
