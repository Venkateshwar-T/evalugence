'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Activity, BarChart2, Zap, Clock, Type, FileText, Info, Crown, GripVertical } from 'lucide-react';
import { formatTime, formatSpeed, estimateTokens } from '@/utils/metrics';

interface CompareModel {
  id: string;
  name: string;
  logo: string;
  providerId: string;
  isActive: boolean;
}

interface CompareMetricsSideMenuProps {
  compareMetrics: Record<string, Record<string, { timeMs: number; tokens: number; ttftMs?: number }>>;
  models: CompareModel[];
  globalMessages: any[];
}

export default function CompareMetricsSideMenu({
  compareMetrics,
  models,
  globalMessages
}: CompareMetricsSideMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [width, setWidth] = useState(550); // default expanded width
  const [isDragging, setIsDragging] = useState(false);
  const [activeMetricKey, setActiveMetricKey] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setWidth(window.innerWidth / 2);
    }
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newWidth = document.body.clientWidth - e.clientX;
    if (newWidth > 300 && newWidth <= document.body.clientWidth) {
      setWidth(newWidth);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none'; // prevent text selection while dragging
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

  // Calculate total prompt tokens
  const totalPromptTokens = globalMessages
    .filter(m => m.role === 'user')
    .reduce((acc, m) => acc + estimateTokens(m.content || ''), 0);

  // Calculate metrics per model
  const activeModels = models.filter(m => m.isActive);
  
  const modelStats = activeModels.map(model => {
    const metrics = compareMetrics[model.id] || {};
    const metricValues = Object.values(metrics);
    
    const totalTokens = metricValues.reduce((acc, v) => acc + v.tokens, 0);
    const totalTimeMs = metricValues.reduce((acc, v) => acc + v.timeMs, 0);
    const avgSpeed = totalTimeMs > 0 ? (totalTokens / (totalTimeMs / 1000)) : 0;
    
    const ttftValues = metricValues.filter(v => v.ttftMs);
    const totalTtft = ttftValues.reduce((acc, v) => acc + (v.ttftMs || 0), 0);
    const avgTtft = ttftValues.length > 0 ? Math.round(totalTtft / ttftValues.length) : 0;
    
    // Latest message metrics
    const latestMetric = metricValues[metricValues.length - 1];
    const latestTimeMs = latestMetric ? latestMetric.timeMs : 0;

    // Verbosity index: ratio of generated tokens to prompt tokens (higher = more verbose)
    const verbosity = totalPromptTokens > 0 ? (totalTokens / totalPromptTokens) : 0;

    return {
      model,
      totalTokens,
      totalTimeMs,
      avgSpeed,
      avgTtft,
      latestTimeMs,
      verbosity,
      messageCount: metricValues.length
    };
  });

  // Determine Rankings
  const statsWithSpeed = modelStats.filter(s => s.avgSpeed > 0);
  const fastestModel = statsWithSpeed.length > 0 
    ? statsWithSpeed.reduce((max, s) => s.avgSpeed > max.avgSpeed ? s : max) 
    : null;

  const statsWithTokens = modelStats.filter(s => s.totalTokens > 0);
  const mostVerboseModel = statsWithTokens.length > 0
    ? statsWithTokens.reduce((max, s) => s.verbosity > max.verbosity ? s : max)
    : null;

  const mostConciseModel = statsWithTokens.length > 0
    ? statsWithTokens.reduce((min, s) => s.verbosity < min.verbosity ? s : min)
    : null;

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Floating Toggle Button */}
      <motion.button
        initial={{ x: 100 }}
        animate={{ x: isOpen ? 100 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={toggleMenu}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[10001] bg-black dark:bg-white text-white dark:text-black py-4 md:py-6 px-1.5 md:px-2 rounded-l-xl shadow-2xl hover:scale-105 cursor-pointer flex items-center justify-center border border-r-0 border-gray-200 dark:border-gray-800"
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
              className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[10000]"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ width: window.innerWidth < 768 ? '100%' : `${width}px` }}
              className="fixed right-0 top-0 bottom-0 bg-white dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-gray-800 shadow-2xl z-[10001] flex flex-col"
            >
              {/* Resize Handle */}
              <div 
                onMouseDown={() => setIsDragging(true)}
                className={`hidden md:flex absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize transition-colors z-[10002] flex items-center justify-center -ml-1.5 ${isDragging ? 'bg-blue-500/20' : 'hover:bg-blue-500/10'}`}
                title="Drag to resize"
              >
                <div className="h-12 w-1.5 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm">
                  <GripVertical className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 dark:border-gray-800/60 shrink-0">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-blue-500" />
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">
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

              <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 custom-scrollbar">

                {modelStats.length === 0 ? (
                  <div className="text-center text-sm text-gray-500 py-8">No active models to display.</div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-800">
                            <th className="py-2.5 px-3 md:py-3 md:px-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[9px] md:text-[10px] bg-gray-50 dark:bg-[#111]">Metric</th>
                            {modelStats.map((stat) => (
                              <th key={stat.model.id} className="py-2.5 px-3 md:py-3 md:px-4 last:pr-6 md:last:pr-8 font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-[#111] text-xs md:text-sm">
                                <div className="flex items-center gap-1.5 md:gap-2">
                                  {stat.model.logo && <img src={stat.model.logo} alt={stat.model.name} className="w-3.5 h-3.5 md:w-4 md:h-4 object-contain" />}
                                  <span>{stat.model.name}</span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 bg-white dark:bg-[#0a0a0a]">
                          {[
                            { 
                              label: 'Avg Speed', 
                              key: 'avgSpeed', 
                              formatter: (val: number) => val > 0 ? `${val.toFixed(1)} t/s` : '--',
                              description: 'Tokens generated per second. A higher speed indicates a more responsive and faster model.',
                              winnerLogic: (stats: any[]) => {
                                const valid = stats.filter(s => s.avgSpeed > 0);
                                if (valid.length === 0) return null;
                                return valid.reduce((max, s) => s.avgSpeed > max.avgSpeed ? s : max).model;
                              }
                            },
                            { 
                              label: 'Output Tokens', 
                              key: 'totalTokens', 
                              formatter: (val: number) => val.toLocaleString(),
                              description: 'Total number of tokens generated across all messages. A higher number indicates more detailed or longer responses.',
                              winnerLogic: () => null
                            },
                            { 
                              label: 'Avg TTFT', 
                              key: 'avgTtft', 
                              formatter: (val: number) => val > 0 ? `${val} ms` : '--',
                              description: 'Average Time To First Token. The delay before the model starts streaming the response. Lower is better.',
                              winnerLogic: (stats: any[]) => {
                                const valid = stats.filter(s => s.avgTtft > 0);
                                if (valid.length === 0) return null;
                                return valid.reduce((min, s) => s.avgTtft < min.avgTtft ? s : min).model;
                              }
                            },
                            { 
                              label: 'Verbosity', 
                              key: 'verbosity', 
                              formatter: (val: number) => val > 0 ? `${val.toFixed(2)}x` : '--',
                              description: 'Ratio of generated output tokens to input prompt tokens. A lower score means the model is more concise; a higher score means it is more conversational.',
                              winnerLogic: () => null
                            },
                            { 
                              label: 'Response Time', 
                              key: 'latestTimeMs', 
                              formatter: (val: number) => val > 0 ? formatTime(val) : '--',
                              description: 'Total time taken to generate the latest response. Lower is better.',
                              winnerLogic: (stats: any[]) => {
                                const valid = stats.filter(s => s.latestTimeMs > 0);
                                if (valid.length === 0) return null;
                                return valid.reduce((min, s) => s.latestTimeMs < min.latestTimeMs ? s : min).model;
                              }
                            }
                          ].map((row) => {
                            const isRowActive = activeMetricKey === row.key;
                            const winnerModel = row.winnerLogic(modelStats);
                            return (
                              <tr 
                                key={row.key} 
                                onClick={() => setActiveMetricKey(isRowActive ? null : row.key)}
                                className={`border-b border-gray-100 dark:border-gray-800/60 last:border-0 transition-colors cursor-pointer group ${isRowActive ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-[#111]/50'}`}
                              >
                                <td className="py-2.5 px-3 md:py-3 md:px-4 relative font-semibold text-gray-700 dark:text-gray-300 text-[10px] md:text-xs tracking-tight">
                                  <div className="flex items-center gap-1.5 md:gap-2">
                                    {row.label}
                                  </div>
                                </td>
                                {modelStats.map((stat) => {
                                  const isWinner = winnerModel?.id === stat.model.id;
                                  return (
                                    <td key={stat.model.id} className={`py-2.5 px-3 md:py-3 md:px-4 last:pr-6 md:last:pr-8 text-[11px] md:text-sm font-medium ${isWinner ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
                                      <div className="flex items-center gap-1.5 md:gap-2">
                                        {isWinner && <Crown className="w-3 h-3 md:w-3.5 md:h-3.5 text-yellow-500 shrink-0" />}
                                        <span>{row.formatter(stat[row.key as keyof typeof stat] as number)}</span>
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Metric Details Card */}
                    <AnimatePresence mode="popLayout">
                      {activeMetricKey && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-4 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col gap-3"
                        >
                          {(() => {
                            const metricsRows = [
                              { key: 'avgSpeed', label: 'Avg Speed', description: 'Tokens generated per second. A higher speed indicates a more responsive and faster model.', highlightsLogic: (stats: any[]) => { const v = stats.filter(s => s.avgSpeed > 0); if (!v.length) return []; const m = v.reduce((m, s) => s.avgSpeed > m.avgSpeed ? s : m); return [{ label: 'Fastest', model: m.model, icon: Zap, iconColor: 'text-yellow-500' }]; } },
                              { key: 'totalTokens', label: 'Output Tokens', description: 'Total number of tokens generated across all messages. A higher number indicates more detailed or longer responses.', highlightsLogic: (stats: any[]) => { const v = stats.filter(s => s.totalTokens > 0); if (!v.length) return []; const max = v.reduce((m, s) => s.totalTokens > m.totalTokens ? s : m); const min = v.reduce((m, s) => s.totalTokens < m.totalTokens ? s : m); if (max.model.id === min.model.id) return [{ label: 'Most Tokens', model: max.model, icon: FileText, iconColor: 'text-blue-500' }]; return [{ label: 'Most Tokens', model: max.model, icon: FileText, iconColor: 'text-blue-500' }, { label: 'Least Tokens', model: min.model, icon: FileText, iconColor: 'text-gray-400' }]; } },
                              { key: 'avgTtft', label: 'Avg TTFT', description: 'Average Time To First Token. The delay before the model starts streaming the response. Lower is better.', highlightsLogic: (stats: any[]) => { const v = stats.filter(s => s.avgTtft > 0); if (!v.length) return []; const m = v.reduce((m, s) => s.avgTtft < m.avgTtft ? s : m); return [{ label: 'Winner', model: m.model, icon: Crown, iconColor: 'text-yellow-500' }]; } },
                              { key: 'verbosity', label: 'Verbosity', description: 'Ratio of generated output tokens to input prompt tokens. A lower score means the model is more concise; a higher score means it is more conversational.', highlightsLogic: (stats: any[]) => { const v = stats.filter(s => s.verbosity > 0); if (!v.length) return []; const max = v.reduce((m, s) => s.verbosity > m.verbosity ? s : m); const min = v.reduce((m, s) => s.verbosity < m.verbosity ? s : m); if (max.model.id === min.model.id) return [{ label: 'Most Concise', model: min.model, icon: Type, iconColor: 'text-emerald-500' }]; return [{ label: 'Most Concise', model: min.model, icon: Type, iconColor: 'text-emerald-500' }, { label: 'Least Concise', model: max.model, icon: Type, iconColor: 'text-gray-400' }]; } },
                              { key: 'latestTimeMs', label: 'Response Time', description: 'Total time taken to generate the latest response. Lower is better.', highlightsLogic: (stats: any[]) => { const v = stats.filter(s => s.latestTimeMs > 0); if (!v.length) return []; const m = v.reduce((m, s) => s.latestTimeMs < m.latestTimeMs ? s : m); return [{ label: 'Winner', model: m.model, icon: Crown, iconColor: 'text-yellow-500' }]; } }
                            ];
                            const activeRow = metricsRows.find(r => r.key === activeMetricKey);
                            if (!activeRow) return null;
                            const highlights = activeRow.highlightsLogic(modelStats);

                            return (
                              <>
                                <div className="flex items-center gap-2">
                                  <Info className="w-4 h-4 text-blue-500" />
                                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{activeRow.label}</h4>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {activeRow.description}
                                </p>
                                {highlights.length > 0 && (
                                  <div className="mt-1.5 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-6 items-start sm:items-center w-full">
                                    {highlights.map((h, i) => (
                                      <div key={i} className="flex items-center gap-2.5 bg-gray-100/50 dark:bg-gray-800/30 sm:bg-transparent px-3 py-2 sm:p-0 rounded-lg sm:rounded-none w-full sm:w-auto">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 w-24 sm:w-auto shrink-0">
                                          {h.icon && <h.icon className={`w-3.5 h-3.5 ${h.iconColor || 'text-gray-400'} shrink-0`} />} 
                                          <span className="leading-none mt-[2px]">{h.label}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                          {h.model.logo && <img src={h.model.logo} alt={h.model.name} className="w-4 h-4 object-contain shrink-0" />}
                                          <span className="text-sm font-bold text-gray-900 dark:text-white truncate leading-none mt-[1px] block" title={h.model.name}>
                                            {h.model.name}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
