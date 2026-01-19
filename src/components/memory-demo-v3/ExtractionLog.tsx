import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExtractionLog } from './data';
import { Eye, Brain, Link2, CheckCircle } from 'lucide-react';

interface ExtractionLogProps {
  logs: ExtractionLog[];
  currentTime: number;
}

export function ExtractionLogComponent({ logs, currentTime }: ExtractionLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleLogs = logs.filter(log => currentTime >= log.time);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLogs.length]);

  const getLogIcon = (type: ExtractionLog['type']) => {
    switch (type) {
      case 'detection': return Eye;
      case 'inference': return Brain;
      case 'edge': return Link2;
      default: return Eye;
    }
  };

  const getLogColor = (type: ExtractionLog['type']) => {
    switch (type) {
      case 'detection': return '#0092B8'; // Cyan - Qdrant write
      case 'inference': return '#3da6a6'; // Teal - Entity resolution
      case 'edge': return '#cc3d8f'; // Magenta - Neo4j edge
      default: return '#C0C0C0'; // Silver
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0c183d] rounded-[14px] border border-[#424243]/30 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#424243]/30 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-serif)' }}>
          <Brain className="w-4 h-4 text-[#3da6a6]" />
          Extraction Process
        </h3>
        <span className="text-xs text-[#C0C0C0] font-mono">
          {visibleLogs.length}/{logs.length}
        </span>
      </div>

      {/* Log Entries */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {visibleLogs.length === 0 && (
          <div className="text-center text-[#C0C0C0] text-sm py-8">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Waiting for extraction events...</p>
          </div>
        )}

        {visibleLogs.map((log, idx) => {
          const Icon = getLogIcon(log.type);
          const color = getLogColor(log.type);

          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#0c183d]/50 transition-colors"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="w-3 h-3" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color }}
                  >
                    {log.type}
                  </span>
                  <span className="text-[10px] text-[#C0C0C0] font-mono">
                    {log.time.toFixed(1)}s
                  </span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed">{log.message}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
