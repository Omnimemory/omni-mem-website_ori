import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GraphNode, GraphEdge } from './data';
import { Eye, Brain, MapPin, Coffee, User, MessageSquare, Video, ArrowRight } from 'lucide-react';

interface DenseGraphProps {
  evidenceNodes: GraphNode[];
  entityNodes: GraphNode[];
  edges: GraphEdge[];
  currentTime: number;
  highlightPath?: string[];
}

export function DenseGraph({ 
  evidenceNodes, 
  entityNodes, 
  edges, 
  currentTime,
  highlightPath = []
}: DenseGraphProps) {
  // Calculate positions for focused layout (centered, flowing left to right)
  const nodePositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    
    // Evidence layer (left side, vertical stack)
    evidenceNodes.forEach((node, idx) => {
      const x = 25; // Left column
      const y = 20 + (idx * 12); // Vertical spacing
      positions.set(node.id, { x, y });
    });

    // Entity layer (right side, vertical stack)
    entityNodes.forEach((node, idx) => {
      const x = 75; // Right column
      const y = 20 + (idx * 12); // Vertical spacing
      positions.set(node.id, { x, y });
    });

    return positions;
  }, [evidenceNodes, entityNodes]);

  const visibleEdges = edges.filter(e => currentTime >= e.startTime);

  const getNodeIcon = (node: GraphNode) => {
    switch (node.type) {
      case 'person': return User;
      case 'location': return MapPin;
      case 'object': return Coffee;
      case 'utterance': return MessageSquare;
      case 'visual': return Video;
      default: return Eye;
    }
  };

  const getNodeColor = (node: GraphNode, isHighlighted: boolean) => {
    if (isHighlighted) return '#3da6a6'; // Teal
    if (node.layer === 'evidence') {
      switch (node.type) {
        case 'visual': return '#0092B8'; // Cyan
        case 'utterance': return '#2BA399'; // Seafoam
        case 'action': return '#0080c9'; // Azure
        default: return '#C0C0C0'; // Silver
      }
    } else {
      switch (node.type) {
        case 'person': return '#3da6a6'; // Teal
        case 'location': return '#cc3d8f'; // Magenta
        case 'object': return '#754aad'; // Violet
        default: return '#3da6a6'; // Teal
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="w-full max-w-4xl px-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Evidence → Entity Connection
          </h3>
          <p className="text-sm text-[rgb(var(--ink-muted))]">
            How perception becomes understanding
          </p>
        </div>

        {/* Graph Container */}
        <div className="relative" style={{ minHeight: '300px' }}>
          {/* SVG for edges */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {visibleEdges.map((edge) => {
              const sourcePos = nodePositions.get(edge.source);
              const targetPos = nodePositions.get(edge.target);
              if (!sourcePos || !targetPos) return null;

              const isHighlighted = highlightPath.includes(edge.source) && highlightPath.includes(edge.target);

              return (
                <motion.line
                  key={`${edge.source}-${edge.target}`}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={isHighlighted ? '#3da6a6' : '#C0C0C0'}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeDasharray={edge.type === 'inferred' ? '3 3' : '0'}
                  opacity={isHighlighted ? 0.9 : 0.2}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
              );
            })}
          </svg>

          {/* Evidence Nodes (Left) */}
          <div className="absolute left-0 top-0" style={{ width: '30%' }}>
            <div className="text-xs text-[rgb(var(--ink-muted))] mb-2 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>Perception</span>
            </div>
            <div className="space-y-2">
              {evidenceNodes.map((node) => {
                const pos = nodePositions.get(node.id);
                if (!pos) return null;
                const isHighlighted = highlightPath.includes(node.id);
                const Icon = getNodeIcon(node);
                const color = getNodeColor(node, isHighlighted);

                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`flex items-center gap-2 ${
                      isHighlighted ? 'scale-105' : ''
                    }`}
                  >
                    <div
                      className={`px-2 py-1 bg-[rgb(var(--deep-blue))] border rounded-full backdrop-blur-sm flex items-center gap-1.5 text-xs transition-all ${
                        isHighlighted ? 'ring-2 ring-[rgb(var(--teal))] shadow-lg' : ''
                      }`}
                      style={{
                        borderColor: `${color}60`,
                      }}
                    >
                      <Icon className="w-3 h-3" style={{ color }} />
                      <span className="text-white font-medium">{node.label.split(':')[1]?.trim() || node.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Arrow Separator */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <ArrowRight className="w-8 h-8 text-[rgb(var(--teal))]/40" />
          </div>

          {/* Entity Nodes (Right) */}
          <div className="absolute right-0 top-0" style={{ width: '30%' }}>
            <div className="text-xs text-[rgb(var(--ink-muted))] mb-2 flex items-center gap-1 justify-end">
              <span>Cognition</span>
              <Brain className="w-3 h-3" />
            </div>
            <div className="space-y-2">
              {entityNodes.map((node) => {
                const pos = nodePositions.get(node.id);
                if (!pos) return null;
                const isHighlighted = highlightPath.includes(node.id);
                const Icon = getNodeIcon(node);
                const color = getNodeColor(node, isHighlighted);

                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className={`flex items-center justify-end gap-2 ${
                      isHighlighted ? 'scale-105' : ''
                    }`}
                  >
                    <div
                      className={`px-3 py-1.5 bg-[rgb(var(--deep-blue))] border-2 rounded-full backdrop-blur-sm flex items-center gap-1.5 text-sm font-semibold transition-all ${
                        isHighlighted ? 'ring-2 ring-[rgb(var(--teal))] shadow-xl scale-110' : ''
                      }`}
                      style={{
                        borderColor: color,
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                      <span className="text-white">{node.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
