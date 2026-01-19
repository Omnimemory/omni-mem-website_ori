import React, { useState, useRef, useEffect } from 'react';
import { VideoUploader } from './components/VideoUploader';
import { ProcessingStatus } from './components/ProcessingStatus';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { AgentChat } from './components/AgentChat';
import { SemanticTimeline } from './components/SemanticTimeline';
import { Zap, Activity, BrainCircuit } from 'lucide-react';
import { 
  GraphData, 
  ProcessStage, 
  LogEntry, 
  ChatMessage, 
  TimelineEvent, 
  TraceStep 
} from './types';
import { 
  INITIAL_GRAPH_DATA, 
  DENSE_GRAPH_DATA, 
  DENSE_TIMELINE_EVENTS,
  INITIAL_CHAT_MESSAGE,
  DEMO_SCRIPT
} from './constants';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function App() {
  // --- State ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  
  const [graphData, setGraphData] = useState<GraphData>(INITIAL_GRAPH_DATA);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [memoryUsage, setMemoryUsage] = useState(120);
  
  const [stages, setStages] = useState<ProcessStage[]>([
    { id: 'asr', label: 'Audio Processing', progress: 0, status: 'idle' },
    { id: 'vision', label: 'Visual Analysis', progress: 0, status: 'idle' },
    { id: 'semantic', label: 'Memory Encoding', progress: 0, status: 'idle' }
  ]);
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([INITIAL_CHAT_MESSAGE]);
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  
  // State for Ghost Typing
  const [demoInputValue, setDemoInputValue] = useState('');

  // Ref to track mounted state for async operations
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    if (!isMountedRef.current) return;
    setLogs(prev => [...prev.slice(-7), {
      id: Math.random().toString(36),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      message,
      type
    }]);
  };

  const updateStage = (id: string, updates: Partial<ProcessStage>) => {
    if (!isMountedRef.current) return;
    setStages(prev => prev.map(stage => stage.id === id ? { ...stage, ...updates } : stage));
  };

  // --- The Main Sequence ---
  const startDemoSequence = async () => {
    if (isProcessing || isUploadComplete) return;

    // 1. Initialization
    setIsProcessing(true);
    setGraphData(INITIAL_GRAPH_DATA);
    setTimelineEvents([]);
    setLogs([]);
    setStages(prev => prev.map(s => ({ ...s, progress: 0, status: 'idle' })));
    setMemoryUsage(120);
    setChatMessages([INITIAL_CHAT_MESSAGE]);
    
    addLog("System initialized. ContextOS v2.0", 'info');
    await wait(800);

    // 2. Upload Simulation
    addLog("Ingesting video source: Kyoto_Vlog_4K.mp4", 'info');
    await wait(1000);

    // 3. ASR Processing
    updateStage('asr', { status: 'running' });
    await wait(800);
    updateStage('asr', { progress: 45 });
    addLog("Extracting audio track...", 'info');
    await wait(800);
    updateStage('asr', { progress: 100, status: 'completed' });
    addLog("ASR Complete. 452 words indexed.", 'success');

    // 4. Vision Processing
    updateStage('vision', { status: 'running' });
    for (let i = 0; i < 5; i++) {
        if (!isMountedRef.current) return;
        setMemoryUsage(prev => prev + Math.floor(Math.random() * 40));
        await wait(300);
    }
    updateStage('vision', { progress: 60 });
    addLog("Vision Model: Identifying temporal objects...", 'info');
    await wait(1000);
    updateStage('vision', { progress: 100, status: 'completed' });
    addLog("Object Detection: 98.5% confidence.", 'success');

    // 5. Semantic Processing
    updateStage('semantic', { status: 'running' });
    addLog("Building Knowledge Graph Vectors...", 'warning');
    await wait(1500);
    
    // 6. Finalize Processing
    updateStage('semantic', { progress: 100, status: 'completed' });
    
    // Reveal Data
    setGraphData(DENSE_GRAPH_DATA);
    setTimelineEvents(DENSE_TIMELINE_EVENTS);
    setIsUploadComplete(true);
    setIsProcessing(false);
    addLog("Memory Core Online. Ready for queries.", 'success');
    
    await wait(2000);

    // 7. Start Chat Script
    runChatScript();
  };

  const runChatScript = async () => {
    for (const scriptItem of DEMO_SCRIPT) {
        if (!isMountedRef.current) break;

        // --- Step 1: Simulate Typing User Question ---
        const questionText = scriptItem.question;
        for (let i = 0; i <= questionText.length; i++) {
            if (!isMountedRef.current) break;
            setDemoInputValue(questionText.slice(0, i));
            await wait(40 + Math.random() * 30); // Random typing speed
        }
        await wait(600); // Pause before "sending"

        // --- Step 2: "Send" Message ---
        setDemoInputValue(''); // Clear input
        const userMsgId = Date.now().toString();
        setChatMessages(prev => [...prev, { id: userMsgId, role: 'user', content: questionText }]);
        setIsChatProcessing(true);
        
        await wait(1000); 

        // --- Step 3: Agent Thinking & Traces ---
        const agentMsgId = (Date.now() + 1).toString();
        const currentTraces: TraceStep[] = [];
        setChatMessages(prev => [...prev, { id: agentMsgId, role: 'agent', content: '', traces: [], isTyping: true }]);

        for (const trace of scriptItem.traces) {
            currentTraces.push(trace);
            setChatMessages(prev => prev.map(m => m.id === agentMsgId ? { ...m, traces: [...currentTraces] } : m));
            
            if (trace.type === 'search_result') {
                // Highlight Graph
                setGraphData(prev => ({
                    ...prev,
                    nodes: prev.nodes.map(n => ({
                        ...n,
                        isHighlighted: scriptItem.recallNodes.includes(n.id)
                    }))
                }));
                // Highlight Timeline
                setTimelineEvents(prev => prev.map(e => ({
                    ...e,
                    isHighlighted: scriptItem.recallEvents.includes(e.id)
                })));
                addLog(`Recall Triggered: ${scriptItem.recallEvents.length} events, ${scriptItem.recallNodes.length} nodes.`, 'recall');
            }
            
            await wait(1200);
        }

        // --- Step 4: Agent Answer (Typewriter) ---
        let currentText = '';
        const words = scriptItem.answer.split(' ');
        
        for (let i = 0; i < words.length; i++) {
            currentText += (i > 0 ? ' ' : '') + words[i];
            setChatMessages(prev => prev.map(m => m.id === agentMsgId ? { ...m, content: currentText } : m));
            // Slower typing speed as requested (150ms)
            await wait(150);
        }

        setChatMessages(prev => prev.map(m => m.id === agentMsgId ? { ...m, isTyping: false } : m));
        setIsChatProcessing(false);
        
        await wait(3000); // Wait before next question

        // Reset Highlights
        setGraphData(prev => ({ ...prev, nodes: prev.nodes.map(n => ({...n, isHighlighted: false})) }));
        setTimelineEvents(prev => prev.map(e => ({...e, isHighlighted: false})));
    }
    
    addLog("Demo interaction sequence complete.", 'info');
  };

  return (
    <div className="w-full h-screen bg-theme-bg text-theme-text overflow-hidden flex flex-col font-sans selection:bg-theme-accent selection:text-white">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-theme-border/40 bg-theme-bg/50 backdrop-blur-sm z-50 shrink-0">
        <div className="flex items-center gap-3">
           <div className="relative flex h-3 w-3">
             <span className="relative inline-flex rounded-full h-3 w-3 bg-theme-success"></span>
             {isProcessing && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-theme-success opacity-75"></span>}
           </div>
           <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
             ContextOS <span className="text-theme-muted font-normal">Memory Agent</span>
           </h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-theme-muted">
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-theme-item border border-theme-border/50">
             <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
             <span className="text-theme-text">Gemini 2.5 Flash</span>
           </div>
        </div>
      </header>

      {/* Main Content Area - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Context Stream (30% width, min 320px) */}
        <div className="w-[30%] min-w-[320px] max-w-[400px] flex flex-col border-r border-theme-border/40 bg-theme-bg">
          {/* 1. Input Source - Triggers the demo */}
          <div className="p-4 border-b border-theme-border/20">
            <VideoUploader 
              onUploadStart={startDemoSequence} 
              isProcessing={isProcessing} 
              isComplete={isUploadComplete} 
            />
          </div>
          
          {/* 2. Processing Logs */}
          <div className="p-4 border-b border-theme-border/20 shrink-0">
             <ProcessingStatus 
              stages={stages} 
              logs={logs} 
              memoryUsage={memoryUsage}
            />
          </div>

          {/* 3. Memory Timeline (Takes remaining height) */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col p-4 bg-theme-bg/50">
            <div className="flex items-center gap-2 mb-3 px-1">
               <Activity className="w-4 h-4 text-theme-accent" />
               <h3 className="text-sm font-semibold text-white">Memory Timeline</h3>
            </div>
            <div className="flex-1 rounded-2xl border border-theme-border/40 bg-theme-card/50 overflow-hidden">
              <SemanticTimeline events={timelineEvents} />
            </div>
          </div>
        </div>

        {/* Right Main Area: Cognition & Chat (70% width) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0c0c0e]">
          
          {/* Top: Knowledge Graph (60% Height) */}
          <div className="flex-[3] min-h-0 relative border-b border-theme-border/40 flex flex-col">
             <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-theme-card/80 border border-theme-border/50 backdrop-blur-md shadow-lg">
                <BrainCircuit className="w-4 h-4 text-theme-accent" />
                <span className="text-xs font-medium text-white">Semantic Knowledge Graph</span>
             </div>
             <div className="flex-1 w-full h-full">
               <KnowledgeGraph data={graphData} />
             </div>
          </div>

          {/* Bottom: Agent Chat (40% Height) */}
          <div className="flex-[2] min-h-0 flex flex-col">
             <AgentChat 
              messages={chatMessages} 
              onSendMessage={() => {}}
              isProcessing={isChatProcessing || isProcessing}
              demoInputValue={demoInputValue}
             />
          </div>

        </div>

      </div>
    </div>
  );
}