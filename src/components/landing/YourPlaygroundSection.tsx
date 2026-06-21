'use client';

import { motion } from 'framer-motion';
import { FileText, Thermometer, Hash, Brain, SlidersHorizontal, TerminalSquare } from 'lucide-react';

export default function YourPlaygroundSection() {
  return (
    <section className="relative w-full py-16 overflow-hidden bg-gray-50/30 dark:bg-black/10">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 block">YOUR PLAYGROUND</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Experiment Without Writing Code
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            Paste API keys, configure settings, and start testing immediately. No complex setups required.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="col-span-1 md:col-span-2 lg:col-span-2 group p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <TerminalSquare className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">System Prompt</h3>
              </div>
              
              {/* Mockup */}
              <div className="w-full h-16 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-2 mb-3 relative overflow-hidden">
                <div className="flex items-center gap-1.5 mb-1.5 opacity-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                </div>
                <p className="text-[10px] font-mono text-gray-600 dark:text-gray-400 leading-tight">
                  You are an expert evaluator. Analyze the following code...<motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-1 h-2.5 ml-0.5 align-middle bg-blue-500"></motion.span>
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Set custom instructions to control the persona and behavior of the models across your tests.
            </p>
          </motion.div>

          {/* 2. Metadata: Context Windows */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-1 group p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Context Bounds</h3>
              </div>
              
              {/* Mockup */}
              <div className="w-full mb-3 flex flex-col gap-1.5">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] font-bold text-gray-500">Max Limit</span>
                  <span className="text-[10px] font-mono font-bold text-indigo-500">128k Tokens</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                  <div className="w-[30%] h-full bg-indigo-300 dark:bg-indigo-700"></div>
                  <div className="w-[40%] h-full bg-indigo-400 dark:bg-indigo-600"></div>
                  <div className="w-[30%] h-full bg-indigo-500"></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Instantly view native model metadata, such as how many tokens a model can ingest, before you start testing.
            </p>
          </motion.div>

          {/* 3. Output Capabilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-1 group p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                  <Hash className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Output Limits</h3>
              </div>
              
              {/* Mockup */}
              <div className="w-full mb-3 flex justify-center">
                <div className="w-full max-w-[100px] py-1.5 px-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md flex items-center justify-between group-hover:border-green-500 transition-colors">
                  <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">4096</span>
                  <div className="flex flex-col gap-[1px]">
                    <div className="w-0 h-0 border-l-[2px] border-l-transparent border-r-[2px] border-r-transparent border-b-[3px] border-b-gray-400"></div>
                    <div className="w-0 h-0 border-l-[2px] border-l-transparent border-r-[2px] border-r-transparent border-t-[3px] border-t-gray-400"></div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Check metadata to see exactly how much output text each model is capable of generating in a single turn.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
