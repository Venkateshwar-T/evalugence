'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { getGlobalMetrics, GlobalMetrics } from '@/utils/storage';
import { Zap } from 'lucide-react';

export default function PerformanceChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const metrics = getGlobalMetrics();
    const chartData = Object.entries(metrics.modelStats)
      .map(([id, stat]) => ({
        name: id.split('/').pop() || id,
        speed: parseFloat(stat.avgSpeedTokS.toFixed(1)),
        providerId: stat.providerId
      }))
      .filter(item => item.speed > 0)
      .sort((a, b) => b.speed - a.speed)
      .slice(0, 10); // Show top 10

    setData(chartData);
  }, []);

  // if (data.length === 0) {
  //   return (
  //     <div className="h-full w-full flex items-center justify-center text-sm font-medium text-gray-400">
  //       Run some benchmarks to see performance data.
  //     </div>
  //   );
  // }

  // Generate colors based on provider
  const getProviderColor = (providerId: string) => {
    switch(providerId) {
      case 'openai': return '#10a37f';
      case 'google': return '#4285f4';
      case 'anthropic': return '#d97757';
      case 'mistral': return '#f54e42';
      default: return '#6b7280';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 p-3 rounded-xl shadow-xl">
          <p className="font-bold text-gray-900 dark:text-white mb-1">{label}</p>
          <p className="text-sm font-medium" style={{ color: payload[0].fill }}>
            {payload[0].value} tokens/sec
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px]">
      {data.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
          <Zap className="w-8 h-8 mb-3 opacity-20" />
          <p className="text-sm font-medium">No performance data available yet.</p>
          <p className="text-xs opacity-70 mt-1">Run benchmarks to measure model generation speed.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.2} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
              width={100}
            />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="speed" radius={[0, 4, 4, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getProviderColor(entry.providerId)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
