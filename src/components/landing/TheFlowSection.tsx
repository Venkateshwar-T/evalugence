'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, MessageSquare, SplitSquareHorizontal, BarChart3 } from 'lucide-react';

type FlowMode = 'multiple' | 'single';

export default function TheFlowSection() {
  const [activeTab, setActiveTab] = useState<FlowMode>('multiple');

  const multipleSteps = [
    { id: 1, title: 'Connect API', icon: Key, description: 'Paste your API keys for the providers you want to test.' },
    { id: 2, title: 'Input Prompt', icon: MessageSquare, description: 'Write your prompt and configure settings.' },
    { id: 3, title: 'Compare', icon: SplitSquareHorizontal, description: 'Run the prompt across all models simultaneously.' },
    { id: 4, title: 'View Metrics', icon: BarChart3, description: 'Analyze performance, tokens, and quality side by side.' },
  ];

  const singleSteps = [
    { id: 1, title: 'Connect API', icon: Key, description: 'Paste the API key for your chosen model provider.' },
    { id: 2, title: 'Input Prompt', icon: MessageSquare, description: 'Craft your prompt and set model parameters.' },
    { id: 3, title: 'View Metrics', icon: BarChart3, description: 'Get detailed latency, token usage, and speed data.' },
  ];

  const steps = activeTab === 'multiple' ? multipleSteps : singleSteps;

  return (
    <section className="relative w-full py-16 bg-gray-50/50 dark:bg-black/20 border-y border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 block">THE FLOW</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Simple easy steps, in the order.
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center p-1.5 bg-gray-200/50 dark:bg-gray-800/50 rounded-full border border-gray-200 dark:border-gray-800 relative">
            <button
              onClick={() => setActiveTab('multiple')}
              className={`relative px-6 py-2.5 text-sm font-bold rounded-full transition-colors ${
                activeTab === 'multiple' ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {activeTab === 'multiple' && (
                <motion.div
                  layoutId="flowTab"
                  className="absolute inset-0 bg-white dark:bg-black rounded-full shadow-sm border border-gray-200 dark:border-gray-700"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Multiple AI Models</span>
            </button>
            <button
              onClick={() => setActiveTab('single')}
              className={`relative px-6 py-2.5 text-sm font-bold rounded-full transition-colors ${
                activeTab === 'single' ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {activeTab === 'single' && (
                <motion.div
                  layoutId="flowTab"
                  className="absolute inset-0 bg-white dark:bg-black rounded-full shadow-sm border border-gray-200 dark:border-gray-700"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Single Model</span>
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto min-h-[250px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={`grid gap-8 relative ${activeTab === 'multiple' ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto'}`}
            >
              {/* Desktop connecting line */}
              <div className="hidden md:block absolute top-8 left-12 right-12 h-0.5 bg-gray-200 dark:bg-gray-800 z-0" />

              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-md flex items-center justify-center mb-6 relative group transition-transform hover:scale-105">
                      <div className="absolute inset-0 bg-gray-900 dark:bg-white rounded-2xl opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity" />
                      <Icon className="w-6 h-6 text-gray-900 dark:text-white" />
                      
                      {/* Mobile connecting line */}
                      {index < steps.length - 1 && (
                        <div className="block md:hidden absolute top-full left-1/2 -translate-x-1/2 h-8 w-0.5 bg-gray-200 dark:bg-gray-800" />
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-sm font-mono text-gray-400">0{index + 1}.</span> {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
