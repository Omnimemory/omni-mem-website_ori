import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, User, Database, ArrowRight } from 'lucide-react';
import { GraphNode, GraphEdge, CHAT_SCENARIOS, SUGGESTED_QUERIES, VIDEO_DURATION } from './data';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: {
    nodeIds: string[];
    edgeIds: string[];
  };
  timestamp: number;
}

interface MemoryChatInterfaceProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  currentTime: number;
  onHighlight: (nodeIds: string[], edgeIds: string[]) => void;
}

export function MemoryChatInterface({ nodes, edges, currentTime, onHighlight }: MemoryChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      content: 'Memory system ready. Select a query below.',
      timestamp: Date.now(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [usedQueries, setUsedQueries] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isVideoComplete = currentTime >= VIDEO_DURATION;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update highlights when assistant message has citations
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.citations) {
      onHighlight(lastMessage.citations.nodeIds, lastMessage.citations.edgeIds);
    }
  }, [messages, onHighlight]);

  const findMatchingScenario = (query: string): typeof CHAT_SCENARIOS[0] | null => {
    // Exact match first
    const exactMatch = CHAT_SCENARIOS.find(s => s.query === query);
    if (exactMatch) return exactMatch;

    const queryLower = query.toLowerCase();
    
    // Keyword matching
    if (queryLower.includes('alice') && (queryLower.includes('do') || queryLower.includes('did'))) {
      return CHAT_SCENARIOS[0];
    }
    if (queryLower.includes('where') || queryLower.includes('go') || queryLower.includes('visit')) {
      return CHAT_SCENARIOS[1];
    }
    if (queryLower.includes('order') || queryLower.includes('drink') || queryLower.includes('matcha')) {
      return CHAT_SCENARIOS[2];
    }
    if (queryLower.includes('happy') || queryLower.includes('feel') || queryLower.includes('delicious')) {
      return CHAT_SCENARIOS[3];
    }
    if (queryLower.includes('event') || queryLower.includes('all') || queryLower.includes('summary')) {
      return CHAT_SCENARIOS[4];
    }

    return null;
  };

  const handlePresetQuery = (query: string) => {
    if (!isVideoComplete || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setUsedQueries(prev => [...prev, query]);
    setIsTyping(true);

    // Simulate response delay
    setTimeout(() => {
      const scenario = findMatchingScenario(query);
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: scenario?.response || "No matching memories found.",
        citations: scenario?.citations,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      if (scenario?.citations) {
        onHighlight(scenario.citations.nodeIds, scenario.citations.edgeIds);
      }
    }, 600 + Math.random() * 300);
  };

  // Available queries (not yet used)
  const availableQueries = SUGGESTED_QUERIES.filter(q => !usedQueries.includes(q));

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#D1D1D1]">
        <div className="flex items-center gap-3">
          {/* OmniMemory Logo */}
          <div className="w-8 h-8 flex items-center justify-center">
            <img 
              src="/Logo/SVG/Logo-Graphic-OmniMemory.svg" 
              alt="OmniMemory" 
              className="w-7 h-7"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0c183d]" style={{ fontFamily: 'Big Caslon CC, Georgia, serif' }}>
              OmniMemory
            </h3>
            <p className="text-[10px] text-[#424243]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Video Memory Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'system' ? (
                // System message (centered, subtle)
                <div className="w-full flex justify-center">
                  <div className="px-3 py-2 bg-[#f8f9fc] rounded-[14px] text-xs text-[#424243] border border-[#D1D1D1]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {message.content}
                  </div>
                </div>
              ) : message.role === 'user' ? (
                // User message (right side, brand teal)
                <div className="max-w-[85%] flex items-end gap-2">
                  <div className="px-3.5 py-2.5 bg-[#3da6a6] text-white rounded-[14px] rounded-br-[4px]">
                    <p className="text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{message.content}</p>
                  </div>
                  <div className="w-6 h-6 rounded-[14px] border border-[#D1D1D1] flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-[#424243]" strokeWidth={1.5} />
                  </div>
                </div>
              ) : (
                // Assistant message (left side)
                <div className="max-w-[90%] flex items-start gap-2">
                  <div className="w-6 h-6 rounded-[14px] border border-[#3da6a6] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageCircle className="w-3 h-3 text-[#3da6a6]" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <div className="px-3.5 py-2.5 bg-[#f8f9fc] border border-[#D1D1D1] rounded-[14px] rounded-bl-[4px]">
                      <p className="text-sm text-[#0c183d] leading-relaxed whitespace-pre-line" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {message.content}
                      </p>
                    </div>
                    
                    {/* Memory Citations */}
                    {message.citations && message.citations.nodeIds.length > 0 && (
                      <div className="pl-1">
                        <div className="flex items-center gap-1 text-[10px] text-[#424243] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <Database className="w-3 h-3" strokeWidth={1.5} />
                          <span>Memory sources</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {message.citations.nodeIds.slice(0, 5).map(nodeId => {
                            const node = nodes.find(n => n.id === nodeId);
                            if (!node) return null;
                            
                            const typeColors: Record<string, string> = {
                              evidence: 'text-[#0092B8] border-[#0092B8]',
                              entity: 'text-[#3da6a6] border-[#3da6a6]',
                              event: 'text-[#471D8F] border-[#471D8F]',
                            };
                            
                            return (
                              <span
                                key={nodeId}
                                className={`px-1.5 py-0.5 text-[9px] font-medium rounded-[8px] border bg-white ${typeColors[node.type] || 'text-[#424243] border-[#D1D1D1]'}`}
                                style={{ fontFamily: 'Inter, sans-serif' }}
                              >
                                {node.label}
                              </span>
                            );
                          })}
                          {message.citations.nodeIds.length > 5 && (
                            <span className="px-1.5 py-0.5 text-[9px] text-[#424243]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              +{message.citations.nodeIds.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2"
          >
            <div className="w-6 h-6 rounded-[14px] border border-[#3da6a6] flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-3 h-3 text-[#3da6a6]" strokeWidth={1.5} />
            </div>
            <div className="px-3.5 py-3 bg-[#f8f9fc] border border-[#D1D1D1] rounded-[14px] rounded-bl-[4px]">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#3da6a6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#3da6a6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#3da6a6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Query Buttons */}
      <div className="p-3 border-t border-[#D1D1D1] bg-[#f8f9fc]">
        {/* Progress indicator when analyzing */}
        {!isVideoComplete && (
          <div className="flex items-center justify-center gap-2 mb-3 px-3 py-2 border border-[#D1D1D1] rounded-[14px] bg-white">
            <div className="w-3 h-3 border-2 border-[#3da6a6] border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] text-[#424243] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
              Building memory... {Math.round((currentTime / VIDEO_DURATION) * 100)}%
            </span>
            <div className="flex-1 h-1 bg-[#D1D1D1] rounded-full overflow-hidden max-w-[80px]">
              <div 
                className="h-full bg-[#3da6a6] transition-all duration-100"
                style={{ width: `${(currentTime / VIDEO_DURATION) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Query buttons - always visible */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {(isVideoComplete ? availableQueries : SUGGESTED_QUERIES).map((query, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetQuery(query)}
                disabled={!isVideoComplete || isTyping}
                className={`px-3 py-2 text-xs border rounded-[14px] transition-colors flex items-center gap-1.5 ${
                  isVideoComplete && !isTyping
                    ? 'border-[#3da6a6] text-[#3da6a6] bg-white hover:bg-[#3da6a6] hover:text-white'
                    : 'border-[#D1D1D1] text-[#C0C0C0] bg-[#f8f9fc] cursor-not-allowed'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                {query}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
