'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Activity, Zap, Database, BarChart2, GripVertical } from 'lucide-react';

interface MetricsSideMenuProps {
  contextPercentage: number;
  totalTokens: number;
  maxTokens: number;
  totalPromptTokens: number;
  totalGeneratedTokens: number;
  averageSpeed: string;
  averageLatencyMs?: number;
  presencePenalty?: string;
  frequencyPenalty?: string;
}

export default function MetricsSideMenu({
  contextPercentage,
  totalTokens,
  maxTokens,
  totalPromptTokens,
  totalGeneratedTokens,
  averageSpeed,
  averageLatencyMs = 0,
  presencePenalty,
  frequencyPenalty
}: MetricsSideMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(400); // default expanded width
  const [isDragging, setIsDragging] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newWidth = document.body.clientWidth - e.clientX;
    if (newWidth > 300 && newWidth < document.body.clientWidth - 100) {
      setWidth(newWidth);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDrag, handleMouseUp]);

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        initial={{ x: 100 }}
        animate={{ x: isOpen ? 100 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={toggleMenu}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[200] bg-black dark:bg-white text-white dark:text-black py-4 md:py-6 px-1.5 md:px-2 rounded-l-xl shadow-2xl hover:scale-105 cursor-pointer flex items-center justify-center border border-r-0 border-gray-200 dark:border-gray-800"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </motion.button>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[150]"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : `${width}px` }}
              className="fixed right-0 top-0 bottom-0 bg-white dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-gray-800 shadow-2xl z-[200] flex flex-col"
            >
              {/* Resize Handle */}
              <div 
                onMouseDown={() => setIsDragging(true)}
                className={`absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize transition-colors z-[201] flex items-center justify-center -ml-1.5 ${isDragging ? 'bg-blue-500/20' : 'hover:bg-blue-500/10'}`}
                title="Drag to resize"
              >
                <div className="h-12 w-1.5 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm">
                  <GripVertical className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-6 border-b border-gray-100 dark:border-gray-800/60 shrink-0">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                  <h2 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                    Evaluation Metrics
                  </h2>
                </div>
                <button 
                  onClick={toggleMenu}
                  className="p-1.5 md:p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors cursor-pointer text-gray-500"
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-8 space-y-4 md:space-y-6 custom-scrollbar">
                
                {/* Total Context */}
                <div className="flex flex-col gap-1 md:gap-2 p-3 md:p-4 bg-gray-50 dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5 leading-none"><Database className="w-3 h-3 text-blue-500 -mt-[1px]" /> Total context in this conversation</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{totalTokens.toLocaleString()}</span>
                    <span className="text-xs font-bold text-gray-400">tokens</span>
                  </div>
                </div>

                {/* Avg Speed & Latency */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="flex flex-col gap-1 md:gap-2 p-3 md:p-4 bg-gray-50 dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5 leading-none"><Zap className="w-3 h-3 text-yellow-500 -mt-[1px]" /> Avg Speed</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">{averageSpeed}</span>
                      <span className="text-xs font-bold text-gray-400">tok/s</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 md:gap-2 p-3 md:p-4 bg-gray-50 dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5 leading-none"><Activity className="w-3 h-3 text-red-500 -mt-[1px]" /> TTFT</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">{averageLatencyMs > 0 ? averageLatencyMs : '-'}</span>
                      <span className="text-xs font-bold text-gray-400">ms</span>
                    </div>
                  </div>
                </div>

                {/* Token Details */}
                <div className="flex flex-col gap-3 md:gap-4">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 md:pl-2">Token Breakdown</h3>
                  <div className="flex flex-col gap-2 md:gap-3 p-4 md:p-5 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Prompt Tokens</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{totalPromptTokens.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-px bg-gray-100 dark:bg-gray-800"></div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Generated Tokens</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{totalGeneratedTokens.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Active Penalties */}
                {(presencePenalty !== "0" && presencePenalty !== undefined || frequencyPenalty !== "0" && frequencyPenalty !== undefined) && (
                  <div className="flex flex-col gap-3 md:gap-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 md:pl-2">Active Penalties</h3>
                    <div className="flex flex-col gap-2 md:gap-3 p-4 md:p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                      {presencePenalty !== "0" && presencePenalty !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Presence Penalty</span>
                          <span className="text-sm font-bold text-amber-800 dark:text-amber-300">{presencePenalty}</span>
                        </div>
                      )}
                      {presencePenalty !== "0" && presencePenalty !== undefined && frequencyPenalty !== "0" && frequencyPenalty !== undefined && (
                        <div className="w-full h-px bg-amber-200/50 dark:bg-amber-800/30"></div>
                      )}
                      {frequencyPenalty !== "0" && frequencyPenalty !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Frequency Penalty</span>
                          <span className="text-sm font-bold text-amber-800 dark:text-amber-300">{frequencyPenalty}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
