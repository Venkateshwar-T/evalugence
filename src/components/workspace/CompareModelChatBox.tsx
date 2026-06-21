'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { estimateTokens, formatTime, formatSpeed } from '@/utils/metrics';
import { ChevronDown, Loader2, Copy, Check, Info } from 'lucide-react';
import { updateCompareModelStats } from '@/utils/storage';
import { Button } from '@/components/ui/Button';

interface CompareModelChatBoxProps {
  modelId: string;
  modelName: string;
  providerId: string;
  isActive: boolean;
  globalMessages: any[];
  apiKey: string;
  config: any;
  onMetricsChange?: (modelId: string, metrics: Record<string, { timeMs: number; tokens: number; ttftMs?: number }>) => void;
  onMessagesChange?: (modelName: string, messages: any[]) => void;
  initialMessages?: any[];
  stopSignal?: number;
  onGeneratingChange?: (modelName: string, isGenerating: boolean) => void;
}

const CompareModelChatBox = ({ modelId, modelName, providerId, isActive, globalMessages, apiKey, config, onMetricsChange, onMessagesChange, initialMessages, stopSignal = 0, onGeneratingChange }: CompareModelChatBoxProps) => {
  const startTimeRef = useRef<number>(0);
  const ttftRef = useRef<number>(0);
  const sessionId = globalMessages.length > 0 ? globalMessages[0].id : 'new';
  const metricsKey = `evalugence_metrics_${sessionId}_${modelName}`;

  const [msgMetrics, setMsgMetrics] = useState<Record<string, { timeMs: number; tokens: number; ttftMs?: number }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(metricsKey);
        if (cached) return JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cached metrics', e);
      }
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(msgMetrics).length > 0) {
      localStorage.setItem(metricsKey, JSON.stringify(msgMetrics));
    }
  }, [msgMetrics, metricsKey]);

  const chat = useChat({
    id: `compare-${modelId}`,
    initialMessages: initialMessages || []
  } as any);

  const { messages: chatMessages, setMessages, status: chatStatus, error: chatError, append } = chat as any;
  const messages = chatMessages || [];
  const status = chatStatus || 'ready';
  const error = chatError;

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, messages.length, setMessages]);
  
  const isLoading = status === 'submitted' || status === 'streaming';
  const prevLoadingRef = useRef(isLoading);

  useEffect(() => {
    if (stopSignal > 0) {
      chat.stop();
    }
  }, [stopSignal]);

  useEffect(() => {
    if (onGeneratingChange) {
      onGeneratingChange(modelName, isLoading);
    }
  }, [isLoading, modelName, onGeneratingChange]);
  
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant') {
      const hasContent = lastMsg.content || (lastMsg.parts && lastMsg.parts.length > 0);
      if (hasContent && startTimeRef.current > 0 && ttftRef.current === 0) {
        ttftRef.current = Date.now() - startTimeRef.current;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (prevLoadingRef.current && !isLoading) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant' && startTimeRef.current > 0) {
        const timeMs = Date.now() - startTimeRef.current;
        let text = lastMsg.content || '';
        if (!text && lastMsg.parts) {
          text = lastMsg.parts.map((p: any) => p.text || p.content || '').join('');
        }
        
        const newMetrics = { timeMs, tokens: estimateTokens(text), ttftMs: ttftRef.current };
        
        setMsgMetrics(prev => {
          return {
            ...prev,
            [lastMsg.id]: {
              ...(prev[lastMsg.id] || {}),
              ...newMetrics
            }
          };
        });

        // Persist to Dashboard (called safely outside setState)
        updateCompareModelStats(
          { id: modelName, name: modelName, providerId: providerId },
          { [lastMsg.id]: newMetrics }
        );
        
        ttftRef.current = 0; // reset
      }
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading, messages, modelName, providerId]);

  // Try to find the append function safely
  const sendMessage = append || (chat as any).append || (chat as any).sendMessage || (() => console.error("No append function found in useChat", Object.keys(chat)));
  
  const lastMsgId = useRef<string | null>(
    initialMessages && initialMessages.length > 0 && globalMessages.length > 0
      ? globalMessages[globalMessages.length - 1].id
      : null
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  useEffect(() => {
    if (!isActive) return;
    const lastMsg = globalMessages[globalMessages.length - 1];
    
    if (lastMsg && lastMsg.role === 'user' && lastMsg.id !== lastMsgId.current) {
      lastMsgId.current = lastMsg.id;
      startTimeRef.current = Date.now();
      ttftRef.current = 0;
      sendMessage(
        { role: 'user', content: lastMsg.content } as any,
        { 
          data: { providerId: providerId, modelName: modelName, apiKey, config },
          headers: {
            'x-provider-id': providerId,
            'x-model-name': modelName,
            'x-api-key': apiKey || '',
            'x-config': JSON.stringify(config || {})
          }
        }
      );
    }
  }, [globalMessages, isActive, providerId, modelName, sendMessage, apiKey, config]);

  useEffect(() => {
    if (onMetricsChange) {
      onMetricsChange(modelId, msgMetrics);
    }
  }, [msgMetrics, modelId, onMetricsChange]);

  useEffect(() => {
    if (onMessagesChange && messages && messages.length > 0) {
      onMessagesChange(modelName, messages);
    }
  }, [messages, modelName, onMessagesChange]);

  if (!isActive) {
    return (
      <div className="h-full flex items-center justify-center text-sm font-medium text-gray-400 p-6 text-center">
        Response turned off. Turn it on to receive future broadcasts.
      </div>
    );
  }

  const aiMessages = messages.filter((m: any) => m.role !== 'user');

  if (messages.length === 0 && status !== 'submitted' && status !== 'streaming') {
    return (
      <div className="h-full flex items-center justify-center text-sm font-medium text-gray-400 p-6">
        Waiting for prompt...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4 custom-scrollbar" ref={scrollRef}>
      {messages.map((m: any, index: number) => {
        if (m.role === 'user') {
          let text = m.content;
          if (!text && m.parts) {
            text = m.parts.map((p: any) => p.text || p.content || '').join('');
          }
          return (
            <div key={m.id} className="flex flex-col items-end w-full group">
              <div className="bg-black dark:bg-white text-white dark:text-black px-6 py-4 rounded-3xl rounded-tr-sm text-[15px] shadow-sm leading-relaxed w-fit max-w-[90%] whitespace-pre-wrap">
                {text}
              </div>
              <div className="flex items-center justify-end w-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity gap-1.5 md:gap-3 mt-0 mr-2">
                <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-gray-400 dark:text-gray-500">
                  <span>{estimateTokens(text).toLocaleString()} tokens</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleCopy(m.id, text)} 
                  className="h-9 w-9 p-0 text-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Copy Prompt"
                >
                  {copiedId === m.id ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          );
        }
        const mMetrics = msgMetrics[m.id];
        
        // Custom Markdown components
        const renderMarkdown = (text: string) => (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-xl overflow-hidden my-4 text-xs"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-gray-100 dark:bg-gray-800 text-pink-500 dark:text-pink-400 px-1.5 py-0.5 rounded-md text-[0.9em]" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {text}
          </ReactMarkdown>
        );

        return (
          <div key={m.id} className="flex flex-col gap-0 group">
            <div className="w-full text-gray-800 dark:text-gray-200 text-[13px] sm:text-sm leading-relaxed max-w-none">
              {m.parts && m.parts.length > 0 ? (
                m.parts.map((p: any, i: number) => {
                  if (p.type === 'reasoning' && p.text) {
                    const isThinking = (status === 'submitted' || status === 'streaming') && index === aiMessages.length - 1 && i === m.parts!.length - 1;
                    return (
                      <details key={i} className="mb-2 w-full group/details">
                        <summary className="cursor-pointer text-[13px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors list-none flex items-center gap-1.5 w-fit select-none">
                          {isThinking ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Thinking...</span>
                            </>
                          ) : (
                            <>
                              <span>Thought Process</span>
                              <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-open/details:-rotate-180" />
                            </>
                          )}
                        </summary>
                        <div className="pt-2 pb-4 text-gray-500 dark:text-gray-400 whitespace-pre-wrap font-mono text-[12px] leading-relaxed pl-2 border-l-2 border-gray-200 dark:border-gray-800 ml-1 mt-1">
                          {p.text}
                        </div>
                      </details>
                    );
                  }
                  if (p.type === 'text' || p.text || p.content) {
                    return (
                      <div key={i} className="prose dark:prose-invert prose-sm sm:prose-base prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
                        {renderMarkdown(p.text || p.content || '')}
                      </div>
                    );
                  }
                  return null;
                })
              ) : (
                <div className="prose dark:prose-invert prose-sm sm:prose-base prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
                  {renderMarkdown(m.content)}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 w-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity mt-0 ml-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  const textToRender = m.parts ? m.parts.map((p: any) => p.text || p.content || '').join('') : m.content;
                  handleCopy(m.id, textToRender);
                }}
                className="h-9 w-9 p-0 text-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Copy Response"
              >
                {copiedId === m.id ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </Button>
              {mMetrics && (
                <div className="flex items-center gap-1.5 md:gap-3 text-[10px] md:text-xs font-medium text-gray-400 dark:text-gray-500">
                  <span>{mMetrics.tokens.toLocaleString()} tokens</span>
                  <span className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                  <span>{formatTime(mMetrics.timeMs)}</span>
                  <span className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                  <span>{formatSpeed(mMetrics.tokens, mMetrics.timeMs)}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {status === 'submitted' && (
        <div className="flex items-center gap-1.5 h-8 mt-2 ml-1">
          <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl text-red-600 dark:text-red-400 text-[13px] mt-2 relative pr-10">
          <p className="font-bold mb-1">Error Generating Response</p>
          <p className="opacity-90">{error.message}</p>
          
          <div className="group/tooltip absolute top-4 right-4 z-[9999]">
            <button className="text-red-400 hover:text-red-600 dark:text-red-500/70 dark:hover:text-red-400 transition-colors cursor-help">
              <Info className="w-4 h-4" />
            </button>
            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-3 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[11px] rounded-xl shadow-2xl p-3 opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:visible invisible transition-all z-[10000]">
              <strong className="block mb-2 text-gray-900 dark:text-gray-100 text-xs">Possible Reasons:</strong>
              <ul className="list-disc pl-4 flex flex-col gap-1 marker:text-gray-400">
                <li>You exceeded API Rate Limits.</li>
                <li>You ran out of API usage Quota.</li>
                <li>Your API Key is invalid.</li>
                <li>The provider's servers are down or experiencing high demand.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(CompareModelChatBox);
