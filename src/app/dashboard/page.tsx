'use client';

import { useState, useEffect } from 'react';
import { Zap, PieChart } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import OverviewCards from '@/components/dashboard/OverviewCards';
import SessionHistory from '@/components/dashboard/SessionHistory';
import { useApiKeys } from '@/hooks/useApiKeys';
import providersData from '@/data/providers.json';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load the Recharts components so they don't block initial render
const PerformanceChart = dynamic(() => import('@/components/dashboard/PerformanceChart'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100/50 dark:bg-gray-800/30 animate-pulse rounded-xl" />
});

const TokenDistribution = dynamic(() => import('@/components/dashboard/TokenDistribution'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100/50 dark:bg-gray-800/30 animate-pulse rounded-xl" />
});

const LatencyChart = dynamic(() => import('@/components/dashboard/LatencyChart'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100/50 dark:bg-gray-800/30 animate-pulse rounded-xl" />
});

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'metrics'>('profile');
  const { providers: savedProviders, isLoaded } = useApiKeys();
  const [enableHistory, setEnableHistory] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setEnableHistory(localStorage.getItem('evalugence_enable_history') === 'true');
    }
  }, []);

  const handleEnableHistory = () => {
    localStorage.setItem('evalugence_enable_history', 'true');
    setEnableHistory(true);
  };

  const connectedProvidersList = Object.entries(savedProviders).map(([id, data]) => {
    const providerInfo = providersData.find(p => p.id === id);
    return {
      id,
      name: providerInfo?.name || id,
      logo: providerInfo?.logo || '',
      modelCount: data.models?.length || 0
    };
  });

  return (
    <>
      {/* Background glow container */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] max-w-[600px] h-[600px] bg-green-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] max-w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full" />
      </div>

      <div className={`w-full max-w-7xl mx-auto flex flex-col gap-6 md:gap-8 h-full overflow-y-auto custom-scrollbar pb-8 md:pb-12 relative pt-[80px] md:pt-24 px-4 md:px-6 transition-opacity duration-300 ${(!mounted || !isLoaded) ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header and Tab Switcher */}
      <div className="flex flex-col gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 md:mt-2">
            Manage your profile, view connected providers, and analyze evaluation metrics.
          </p>
        </div>

        <div className="flex flex-row sm:items-center gap-1 bg-white dark:bg-[#0a0a0a] p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm w-full sm:w-fit overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`relative flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap z-10 ${activeTab === 'profile' ? 'text-white dark:text-black' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'}`}
          >
            {activeTab === 'profile' && (
              <motion.div layoutId="dashboardTab" className="absolute inset-0 bg-black dark:bg-white rounded-lg shadow-md -z-10" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
            )}
            Profile
          </button>
          <button 
            onClick={() => setActiveTab('metrics')}
            className={`relative flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap z-10 ${activeTab === 'metrics' ? 'text-white dark:text-black' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'}`}
          >
            {activeTab === 'metrics' && (
              <motion.div layoutId="dashboardTab" className="absolute inset-0 bg-black dark:bg-white rounded-lg shadow-md -z-10" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
            )}
            Evaluation Metrics
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
      {activeTab === 'profile' ? (
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Connected Providers */}
          <div className="flex flex-col">
            <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-3 md:mb-4 px-1">Connected Providers</h3>
            {connectedProvidersList.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-4 px-1">No providers connected yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {connectedProvidersList.map(provider => (
                  <div key={provider.id} className="group relative flex items-center gap-3 md:gap-4 p-3.5 md:p-5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 hover:border-indigo-400/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 hover:shadow-sm rounded-xl md:rounded-2xl transition-all cursor-default overflow-hidden">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 dark:bg-white border border-gray-100 dark:border-gray-800 flex items-center justify-center p-2 shrink-0">
                      {provider.logo ? (
                        <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-md"></div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-[13px] md:text-[15px] text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">{provider.name}</span>
                      <span className="text-[10px] md:text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">{provider.modelCount} Models</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session History */}
          <div className="flex flex-col flex-1 h-full min-h-[500px]">
            <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-3 md:mb-4 px-1">Recent Sessions</h3>
            {!enableHistory ? (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl md:rounded-3xl h-64 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm max-w-sm">History is currently disabled. New chat sessions will not be saved.</p>
                <button 
                  onClick={handleEnableHistory}
                  className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold shadow-md cursor-pointer transition-transform hover:scale-105"
                >
                  Enable History
                </button>
              </div>
            ) : (
              <div className="flex-1">
                <SessionHistory />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 md:gap-8">
          <Suspense fallback={<div className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl md:rounded-3xl" />}>
            <OverviewCards />
          </Suspense>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm flex flex-col min-h-[400px]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 relative z-10 mb-4 md:mb-6">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-none mb-1">Historical Speed</h3>
                <span className="text-[10px] md:text-xs font-medium text-gray-500">Average generation speed in tokens per second</span>
              </div>
            </div>
            <div className="flex-1 h-full">
              <PerformanceChart />
            </div>
          </div>

          <LatencyChart />

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm flex flex-col min-h-[400px]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 relative z-10 mb-4 md:mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <PieChart className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-none mb-1">Token Distribution</h3>
                <span className="text-[10px] md:text-xs font-medium text-gray-500">Total tokens processed across all models</span>
              </div>
            </div>
            <div className="flex-1 h-full">
              <TokenDistribution />
            </div>
          </div>
        </div>
      )}
        </motion.div>
      </AnimatePresence>
    </div>
    </>
  );
}
