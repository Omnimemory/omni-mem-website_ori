import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { ChatMessage, TraceStep } from '../types';

interface AgentChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  demoInputValue?: string; // New prop for ghost typing
}

const TraceStepItem: React.FC<{ step: TraceStep }> = ({ step }) => {
  return (
    <div className="flex items-center gap-2 text-xs text-theme-accent/80 mb-1.5 font-medium animate-in fade-in slide-in-from-left-2 font-mono">
      <Sparkles className="w-3 h-3" />
      <span>{step.content}</span>
    </div>
  );
};

export const AgentChat: React.FC<AgentChatProps> = ({ messages, onSendMessage, isProcessing, demoInputValue = '' }) => {
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync internal state with demo ghost typing
  useEffect(() => {
    // We strictly follow demoInputValue if it is being driven by the parent script.
    // This allows the parent to set it to '' to clear the box.
    setInputValue(demoInputValue);
  }, [demoInputValue]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messages.length, messages.map(m => m.content).join('')]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-theme-card/30 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
            
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              
              {/* Traces for Agent */}
              {msg.role === 'agent' && msg.traces && msg.traces.length > 0 && (
                <div className="mb-4 pl-2 border-l-2 border-theme-border/50">
                  {msg.traces.map((trace, idx) => (
                    <TraceStepItem key={idx} step={trace} />
                  ))}
                </div>
              )}

              {/* Message Content */}
              {msg.role === 'user' ? (
                <div className="px-5 py-3 bg-theme-item text-white rounded-2xl rounded-tr-sm text-sm border border-theme-border/50 shadow-sm">
                  {msg.content}
                </div>
              ) : (
                <div className="px-2 text-sm text-gray-300 leading-relaxed">
                  {msg.isTyping ? (
                     <span className="typing-cursor text-white">{msg.content}</span>
                  ) : (
                     <span className="text-white">{msg.content}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-theme-border/20 bg-theme-bg/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto w-full">
           <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              // Only allow manual typing if we are NOT in the middle of a demo script typing (usually demoInputValue would be updated by parent)
              // But for simplicity, we allow manual override, though the parent might overwrite it if script is running.
              setInputValue(e.target.value);
            }}
            placeholder="Ask a question about the video..."
            className="w-full bg-theme-item/50 text-white text-sm rounded-full py-3 pl-5 pr-12 focus:outline-none focus:ring-1 focus:ring-theme-accent border border-theme-border/50 placeholder-theme-muted/50 transition-all shadow-lg"
            disabled={isProcessing}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isProcessing}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-theme-accent text-white rounded-full transition-all transform 
              ${(!inputValue.trim() || isProcessing) ? 'opacity-50 scale-90' : 'hover:bg-blue-600 scale-100 shadow-md'}
            `}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};