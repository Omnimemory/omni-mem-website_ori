import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraphNode, GraphEdge } from './data';

interface LiveKnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  currentTime: number;
  highlightedNodes?: string[];
  highlightedEdges?: string[];
}

export function LiveKnowledgeGraph({ nodes, edges, currentTime, highlightedNodes = [], highlightedEdges = [] }: LiveKnowledgeGraphProps) {
  // Filter visible nodes and edges based on current time
  const visibleNodes = useMemo(() => 
    nodes.filter(n => currentTime >= n.createdAt),
    [nodes, currentTime]
  );
  
  const visibleEdges = useMemo(() => 
    edges.filter(e => 
      currentTime >= e.createdAt && 
      visibleNodes.some(n => n.id === e.source) && 
      visibleNodes.some(n => n.id === e.target)
    ),
    [edges, visibleNodes, currentTime]
  );

  // Calculate node positions using a 3-column layout (Evidence → Entity → Event)
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    
    // Separate nodes by type
    const evidenceNodes = visibleNodes.filter(n => n.type === 'evidence');
    const entityNodes = visibleNodes.filter(n => n.type === 'entity');
    const eventNodes = visibleNodes.filter(n => n.type === 'event');

    // Column positions (3 columns: Evidence | Entity | Event)
    // Adjusted for better spacing and to avoid edge clipping
    const col1X = 20;  // Evidence (left)
    const col2X = 50;  // Entity (middle)
    const col3X = 80;  // Event (right)

    // Position evidence nodes (left column - raw detections)
    evidenceNodes.forEach((node, idx) => {
      positions[node.id] = {
        x: col1X,
        y: 20 + idx * 15,
      };
    });

    // Position entity nodes (middle column - resolved entities)
    entityNodes.forEach((node, idx) => {
      positions[node.id] = {
        x: col2X,
        y: 25 + idx * 22,
      };
    });

    // Position event nodes (right column - semantic summaries)
    eventNodes.forEach((node, idx) => {
      positions[node.id] = {
        x: col3X,
        y: 30 + idx * 25,
      };
    });

    return positions;
  }, [visibleNodes]);

  const getNodeColor = (node: GraphNode) => {
    if (node.type === 'entity') {
      if (node.category === 'person') return '#3da6a6'; // Teal - brand primary
      if (node.category === 'location') return '#cc3d8f'; // Magenta - brand secondary
      return '#754aad'; // Violet - brand secondary (object)
    }
    if (node.type === 'event') {
      return '#471D8F'; // Deep Purple - brand primary for events
    }
    // Evidence nodes (from detections)
    if (node.category === 'face') return '#0092B8'; // Cyan - brand secondary
    if (node.category === 'speech') return '#2BA399'; // Seafoam - brand secondary
    if (node.category === 'scene') return '#0080c9'; // Azure - brand secondary
    if (node.category === 'object') return '#754aad'; // Violet - brand secondary
    return '#8b92a5'; // Muted gray fallback
  };

  const getEdgeColor = (edge: GraphEdge) => {
    // Brand colors for edges
    if (edge.label.includes('BELONGS_TO') || edge.label.includes('IDENTIFIED') || edge.label.includes('RESOLVED')) return '#3da6a6'; // Teal
    if (edge.label.includes('INVOLVES')) return '#cc3d8f'; // Magenta
    if (edge.label.includes('OCCURS_AT')) return '#471D8F'; // Deep Purple
    if (edge.label.includes('MENTIONED')) return '#0092B8'; // Cyan
    return '#D1D1D1'; // Light Grey - brand spec for lines
  };

  // Determine if search mode is active
  const isSearchActive = highlightedNodes.length > 0 || highlightedEdges.length > 0;

  return (
    <div className="w-full h-full bg-white relative overflow-hidden rounded-[14px] border border-[#e2e4e9] shadow-sm">
      {/* Header */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-[#e2e4e9] rounded-full shadow-sm">
        <div className="w-2 h-2 rounded-full bg-[#3da6a6] animate-pulse" />
        <span className="text-xs font-semibold text-[#0c183d]">Knowledge Graph</span>
        <span className="text-[10px] text-[#6b7280]">
          {visibleNodes.length} nodes
        </span>
      </div>

      {/* Graph Container */}
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Background grid pattern */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f0f1f5" strokeWidth="0.3"/>
          </pattern>
          {/* Drop shadow for nodes */}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0.5" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.15"/>
          </filter>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />

        {/* Edges */}
        <g>
          <AnimatePresence>
            {visibleEdges.map((edge) => {
              const sourcePos = nodePositions[edge.source];
              const targetPos = nodePositions[edge.target];
              if (!sourcePos || !targetPos) return null;
              
              const isHighlighted = highlightedEdges.includes(edge.id);
              const color = getEdgeColor(edge);
              
              // Dim edges if search is active but edge is not highlighted
              const edgeOpacity = isSearchActive ? (isHighlighted ? 1 : 0.1) : 0.6;
              const edgeWidth = isHighlighted ? 0.8 : 0.3;

              return (
                <motion.g key={edge.id}>
                  {/* Connection line */}
                  <motion.line
                    initial={{ opacity: 0 }}
                    animate={{ opacity: edgeOpacity }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    x1={sourcePos.x}
                    y1={sourcePos.y}
                    x2={targetPos.x}
                    y2={targetPos.y}
                    stroke={color}
                    strokeWidth={edgeWidth}
                    strokeDasharray={edge.label.includes('SUPPORTED') ? '1 1' : '0'}
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>
        </g>

        {/* Nodes */}
        <g>
          <AnimatePresence>
            {visibleNodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const size = node.type === 'entity' ? 4 : node.type === 'event' ? 4.5 : 3;
              const color = getNodeColor(node);
              
              const isHighlighted = highlightedNodes.includes(node.id);
              // Dim nodes if search is active but node is not highlighted
              const nodeOpacity = isSearchActive ? (isHighlighted ? 1 : 0.3) : 1;
              
              const strokeColor = isHighlighted ? '#3da6a6' : '#ffffff';
              const strokeWidth = isHighlighted ? 1 : (node.type === 'evidence' ? 0.3 : 0.5);

              // Different shapes for different node types
              const renderNodeShape = () => {
                if (node.type === 'evidence') {
                  // Circle for evidence
                  return (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={size}
                      fill={color}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      filter="url(#shadow)"
                    />
                  );
                } else if (node.type === 'entity') {
                  // Rounded Square for entities
                  return (
                    <rect
                      x={pos.x - size}
                      y={pos.y - size}
                      width={size * 2}
                      height={size * 2}
                      fill={color}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      rx={1} // More rounded corners
                      filter="url(#shadow)"
                    />
                  );
                } else {
                  // Diamond for events
                  const points = [
                    `${pos.x},${pos.y - size}`,
                    `${pos.x + size},${pos.y}`,
                    `${pos.x},${pos.y + size}`,
                    `${pos.x - size},${pos.y}`
                  ].join(' ');
                  return (
                    <polygon
                      points={points}
                      fill={color}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      filter="url(#shadow)"
                    />
                  );
                }
              };

              const labelOffset = size + 3;

              return (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: nodeOpacity }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Highlight ring for search results */}
                  {isHighlighted && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={size + 2}
                      fill="none"
                      stroke="#3da6a6"
                      strokeWidth={0.5}
                      strokeDasharray="1 1"
                      opacity={0.8}
                    />
                  )}
                  
                  {/* Node shape */}
                  {renderNodeShape()}
                  
                  {/* Label */}
                  <text
                    x={pos.x}
                    y={pos.y + labelOffset}
                    textAnchor="middle"
                    fill={isHighlighted ? '#0c183d' : '#4b5563'}
                    fontSize={node.type === 'entity' ? '3px' : node.type === 'event' ? '2.8px' : '2.2px'}
                    fontFamily="Inter, sans-serif"
                    fontWeight={isHighlighted ? '700' : (node.type === 'entity' || node.type === 'event' ? '600' : '400')}
                    style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
                  >
                    {node.label.length > 16 ? node.label.slice(0, 14) + '…' : node.label}
                  </text>
                </motion.g>
              );
            })}
          </AnimatePresence>
        </g>
      </svg>

      {/* Empty State */}
      {visibleNodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-dashed border-[#e2e4e9] animate-spin" style={{ animationDuration: '3s' }} />
            <p className="text-sm text-[#6b7280] font-medium">Building Knowledge Graph...</p>
          </div>
        </div>
      )}
    </div>
  );
}
