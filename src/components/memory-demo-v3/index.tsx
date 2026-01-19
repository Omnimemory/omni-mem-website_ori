import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { SCENE_DETECTIONS, GRAPH_NODES, GRAPH_EDGES, VIDEO_DURATION } from './data';
import { VideoAnalysisCanvas } from './VideoAnalysisCanvas';
import { LiveKnowledgeGraph } from './LiveKnowledgeGraph';
import { MemoryChatInterface } from './MemoryChatInterface';

export function MemoryPlayerV3() {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);

  // Auto-play timeline (no auto-loop - stays at complete state for chat interaction)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1;
        if (next >= VIDEO_DURATION) {
          // Stop playing when complete - user can now interact with chat
          setIsPlaying(false);
          return VIDEO_DURATION;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const visibleDetections = SCENE_DETECTIONS.filter(d => currentTime >= d.time);

  const handleChatResults = (matchedNodes: string[], matchedEdges: string[]) => {
    setHighlightedNodes(matchedNodes);
    setHighlightedEdges(matchedEdges);
  };

  return (
    <div data-demo-component className="w-full h-[650px] bg-[#f8f9fc] rounded-[14px] border border-[#e2e4e9] overflow-hidden relative shadow-sm">
      {/* New Split Layout: Chat (Left) | Video+Graph (Right) */}
      <div className="flex h-full">
        {/* Left: Chat Interface (38%) */}
        <div className="w-[38%] h-full border-r border-[#e2e4e9] bg-white">
          <MemoryChatInterface
            nodes={GRAPH_NODES}
            edges={GRAPH_EDGES}
            currentTime={currentTime}
            onHighlight={handleChatResults}
          />
        </div>

        {/* Right: Video + Knowledge Graph (62%) */}
        <div className="w-[62%] h-full flex flex-col">
          {/* Top: Video Analysis (45%) */}
          <div className="h-[45%] relative bg-[#1a1a2e] border-b border-[#e2e4e9]">
            <VideoAnalysisCanvas
              currentTime={currentTime}
              detections={visibleDetections}
              isPlaying={isPlaying}
            />

            {/* Timeline Overlay */}
            <div className="absolute top-3 left-3 right-3 z-20">
              <div className="flex items-center gap-2 text-xs text-white/90 mb-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px]">{currentTime.toFixed(1)}s / {VIDEO_DURATION}s</span>
                {isPlaying && currentTime < VIDEO_DURATION && (
                  <span className="ml-auto px-2 py-0.5 bg-[#3da6a6]/30 border border-[#3da6a6]/50 rounded text-[#3da6a6] text-[9px] font-medium">
                    Analyzing...
                  </span>
                )}
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#3da6a6] to-[#0092B8]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentTime / VIDEO_DURATION) * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>

            {/* Stats Overlay */}
            <div className="absolute bottom-3 left-3 z-20 px-2.5 py-1.5 bg-black/50 backdrop-blur-sm rounded-[10px] border border-white/10">
              <div className="text-[10px] text-white/90 flex items-center gap-2">
                <span className="text-[#0092B8]">Detections:</span>
                <span className="font-mono font-medium">{visibleDetections.length}/{SCENE_DETECTIONS.length}</span>
              </div>
            </div>
          </div>

          {/* Bottom: Knowledge Graph (55%) */}
          <div className="h-[55%] p-3 bg-[#f8f9fc]">
            <LiveKnowledgeGraph
              nodes={GRAPH_NODES}
              edges={GRAPH_EDGES}
              currentTime={currentTime}
              highlightedNodes={highlightedNodes}
              highlightedEdges={highlightedEdges}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
