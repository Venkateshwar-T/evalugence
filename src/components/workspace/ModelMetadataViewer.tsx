'use client';

import { useState, useEffect } from 'react';
import { X, Database, Search } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function ModelMetadataViewer({ isOpen, onClose, modelName }: { isOpen: boolean, onClose: () => void, modelName: string }) {
  const [modelMeta, setModelMeta] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && modelName && isOpen) {
      try {
        const metaCache = JSON.parse(localStorage.getItem('evalugence_model_metadata') || '{}');
        setModelMeta(metaCache[modelName] || null);
      } catch (e) {
        setModelMeta(null);
      }
    }
  }, [modelName, isOpen]);

  if (!isOpen) return null;

  const renderValue = (val: any): React.ReactNode => {
    if (val === null || val === undefined) return <span className="text-gray-400 italic">null</span>;
    if (typeof val === 'boolean') return <span className={val ? "text-green-500 font-medium" : "text-red-500 font-medium"}>{val ? 'true' : 'false'}</span>;
    if (typeof val === 'string') return <span className="text-emerald-600 dark:text-emerald-400">"{val}"</span>;
    if (typeof val === 'number') return <span className="text-blue-500 dark:text-blue-400 font-mono">{val}</span>;
    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-gray-400">[]</span>;
      return (
        <div className="flex flex-col gap-1 pl-2 border-l-2 border-gray-200 dark:border-gray-800 ml-1 mt-1">
          {val.map((item, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-gray-400 text-xs mt-0.5">-</span>
              <div>{renderValue(item)}</div>
            </div>
          ))}
        </div>
      );
    }
    if (typeof val === 'object') {
      const keys = Object.keys(val);
      if (keys.length === 0) return <span className="text-gray-400">{'{}'}</span>;
      return (
        <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-gray-200 dark:border-gray-800 ml-1 mt-1">
          {keys.map((k) => (
            <div key={k} className="flex flex-col sm:flex-row sm:gap-2">
              <span className="text-gray-600 dark:text-gray-300 font-medium shrink-0">{k}:</span>
              <div className="break-words overflow-hidden text-ellipsis min-w-0">{renderValue(val[k])}</div>
            </div>
          ))}
        </div>
      );
    }
    return String(val);
  };

  return createPortal(
    <>
      {isOpen && (
        <>
          <div 
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[10010]"
          />
          <div 
            className="fixed inset-0 m-auto w-[95%] max-w-4xl h-fit max-h-[75vh] md:max-h-[85vh] bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl md:rounded-2xl shadow-2xl z-[10011] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-5 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/20">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Database className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-[15px] md:text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">
                    Model Metadata
                  </h2>
                  <p className="text-[11px] md:text-[13px] text-gray-500 dark:text-gray-400 font-medium mt-0 md:mt-0.5">
                    {modelName}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 custom-scrollbar bg-white dark:bg-gray-950">
              {!modelMeta ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-3">
                  <Search className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                  <p>No metadata found for this model.</p>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-5 text-[13px] sm:text-[14px] leading-relaxed overflow-x-auto custom-scrollbar">
                  {renderValue(modelMeta)}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  );
}
