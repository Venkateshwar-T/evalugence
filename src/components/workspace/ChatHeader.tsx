'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Database, BarChart2, Globe } from 'lucide-react';
import ModelMetadataViewer from './ModelMetadataViewer';
import SystemPromptModal from './SystemPromptModal';
interface ChatHeaderProps {
  modelName?: string;
  providerLogo?: string;
  isStandalone?: boolean;
  onOpenSelectModal?: () => void;
  onNewChat?: () => void;
  wiggle?: boolean;
}

export default function ChatHeader({ 
  modelName = 'Select Model', 
  providerLogo,
  isStandalone = false,
  onOpenSelectModal,
  onNewChat,
  wiggle = false
}: ChatHeaderProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);

  return (
    <>
      <div className={`flex items-center justify-between gap-3 px-1 py-1 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border ${wiggle ? 'border-red-500 shadow-red-500/20' : 'border-gray-200/80 dark:border-gray-800/80'} rounded-full shadow-lg transition-colors ${isStandalone ? 'p-1.5' : ''}`}>
        <div className="relative">
          <button 
            onClick={onOpenSelectModal}
            className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 text-gray-900 dark:text-gray-100 transition-all active:scale-95 cursor-pointer group border border-transparent dark:border-gray-700"
          >
            {modelName !== 'Select Model' && providerLogo && (
              <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center relative shrink-0 bg-white rounded-full p-0.5 shadow-sm">
                <img 
                  src={providerLogo} 
                  alt={modelName} 
                  className="object-contain transition-transform group-hover:scale-110" 
                />
              </div>
            )}
            <span className="font-bold text-[12px] md:text-[14px] tracking-wide">{modelName}</span>
          </button>
        </div>

        <div className="flex items-center gap-1 pr-1">
          {onNewChat && (
            <div className="relative group/btn flex items-center justify-center">
              <button 
                onClick={onNewChat}
                className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer mr-0.5 md:mr-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              </button>
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black text-[11px] font-bold tracking-wide rounded-lg opacity-0 group-hover/btn:opacity-100 invisible group-hover/btn:visible transition-all whitespace-nowrap shadow-xl z-50 pointer-events-none">New Chat</div>
            </div>
          )}

          <div className="relative group/btn flex items-center justify-center">
            <button 
              onClick={() => setIsSystemPromptOpen(true)}
              className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 md:w-[16px] md:h-[16px]" />
            </button>
            <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black text-[11px] font-bold tracking-wide rounded-lg opacity-0 group-hover/btn:opacity-100 invisible group-hover/btn:visible transition-all whitespace-nowrap shadow-xl z-50 pointer-events-none">System Prompt</div>
          </div>

          <div className="relative group/btn flex items-center justify-center">
            <button 
              onClick={() => setIsConfigOpen(true)}
              className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 md:w-[16px] md:h-[16px]" />
            </button>
            <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black text-[11px] font-bold tracking-wide rounded-lg opacity-0 group-hover/btn:opacity-100 invisible group-hover/btn:visible transition-all whitespace-nowrap shadow-xl z-50 pointer-events-none">Metadata</div>
          </div>
        </div>
      </div>
      
      <ModelMetadataViewer isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} modelName={modelName} />
      <SystemPromptModal isOpen={isSystemPromptOpen} onClose={() => setIsSystemPromptOpen(false)} modelName="global" />
    </>
  );
}
