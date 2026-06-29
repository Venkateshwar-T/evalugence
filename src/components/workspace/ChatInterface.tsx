'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check, ChevronDown, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatTime, formatSpeed, estimateTokens } from '@/utils/metrics';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system' | 'data';
  content: string;
}

interface ChatInterfaceProps {
  modelName?: string;
  providerLogo?: string;
  messages?: Message[];
  isLoading?: boolean;
  error?: Error | undefined;
  msgMetrics?: Record<string, { timeMs: number; tokens: number }>;
}

const ChatInterface = ({ 
  modelName = 'Gemini', 
  providerLogo = '/brands/google.png',
  messages = [],
  isLoading = false,
  error,
  msgMetrics = {}
}: ChatInterfaceProps) => {
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [waitState, setWaitState] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    if (isLoading) {
      timer1 = setTimeout(() => {
        setWaitState(1);
      }, 5000);
      timer2 = setTimeout(() => {
        setWaitState(2);
      }, 15000);
    } else {
      setWaitState(0);
    }
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isLoading]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView();
    }
  }, [messages]);

  const extractText = (msg: Message) => {
    if (msg.content) return msg.content;
    const msgAny = msg as any;
    if (msgAny.parts) return msgAny.parts.map((p: any) => p.text || p.content || '').join('');
    return '';
  };

  const renderMessageContent = (msg: Message, isThinking: boolean = false) => {
    const msgAny = msg as any;

    if (msgAny.parts && Array.isArray(msgAny.parts)) {
      return msgAny.parts.map((p: any, i: number) => {
        const reasoningText = p.reasoning || (p.type === 'reasoning' ? p.text : null);
        if (p.type === 'reasoning' && reasoningText) {
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
                {reasoningText}
              </div>
            </details>
          );
        }
        if (p.type === 'text') {
          if (msg.role === 'user') {
            return <span key={i}>{p.text}</span>;
          }
          return (
            <div key={i} className="prose dark:prose-invert max-w-none prose-sm sm:prose-base prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="rounded-xl my-4 overflow-hidden border border-gray-200 dark:border-gray-800 bg-[#1e1e1e]">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{match[1]}</span>
                          <button 
                            onClick={() => navigator.clipboard.writeText(String(children))}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <SyntaxHighlighter
                          {...props}
                          style={vscDarkPlus as any}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code {...props} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md text-[13px] font-mono text-gray-900 dark:text-gray-100 before:content-none after:content-none">
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {p.text}
              </ReactMarkdown>
            </div>
          );
        }
        return <span key={i}>{p.text || p.content || ''}</span>;
      });
    }
    const msgAny2 = msg as any;
    return msgAny2.content || msgAny2.text || '';
  };

  return (
    <div className="flex flex-col w-[calc(100%+2rem)] -mx-4 md:mx-0 md:w-full border-0 md:border md:border-gray-200 dark:md:border-gray-800 rounded-none md:rounded-3xl bg-transparent md:bg-white dark:md:bg-[#0a0a0a] shadow-none md:shadow-sm">
      
      {/* Messages Area - Native Scroll */}
      <div className="flex-1 px-4 py-4 md:p-8 pb-8 relative">
        
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-[50vh] opacity-50">
            <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-4 p-2">
              {providerLogo && <img src={providerLogo} alt={modelName} className="w-8 h-8 object-contain" />}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How can I help you today?</h3>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-4xl mx-auto">
            {messages.map((msg, i) => (
              <div key={msg.id || i} className="flex flex-col gap-4">
                
                {msg.role === 'data' && (msg.content as string).startsWith('EVALUGENCE_ERROR:') ? (
                  <div className="self-start flex gap-4 w-full max-w-[95%] md:max-w-[85%] group">
                    <div className="hidden md:flex w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <span className="text-red-500 font-bold text-lg">!</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-0 max-w-full">
                      <div className="text-red-600 dark:text-red-400 text-[14px] md:text-[15px] leading-relaxed bg-red-50 dark:bg-red-900/10 p-3.5 md:p-4 rounded-2xl rounded-tl-sm border border-red-100 dark:border-red-900/30 w-fit max-w-full">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <span className="font-semibold">Error communicating with API:</span>
                          <div className="group/tooltip relative z-[9999]">
                            <button className="text-red-400 hover:text-red-600 dark:text-red-500/70 dark:hover:text-red-400 transition-colors cursor-help mt-0.5">
                              <Info className="w-[18px] h-[18px]" />
                            </button>
                            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-3 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[13px] rounded-xl shadow-2xl p-4 opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:visible invisible transition-all z-[10000]">
                              <strong className="block mb-2 text-gray-900 dark:text-gray-100 text-sm">Possible Reasons:</strong>
                              <ul className="list-disc pl-4 flex flex-col gap-1.5 marker:text-gray-400">
                                <li>You exceeded your API Rate Limits (Requests per minute).</li>
                                <li>You ran out of API usage Quota for this specific model.</li>
                                <li>Your API Key is invalid or expired.</li>
                                <li>The model provider's servers are down.</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        {(msg.content as string).replace('EVALUGENCE_ERROR:', '')}
                      </div>
                    </div>
                  </div>
                ) : msg.role === 'data' ? (
                  <div className="flex justify-center w-full my-2">
                    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-xl text-xs font-medium text-center max-w-lg">
                      {msg.content as string}
                    </div>
                  </div>
                ) : msg.role === 'user' ? (
                  <div className="self-end flex flex-col items-end gap-1.5 w-full max-w-[80%] md:max-w-[70%] group">
                    {/* User Message Bubble */}
                    <div className="bg-black dark:bg-white text-white dark:text-black px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl rounded-tr-sm md:rounded-tr-sm text-[14px] md:text-[15px] shadow-sm leading-relaxed w-fit max-w-full flex flex-col gap-3">
                      {(msg as any).experimental_attachments?.length > 0 && (
                        <div className="flex flex-wrap gap-2 w-full max-w-full overflow-hidden">
                          {(msg as any).experimental_attachments.map((att: any, idx: number) => (
                            <div key={idx} className="w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden bg-white/10 border border-white/20 flex shrink-0">
                              {att.contentType?.startsWith('image/') ? (
                                <img src={att.url} alt={att.name || 'attachment'} className="w-full h-full object-cover" />
                              ) : att.contentType?.startsWith('video/') ? (
                                <video src={att.url} className="w-full h-full object-cover" controls />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-xs text-white/70">
                                  <span className="truncate w-full font-medium">{att.name || 'File'}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{renderMessageContent(msg)}</div>
                    </div>
                    {/* Action Buttons & Metrics */}
                    <div className="flex items-center justify-end w-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity gap-1.5 md:gap-3 mt-0 mr-2">
                      <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-gray-400 dark:text-gray-500">
                        <span>{estimateTokens(extractText(msg))} tokens</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 w-9 p-0 text-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => handleCopy(msg.id || i.toString(), extractText(msg))}
                      >
                        {copiedId === (msg.id || i.toString()) ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="self-start flex gap-4 w-full max-w-[95%] md:max-w-[85%] group">
                    {/* AI Response (Standard Block) */}
                    <div className="hidden md:flex w-8 h-8 rounded-full bg-white border border-gray-200 items-center justify-center shrink-0 shadow-sm mt-0.5 p-1">
                      {providerLogo && <img src={providerLogo} alt={modelName} className="w-4 h-4 object-contain" />}
                    </div>
                    <div className="flex flex-col gap-0 max-w-full overflow-hidden">
                      <div className="pt-1.5">
                        {renderMessageContent(msg, i === messages.length - 1 && isLoading)}
                      </div>
                      
                      {/* Action Buttons & Metrics */}
                      <div className="flex items-center gap-2 md:gap-4 w-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity mt-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 w-9 p-0 text-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => handleCopy(msg.id || i.toString(), extractText(msg))}
                        >
                          {copiedId === (msg.id || i.toString()) ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </Button>
                        {msg.id && msgMetrics[msg.id] && (
                          <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-medium text-gray-400 dark:text-gray-500">
                            <span>{msgMetrics[msg.id].tokens} tokens</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                            <span>{formatTime(msgMetrics[msg.id].timeMs)}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                            <span>{formatSpeed(msgMetrics[msg.id].tokens, msgMetrics[msg.id].timeMs)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && !error && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <div className="self-start flex flex-col gap-2 w-full max-w-[95%] md:max-w-[85%] group">
                <div className="flex gap-4">
                  <div className="hidden md:flex w-8 h-8 rounded-full bg-white border border-gray-200 items-center justify-center shrink-0 shadow-sm mt-0.5 p-1">
                    {providerLogo && <img src={providerLogo} alt={modelName} className="w-4 h-4 object-contain" />}
                  </div>
                  <div className="flex items-center gap-1.5 h-8 mt-0.5 ml-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
                {waitState > 0 && (
                  <div className="ml-0 md:ml-12 text-xs text-gray-500 dark:text-gray-400 italic">
                    {waitState === 1 
                      ? "This model is taking longer than usual. The provider might be experiencing high traffic or a cold start."
                      : "Still no response. The provider's API might be down or heavily congested. Consider trying another model."}
                  </div>
                )}
              </div>
            )}
            
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>

    </div>
  );
}

export default React.memo(ChatInterface);
