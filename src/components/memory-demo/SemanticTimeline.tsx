import React, { useEffect, useRef } from 'react';
import { TimelineEvent } from './types';

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
      case 'movement': return 'text-[rgb(var(--azure))] border-[rgb(var(--azure))]/30 bg-[rgb(var(--azure))]/10';
      case 'action': return 'text-[rgb(var(--magenta))] border-[rgb(var(--magenta))]/30 bg-[rgb(var(--magenta))]/10';
      case 'visual': return 'text-[rgb(var(--violet))] border-[rgb(var(--violet))]/30 bg-[rgb(var(--violet))]/10';
      default: return 'text-[rgb(var(--ink-muted))] border-[rgb(var(--ink-muted))]/30 bg-[rgb(var(--ink-muted))]/10';
    }
  };

  return (
    <div ref={containerRef} className="h-full overflow-y-auto p-3 space-y-3 custom-scrollbar">
      {events.length === 0 && (
         <div className="h-full flex flex-col items-center justify-center text-[rgb(var(--ink-muted))]/20">
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
             ${event.isHighlighted ? 'bg-[rgb(var(--teal))] shadow-[0_0_10px_rgb(var(--teal))]' : 'bg-[rgb(var(--ink-muted))]/20'}
          `}></div>

          {/* Dot */}
          <div className={`absolute left-[-2px] top-3 w-1.5 h-1.5 rounded-full border border-[rgb(var(--deep-blue))]
             ${event.isHighlighted ? 'bg-white scale-150' : 'bg-[rgb(var(--ink-muted))]/20'}
          `}></div>

          <div className={`rounded-[14px] border p-2.5 
             ${event.isHighlighted ? 'bg-[rgb(var(--deep-blue))] border-[rgb(var(--teal))]/50 shadow-lg' : 'bg-[rgb(var(--deep-blue))]/30 border-transparent hover:bg-[rgb(var(--deep-blue))]/50'}
          `}>
             <div className="flex items-center justify-between mb-1.5">
                 <span className="font-mono text-[10px] text-[rgb(var(--ink-muted))]">{event.time}</span>
                 <span className={`px-1.5 py-px rounded text-[9px] font-semibold uppercase tracking-wider border ${getBadgeColor(event.type)}`}>
                    {event.type}
                 </span>
             </div>
             <p className={`text-xs leading-relaxed ${event.isHighlighted ? 'text-white font-medium' : 'text-[rgb(var(--ink-muted))]'}`}>
                {event.description}
             </p>
          </div>
        </div>
      ))}
      <div ref={lastEventRef} />
    </div>
  );
};

