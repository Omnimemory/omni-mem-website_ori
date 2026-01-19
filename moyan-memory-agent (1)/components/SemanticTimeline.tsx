import React, { useEffect, useRef } from 'react';
import { TimelineEvent } from '../types';

interface SemanticTimelineProps {
  events: TimelineEvent[];
}

export const SemanticTimeline: React.FC<SemanticTimelineProps> = ({ events }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastEventRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new events added or highlighted
    const highlighted = events.find(e => e.isHighlighted);
    if (highlighted && containerRef.current) {
        // Find the element
        // Simplified auto-scroll to bottom for demo flow
    } else if (containerRef.current) {
         containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events.length, events]);

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'movement': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'action': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      case 'visual': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <div ref={containerRef} className="h-full overflow-y-auto p-3 space-y-3 custom-scrollbar">
      {events.length === 0 && (
         <div className="h-full flex flex-col items-center justify-center text-theme-muted/20">
           <div className="w-1 h-8 bg-current rounded-full mb-2"></div>
           <span className="text-[10px] uppercase tracking-widest">No Events</span>
         </div>
      )}
      
      {events.map((event) => (
        <div 
          key={event.id} 
          className={`relative pl-4 py-1 transition-all duration-500
            ${event.isHighlighted ? 'opacity-100 scale-105' : 'opacity-70 hover:opacity-100'}
          `}
        >
          {/* Timeline Line */}
          <div className={`absolute left-0 top-0 bottom-0 w-[2px] rounded-full 
             ${event.isHighlighted ? 'bg-theme-accent shadow-[0_0_10px_#3b82f6]' : 'bg-theme-border'}
          `}></div>

          {/* Dot */}
          <div className={`absolute left-[-2px] top-3 w-1.5 h-1.5 rounded-full border border-theme-bg
             ${event.isHighlighted ? 'bg-white scale-150' : 'bg-theme-border'}
          `}></div>

          <div className={`rounded-lg border p-2.5 
             ${event.isHighlighted ? 'bg-theme-item border-theme-accent/50 shadow-lg' : 'bg-theme-item/30 border-transparent hover:bg-theme-item/50'}
          `}>
             <div className="flex items-center justify-between mb-1.5">
                 <span className="font-mono text-[10px] text-theme-muted">{event.time}</span>
                 <span className={`px-1.5 py-px rounded text-[9px] font-semibold uppercase tracking-wider border ${getBadgeColor(event.type)}`}>
                    {event.type}
                 </span>
             </div>
             <p className={`text-xs leading-relaxed ${event.isHighlighted ? 'text-white font-medium' : 'text-theme-muted'}`}>
                {event.description}
             </p>
          </div>
        </div>
      ))}
      <div ref={lastEventRef} />
    </div>
  );
};