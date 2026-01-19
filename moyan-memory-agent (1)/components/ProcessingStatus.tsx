import React, { useEffect, useRef } from 'react';
import { Activity, Terminal } from 'lucide-react';
import { LogEntry, ProcessStage } from '../types';

interface ProcessingStatusProps {
  stages: ProcessStage[];
  logs: LogEntry[];
  memoryUsage: number;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ stages, logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col gap-4">
      {/* Stages */}
      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.id} className="space-y-1">
            <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider">
              <span className={`transition-colors ${stage.status === 'completed' ? 'text-theme-success' : 'text-theme-muted'}`}>
                {stage.label}
              </span>
              <span className="text-theme-muted">{Math.round(stage.progress)}%</span>
            </div>
            <div className="h-1 w-full bg-theme-item rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out
                  ${stage.status === 'completed' ? 'bg-theme-success' : 'bg-theme-accent'}
                `}
                style={{ width: `${stage.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Logs Terminal */}
      <div className="rounded-xl border border-theme-border/50 bg-[#050505] overflow-hidden flex flex-col">
        <div className="px-3 py-1.5 border-b border-theme-border/20 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-theme-muted" />
              <span className="text-[10px] text-theme-muted">System Log</span>
            </div>
        </div>
        <div 
          ref={logContainerRef}
          className="h-24 p-3 overflow-y-auto font-mono text-[10px] space-y-1"
        >
          {logs.length === 0 && <span className="text-theme-muted/30 italic">System ready...</span>}
          {logs.map((log) => (
            <div key={log.id} className="flex gap-2 leading-tight">
              <span className="text-theme-muted/30 shrink-0 select-none">›</span>
              <span className={`break-words
                ${log.type === 'success' ? 'text-theme-success' : 
                  log.type === 'warning' ? 'text-yellow-500' : 
                  log.type === 'recall' ? 'text-theme-accent font-bold' :
                  log.type === 'error' ? 'text-red-500' : 'text-theme-text/80'}
              `}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};