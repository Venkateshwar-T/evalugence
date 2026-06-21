'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BarChart3 } from 'lucide-react';

export default function HeroSection() {
  const mockData = [
    { name: 'GPT-5.2', value: 98, color: 'bg-blue-500' },
    { name: 'Claude Opus 4.7', value: 95, color: 'bg-orange-500' },
    { name: 'Gemini 3.1 Pro', value: 94, color: 'bg-green-500' },
    { name: 'Deepseek V4', value: 92, color: 'bg-purple-500' },
    { name: 'Mistral Large 3', value: 88, color: 'bg-red-500' },
  ];

  return (
    <section className="relative w-full pt-24 pb-24 md:pt-40 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          
          {/* Left Side Content */}
          <div className="text-left max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2"
            >
              BYOK MODEL EVALUATION
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 leading-tight"
            >
              Bring your key. <br className="hidden md:block" />We measure the rest.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-6 leading-snug"
            >
              Connect any AI provider with your own API key, fire the same prompt at several models, and evaluate metrics side by side.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <Link href="/models" className="inline-block">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg cursor-pointer text-sm"
                >
                  Connect a key <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Right Side Graph */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full relative"
          >
            <div className="relative w-full rounded-[1rem] md:rounded-[2rem] border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-black/60 backdrop-blur-xl p-6 md:p-8">
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white leading-none mb-1">Model Benchmark</h3>
                    <span className="text-xs font-medium text-gray-500">Compare performance to find your ideal AI model</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                {mockData.map((model, idx) => (
                  <div key={model.name} className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{model.name}</span>
                      <span className="text-sm font-mono font-bold text-gray-500 dark:text-gray-400">{model.value}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${model.value}%` }}
                        transition={{ duration: 1, delay: 0.5 + (idx * 0.1), ease: "easeOut" }}
                        className={`h-full rounded-full ${model.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Fake X-axis labels */}
              <div className="flex justify-between mt-4 px-1">
                <span className="text-[10px] font-medium text-gray-400">0</span>
                <span className="text-[10px] font-medium text-gray-400">25</span>
                <span className="text-[10px] font-medium text-gray-400">50</span>
                <span className="text-[10px] font-medium text-gray-400">75</span>
                <span className="text-[10px] font-medium text-gray-400">100</span>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
