import React, { useState, useMemo, useEffect } from 'react';
import { Search, Code } from 'lucide-react';
import { GraphNode, GraphEdge } from './data';

interface RetrievalDemoProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  currentTime: number;
  onResults?: (matchedNodes: string[], matchedEdges: string[]) => void;
}

// Example queries that match the demo data
const EXAMPLE_QUERIES = [
  'What did Alice do?',
  'Where did Alice visit?',
  'What did Alice order?',
  'Show events involving Alice',
];

export function RetrievalDemo({ nodes, edges, currentTime, onResults }: RetrievalDemoProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    matchedNodes: string[];
    matchedEdges: string[];
    context: string;
  } | null>(null);

  // All nodes/edges are available after video completes
  const allNodesVisible = nodes.every(n => currentTime >= n.createdAt);
  const allEdgesVisible = edges.every(e => currentTime >= e.createdAt);

  const handleSearch = () => {
    if (!query.trim() || !allNodesVisible) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const queryLower = query.toLowerCase();
      const matchedNodeIds: string[] = [];
      const matchedEdgeIds: string[] = [];
      
      // Simple keyword matching (in real system, this would be semantic search)
      nodes.forEach(node => {
        if (queryLower.includes('alice') && node.label.toLowerCase().includes('alice')) {
          matchedNodeIds.push(node.id);
        }
        if (queryLower.includes('cafe') && node.label.toLowerCase().includes('cafe')) {
          matchedNodeIds.push(node.id);
        }
        if (queryLower.includes('order') && node.label.toLowerCase().includes('order')) {
          matchedNodeIds.push(node.id);
        }
        if (queryLower.includes('visit') && node.label.toLowerCase().includes('visit')) {
          matchedNodeIds.push(node.id);
        }
        if (queryLower.includes('matcha') && node.label.toLowerCase().includes('matcha')) {
          matchedNodeIds.push(node.id);
        }
      });

      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (sourceNode && matchedNodeIds.includes(sourceNode.id)) {
          matchedEdgeIds.push(edge.id);
        }
        if (targetNode && matchedEdgeIds.includes(targetNode.id)) {
          matchedEdgeIds.push(edge.id);
        }
        if (queryLower.includes('involves') && edge.label === 'INVOLVES') {
          matchedEdgeIds.push(edge.id);
        }
        if (queryLower.includes('visit') && edge.label === 'OCCURS_AT') {
          matchedEdgeIds.push(edge.id);
        }
      });

      // Build context string (what would be returned to LLM)
      const matchedNodes = nodes.filter(n => matchedNodeIds.includes(n.id));
      const matchedEdges = edges.filter(e => matchedEdgeIds.includes(e.id));
      
      let context = 'Retrieved memories:\n';
      matchedNodes.forEach(node => {
        context += `- ${node.label} (${node.type})\n`;
      });
      matchedEdges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source)?.label || edge.source;
        const target = nodes.find(n => n.id === edge.target)?.label || edge.target;
        context += `- ${source} --[${edge.label}]--> ${target}\n`;
      });

      setSearchResults({
        matchedNodes: matchedNodeIds,
        matchedEdges: matchedEdgeIds,
        context,
      });
      setIsSearching(false);
      
      // Notify parent component to highlight nodes/edges
      if (onResults) {
        onResults(matchedNodeIds, matchedEdgeIds);
      }
    }, 500);
  };

  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  return (
    <div className="w-full h-full bg-white relative overflow-hidden rounded-[14px] border border-[#e2e4e9] shadow-sm flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e2e4e9]">
        <h3 className="text-sm font-semibold text-[#0c183d] flex items-center gap-2" style={{ fontFamily: 'var(--font-serif)' }}>
          <Search className="w-4 h-4 text-[#3da6a6]" />
          Memory Retrieval API
        </h3>
        <p className="text-xs text-[#6b7280] mt-1">Query the knowledge graph like an agent developer</p>
      </div>

      {/* Query Input */}
      <div className="px-4 py-3 border-b border-[#e2e4e9]">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g., What did Alice do?"
            className="flex-1 px-3 py-2 text-sm border border-[#e2e4e9] rounded-[14px] focus:outline-none focus:border-[#3da6a6] focus:ring-1 focus:ring-[#3da6a6]"
            disabled={!allNodesVisible || isSearching}
          />
          <button
            onClick={handleSearch}
            disabled={!allNodesVisible || isSearching || !query.trim()}
            className="px-4 py-2 bg-[#3da6a6] text-white rounded-[14px] text-sm font-medium hover:bg-[#3da6a6]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Example Queries */}
        {allNodesVisible && !searchResults && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-[#6b7280]">Examples:</span>
            {EXAMPLE_QUERIES.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(example)}
                className="text-xs px-2 py-1 bg-[#f8f9fc] border border-[#e2e4e9] rounded-[14px] hover:border-[#3da6a6] hover:text-[#3da6a6] transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        )}

        {/* Waiting State */}
        {!allNodesVisible && (
          <div className="mt-3 text-xs text-[#6b7280]">
            ⏳ Wait for video analysis to complete before querying...
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {searchResults ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-[#0c183d] mb-2">Matched Nodes & Edges</h4>
              <div className="text-xs text-[#6b7280] space-y-1">
                <div className="font-medium text-[#3da6a6]">Nodes ({searchResults.matchedNodes.length}):</div>
                {searchResults.matchedNodes.map(nodeId => {
                  const node = nodes.find(n => n.id === nodeId);
                  return node ? (
                    <div key={nodeId} className="pl-2">• {node.label}</div>
                  ) : null;
                })}
                <div className="font-medium text-[#cc3d8f] mt-2">Edges ({searchResults.matchedEdges.length}):</div>
                {searchResults.matchedEdges.map(edgeId => {
                  const edge = edges.find(e => e.id === edgeId);
                  if (!edge) return null;
                  const source = nodes.find(n => n.id === edge.source)?.label || edge.source;
                  const target = nodes.find(n => n.id === edge.target)?.label || edge.target;
                  return (
                    <div key={edgeId} className="pl-2">• {source} → {target} ({edge.label})</div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[#0c183d] mb-2 flex items-center gap-2">
                <Code className="w-3 h-3" />
                Context for LLM
              </h4>
              <pre className="text-xs bg-[#f8f9fc] border border-[#e2e4e9] rounded-[14px] p-3 overflow-x-auto font-mono text-[#4b5563]">
                {searchResults.context}
              </pre>
            </div>

            <button
              onClick={() => {
                setQuery('');
                setSearchResults(null);
                if (onResults) {
                  onResults([], []);
                }
              }}
              className="text-xs text-[#3da6a6] hover:text-[#3da6a6]/80"
            >
              Clear results
            </button>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-[#6b7280] text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Enter a query to search the knowledge graph</p>
              <p className="text-xs mt-1">Results will highlight relevant nodes and edges</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

