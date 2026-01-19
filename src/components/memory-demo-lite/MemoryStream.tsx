import React from 'react';
import { motion } from 'framer-motion';
import { GraphNode } from './data';
import { Eye, Brain, User, MapPin, Coffee, MessageSquare, Video, Sparkles } from 'lucide-react';

interface MemoryStreamProps {
  evidenceNodes: GraphNode[];
  entityNodes: GraphNode[];
  currentTime: number;
}

interface Insight {
  id: string;
  time: number;
  type: 'evidence' | 'entity';
  node: GraphNode;
  message: string;
}

export function MemoryStream({ evidenceNodes, entityNodes, currentTime }: MemoryStreamProps) {
  // Build insights list from visible nodes
  const insights: Insight[] = React.useMemo(() => {
    const items: Insight[] = [];
    
    evidenceNodes.forEach(node => {
      items.push({
        id: `ev-${node.id}`,
        time: node.startTime,
        type: 'evidence',
        node,
        message: getEvidenceMessage(node),
      });
    });

    entityNodes.forEach(node => {
      items.push({
        id: `en-${node.id}`,
        time: node.startTime + 0.5, // Entities appear slightly after evidence
        type: 'entity',
        node,
        message: getEntityMessage(node),
      });
    });

    return items.sort((a, b) => a.time - b.time);
  }, [evidenceNodes, entityNodes]);

  const visibleInsights = insights.filter(i => currentTime >= i.time);

  const getIcon = (insight: Insight) => {
    if (insight.type === 'entity') return Brain;
    switch (insight.node.type) {
      case 'visual': return Video;
      case 'utterance': return MessageSquare;
      case 'action': return Sparkles;
      default: return Eye;
    }
  };

  const getColor = (insight: Insight) => {
    if (insight.type === 'entity') return 'rgb(var(--teal))';
    switch (insight.node.type) {
      case 'visual': return 'rgb(var(--cyan))';
      case 'utterance': return 'rgb(var(--seafoam))';
      case 'action': return 'rgb(var(--azure))';
      default: return 'rgb(var(--ink-muted))';
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-4 space-y-3">
        {visibleInsights.length === 0 && (
          <div className="text-center text-[rgb(var(--ink-muted))] text-sm py-8">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Waiting for memory insights...</p>
          </div>
        )}

        {visibleInsights.map((insight, idx) => {
          const Icon = getIcon(insight);
          const color = getColor(insight);

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[rgb(var(--deep-blue))] border border-[rgb(var(--ink-muted))]/20 rounded-[14px] p-3 hover:border-[rgb(var(--ink-muted))]/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}20`, borderColor: `${color}40` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color }}
                    >
                      {insight.type === 'entity' ? 'Entity' : 'Evidence'}
                    </span>
                    <span className="text-[10px] text-[rgb(var(--ink-muted))] font-mono">
                      {insight.time.toFixed(1)}s
                    </span>
                  </div>
                  <p className="text-sm text-white leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function getEvidenceMessage(node: GraphNode): string {
  switch (node.type) {
    case 'visual':
      if (node.label.includes('Face')) return 'Detected person in frame';
      if (node.label.includes('Cup')) return 'Identified object: cup';
      if (node.label.includes('Sign')) return 'Recognized location marker';
      return `Visual detection: ${node.label.split(':')[1]?.trim() || 'scene element'}`;
    case 'utterance':
      const utterance = node.label.match(/"([^"]+)"/)?.[1];
      return utterance ? `Heard: "${utterance}"` : 'Audio transcription detected';
    case 'action':
      return `Observed action: ${node.label.split(':')[1]?.trim() || 'activity'}`;
    default:
      return node.label;
  }
}

function getEntityMessage(node: GraphNode): string {
  switch (node.type) {
    case 'person':
      return `Identified person: ${node.label}`;
    case 'location':
      return `Mapped location: ${node.label}`;
    case 'object':
      return `Recognized object: ${node.label}`;
    default:
      return `Entity: ${node.label}`;
  }
}

