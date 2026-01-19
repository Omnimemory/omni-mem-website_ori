import React, { useState } from 'react';
import { Play, CheckCircle, Video, Pause, BarChart3, ChevronDown, Radio, Disc } from 'lucide-react';

interface VideoUploaderProps {
  onUploadStart: () => void;
  isProcessing: boolean;
  isComplete: boolean;
}

const FEEDS = [
  { 
    id: 'SRC-MAIN', 
    label: 'Primary Context Stream', 
    loc: 'Buffer Input'
  },
  { 
    id: 'SRC-AUX', 
    label: 'Auxiliary Input', 
    loc: 'Backup Buffer'
  }
];

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onUploadStart, isProcessing, isComplete }) => {
  const [selectedFeed, setSelectedFeed] = useState(FEEDS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleInject = () => {
    onUploadStart();
  };

  return (
    <div className="bg-theme-card rounded-2xl border border-theme-border p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
         <h2 className="text-sm font-medium text-white flex items-center gap-2">
           <Video className="w-4 h-4 text-theme-muted" />
           Source Feed
         </h2>
         <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isComplete ? 'bg-theme-success animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-[10px] font-mono text-theme-muted uppercase">
              {isComplete ? 'LIVE' : 'STANDBY'}
            </span>
         </div>
      </div>

      {/* Main Preview / Player Area */}
      <div className="relative aspect-video bg-black rounded-xl border border-theme-border overflow-hidden group shadow-lg flex flex-col">
          
          {/* Base Background (Abstract Tech Style instead of Image) */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0c0c0e] to-[#18181b]">
             {/* Dynamic Noise / Grid Pattern */}
             <div className="absolute inset-0 opacity-20" 
                  style={{ 
                    backgroundImage: 'radial-gradient(#3f3f46 1px, transparent 1px)', 
                    backgroundSize: '20px 20px' 
                  }}>
             </div>
             
             {/* CCTV Scanlines & Grain Overlay */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
             <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none"></div>
          </div>

          {/* Overlay UI: Standby Mode (Selection) */}
          {!isComplete && !isProcessing && (
            <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-transparent to-black/40">
               {/* Top Info */}
               <div className="flex justify-between items-start">
                  <div className="bg-black/70 backdrop-blur-sm px-2 py-1 border border-white/10 text-[10px] font-mono text-white">
                     {selectedFeed.id} <br/> {selectedFeed.loc}
                  </div>
                  <div className="relative">
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 bg-theme-accent/20 hover:bg-theme-accent/30 border border-theme-accent/50 text-theme-accent text-xs px-3 py-1.5 rounded transition-colors"
                      >
                         <Disc className="w-3 h-3 animate-spin-slow" />
                         Select Source
                         <ChevronDown className="w-3 h-3" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#0c0c0e] border border-theme-border rounded-lg shadow-xl overflow-hidden flex flex-col z-50">
                          {FEEDS.map((feed) => (
                            <button
                              key={feed.id}
                              onClick={() => {
                                setSelectedFeed(feed);
                                setIsDropdownOpen(false);
                              }}
                              className={`text-left px-3 py-2 text-xs hover:bg-white/5 border-b border-theme-border/20 last:border-0 flex items-center gap-2
                                ${selectedFeed.id === feed.id ? 'text-theme-accent bg-theme-accent/10' : 'text-theme-muted'}
                              `}
                            >
                              <Radio className="w-3 h-3" />
                              {feed.label}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
               </div>

               {/* Center Action */}
               <div className="self-center">
                  <button 
                    onClick={handleInject}
                    className="group relative flex items-center gap-2 px-6 py-2 bg-theme-item border border-theme-border hover:border-theme-accent/50 text-white text-sm font-medium rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-theme-accent/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                     <Play className="w-4 h-4 fill-white relative z-10" />
                     <span className="relative z-10">Inject Context</span>
                  </button>
               </div>

               {/* Bottom Info */}
               <div className="text-[10px] font-mono text-theme-muted/70 flex justify-between">
                  <span>SIGNAL: ACQUIRED</span>
                  <span>waiting for injection...</span>
               </div>
            </div>
          )}

          {/* Overlay UI: Active Mode (Processing/Complete) */}
          {(isProcessing || isComplete) && (
             <div className="absolute inset-0 z-20 flex flex-col justify-between p-3">
                {/* Top Status */}
                <div className="flex justify-between items-start">
                   <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                         <span className="text-xs font-bold text-red-500 font-mono tracking-widest">REC</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/80">{selectedFeed.id}</span>
                   </div>
                   <div className="px-2 py-0.5 bg-theme-accent/20 border border-theme-accent/30 text-[9px] text-theme-accent font-mono rounded animate-pulse">
                      AI ANALYSIS ACTIVE
                   </div>
                </div>

                {/* Tracking Rectangles (Fake visual effect) */}
                <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-white/30 rounded-sm border-dashed opacity-50"></div>
                <div className="absolute bottom-1/3 right-1/4 w-24 h-24 border border-theme-accent/50 rounded-sm">
                    <div className="absolute -top-3 -right-1 text-[8px] bg-theme-accent text-white px-1">Person</div>
                </div>

                {/* Bottom Controls Lookalike */}
                <div className="mt-auto bg-black/60 backdrop-blur-sm rounded-lg p-2 border border-white/5">
                   <div className="flex items-center justify-between text-[10px] font-mono text-white/70 mb-1">
                      <span>00:04:20:15</span>
                      <span>AUTO-TRACKING</span>
                   </div>
                   <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-theme-accent w-[65%] relative"></div>
                   </div>
                </div>
             </div>
          )}
      </div>
      
      {/* Footer Info */}
      <div className="flex justify-between items-center text-[10px] text-theme-muted font-mono">
         <div>RES: 2160x1440</div>
         <div>SOURCE: LOCAL</div>
      </div>
    </div>
  );
};