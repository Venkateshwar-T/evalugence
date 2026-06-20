'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { getGlobalMetrics } from '@/utils/storage';
import { PieChart as PieChartIcon } from 'lucide-react';

export default function TokenDistribution() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const metrics = getGlobalMetrics();
    const providerTokens: Record<string, number> = {};

    Object.values(metrics.modelStats).forEach(stat => {
      const pId = stat.providerId || 'unknown';
      if (!providerTokens[pId]) providerTokens[pId] = 0;
      providerTokens[pId] += stat.totalTokens;
    });

    const chartData = Object.entries(providerTokens)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    setData(chartData);
  }, []);

  // if (data.length === 0) {
  //   return (
  //     <div className="h-full w-full flex items-center justify-center text-sm font-medium text-gray-400">
  //       No token data available yet.
  //     </div>
  //   );
  // }

  const COLORS = ['#10a37f', '#4285f4', '#d97757', '#f54e42', '#a855f7', '#3b82f6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 p-3 rounded-xl shadow-xl">
          <p className="font-bold text-gray-900 dark:text-white mb-1">{payload[0].name}</p>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {payload[0].value.toLocaleString()} tokens
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
          <PieChartIcon className="w-8 h-8 mb-3 opacity-20" />
          <p className="text-sm font-medium">No token data available yet.</p>
          <p className="text-xs opacity-70 mt-1">Run prompts to see how your token usage is distributed.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
