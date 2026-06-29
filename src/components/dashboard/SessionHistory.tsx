'use client';

import { useEffect, useState } from 'react';
import { getRecentSessionMetadata, deleteSession } from '@/utils/storage';
import { Clock, Play, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SessionHistory() {
  const [sessions, setSessions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    setSessions(getRecentSessionMetadata());
  }, []);

  if (sessions.length === 0) {
    return (
      <div className="flex-1 w-full flex items-center justify-center text-sm font-medium text-gray-400 min-h-[200px]">
        No previous sessions found.
      </div>
    );
  }

  const handleResume = (id: string) => {
    // Navigate to home workspace and pass the ID to reload the session
    router.push(`/lab?resume=${id}`);
  };

  const handleDelete = async (id: string) => {
    const updated = await deleteSession(id);
    if (updated) setSessions(updated);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar pr-1 md:pr-2 pb-4">
      {sessions.map(session => {
        const d = new Date(session.timestamp);
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

        return (
          <div 
            key={session.id} 
            onClick={() => handleResume(session.id)}
            className="group relative flex flex-col gap-3 p-3.5 md:p-5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 hover:border-indigo-400/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 hover:shadow-sm rounded-xl md:rounded-2xl transition-all cursor-pointer mb-3 last:mb-0 overflow-hidden"
          >
            {/* Header: Type, Models & Delete */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 pt-0.5">
                <span className={`text-[9px] md:text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-widest ${session.type === 'compare' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'}`}>
                  {session.type === 'compare' ? 'Compare' : 'Test'}
                </span>
                <div className="flex flex-wrap gap-1 md:gap-1.5">
                  {session.models.map((model: string, i: number) => (
                    <span key={i} className="text-[10px] md:text-xs font-semibold bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 md:px-2 md:py-0.5 border border-gray-100 dark:border-gray-700/50 rounded-md">
                      {model}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative group/delete">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleDelete(session.id); 
                  }}
                  className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute top-full mt-2 right-0 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-xl opacity-0 group-hover/delete:opacity-100 invisible group-hover/delete:visible transition-all whitespace-nowrap shadow-2xl z-50 pointer-events-none">Delete Session</div>
              </div>
            </div>

            {/* Body: Preview Text */}
            <p className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed px-0.5">
              "{session.preview}"
            </p>

            {/* Footer: Date & Time */}
            <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-100 dark:border-gray-800/80">
              <span className="text-[10px] md:text-xs font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1.5 px-0.5">
                <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" /> 
                {dateStr} at {timeStr}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
