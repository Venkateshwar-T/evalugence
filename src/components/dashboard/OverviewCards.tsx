'use client';

import { useEffect, useState } from 'react';
import { getGlobalMetrics, GlobalMetrics } from '@/utils/storage';
import { Activity, Zap, Cpu, Info } from 'lucide-react';
import providersData from '@/data/providers.json';

const InfoTooltip = ({ text }: { text: string }) => (
  <div className="group relative hidden md:flex items-center justify-center cursor-help ml-1.5">
    <Info className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
    <div className="absolute top-full mt-2 left-1/2 -translate-x-[85%] sm:-translate-x-1/2 w-48 p-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-[100] normal-case text-center">
      <div className="absolute bottom-full left-[85%] sm:left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-white"></div>
      {text}
    </div>
  </div>
);

export default function OverviewCards() {
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);

  useEffect(() => {
    setMetrics(getGlobalMetrics());
  }, []);

  if (!metrics) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800/50 rounded-2xl" />
        ))}
      </div>
    );
  }

  // Find fastest model
  let fastestModel = { id: 'N/A', speed: 0, providerId: '' };
  Object.entries(metrics.modelStats).forEach(([id, stat]) => {
    if (stat.avgSpeedTokS > fastestModel.speed) {
      fastestModel = { id, speed: stat.avgSpeedTokS, providerId: stat.providerId };
    }
  });

  const fastestProvider = providersData.find(p => p.id === fastestModel.providerId);
  const fastestModelName = fastestModel.id !== 'N/A' ? fastestModel.id.split('/').pop() || fastestModel.id : 'N/A';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {/* Benchmarks Run Card */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm relative overflow-visible flex flex-col gap-2 md:gap-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg md:rounded-xl">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-center">
              <h3 className="font-bold text-gray-600 dark:text-gray-400 text-xs md:text-base">Benchmarks</h3>
              <InfoTooltip text="The total number of chat sessions and comparisons you have completed across all models." />
            </div>
          </div>
        </div>
        <div className="mt-1 md:mt-2">
          <span className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {metrics.totalSessionsRun.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Fastest Model Card */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm relative overflow-visible flex flex-col gap-2 md:gap-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg md:rounded-xl">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex items-center">
              <h3 className="font-bold text-gray-600 dark:text-gray-400 text-xs md:text-base">Fastest Model</h3>
              <InfoTooltip text="The model with the highest average tokens-per-second (tok/s) generation speed." />
            </div>
          </div>
        </div>
        <div className="mt-1 md:mt-2 flex flex-col md:gap-1">
          <div className="flex items-center gap-2">
            {fastestProvider && (
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                <img src={fastestProvider.logo} alt="Logo" className="w-4 h-4 md:w-4 md:h-4 object-contain" />
              </div>
            )}
            <span className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight line-clamp-1 leading-tight pb-0.5">
              {fastestModelName}
            </span>
          </div>
          <span className="text-xs md:text-sm font-bold text-green-500 mt-1">
            {fastestModel.speed.toFixed(1)} tok/s
          </span>
        </div>
      </div>

      {/* Total Tokens Card */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm relative overflow-visible flex flex-col gap-2 md:gap-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg md:rounded-xl">
              <Cpu className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center">
              <h3 className="font-bold text-gray-600 dark:text-gray-400 text-xs md:text-base">Total Tokens</h3>
              <InfoTooltip text="The total number of tokens generated by all models during your sessions." />
            </div>
          </div>
        </div>
        <div className="mt-1 md:mt-2">
          <span className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {metrics.totalTokensProcessed.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
