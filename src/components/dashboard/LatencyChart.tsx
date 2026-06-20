'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getGlobalMetrics } from '@/utils/storage';
import { Activity } from 'lucide-react';

const getColor = (ms: number) => {
  if (ms < 500) return '#4ade80'; // Light Green
  if (ms < 1000) return '#22c55e'; // Green
  if (ms < 2000) return '#eab308'; // Yellow
  if (ms < 4000) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

export default function LatencyChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const metrics = getGlobalMetrics();
    const chartData = Object.entries(metrics.modelStats)
      .filter(([_, stat]) => (stat.totalTtftRuns || 0) > 0)
      .map(([id, stat]) => ({
        name: id.split('/').pop() || id,
        ttft: Math.round((stat.totalTtftMs || 0) / (stat.totalTtftRuns || 1))
      }))
      .sort((a, b) => a.ttft - b.ttft); // Fastest first

    setData(chartData);
  }, []);

  // Remove the early return null
  // if (data.length === 0) {
  //   return null;
  // }

  return (
    <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 bg-white dark:bg-[#0a0a0a] rounded-2xl md:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-none mb-1">Time To First Token (TTFT)</h2>
          <span className="text-[10px] md:text-xs font-medium text-gray-500">Average latency before first character appears</span>
        </div>
      </div>
      
      <div className="w-full h-[300px] relative z-10 mt-2">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
            <Activity className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-sm font-medium">No latency data available yet.</p>
            <p className="text-xs opacity-70 mt-1">Connect an API key and run some prompts to see TTFT metrics.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `${val}ms`} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-2 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2">
                        <span className="font-bold">{d.name}</span>
                        <span className="text-gray-400 dark:text-gray-500">|</span>
                        <span>{d.ttft} ms</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="ttft" radius={[6, 6, 6, 6]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.ttft)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-center gap-5 flex-wrap text-[11px] font-medium text-gray-500 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#4ade80] shrink-0"></div> <span className="leading-none mt-[1px]">&lt;500ms</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0"></div> <span className="leading-none mt-[1px]">&lt;1s</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#eab308] shrink-0"></div> <span className="leading-none mt-[1px]">&lt;2s</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#f97316] shrink-0"></div> <span className="leading-none mt-[1px]">&lt;4s</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ef4444] shrink-0"></div> <span className="leading-none mt-[1px]">&gt;4s</span></div>
      </div>
    </div>
  );
}
