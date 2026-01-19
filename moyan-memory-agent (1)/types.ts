
export type NodeType = 
  | 'Person' 
  | 'Location' 
  | 'Action' 
  | 'Object' 
  | 'Emotion' 
  | 'TimeSlice'      // New: τ (Time)
  | 'Region'         // New: σ (Space)
  | 'Media'          // New: MediaSegment
  | 'Evidence'       // New: Perception (Visual/Audio)
  | 'Utterance'      // New: ASR Evidence
  | 'Event'          // New: Cognition Event
  | 'Knowledge';     // New: Fact/Summary

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  color: string;
  val: number; // Size
  isHighlighted?: boolean; // For recall visualization
  // d3 simulation properties
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphEdge[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'recall';
}

export interface TraceStep {
  type: 'thinking' | 'search' | 'search_result' | 'planning';
  content: string;
  details?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  traces?: TraceStep[];
  isTyping?: boolean;
}

export interface TimelineEvent {
  id: string;
  time: string;
  description: string;
  type: 'movement' | 'action' | 'visual' | 'auditory';
  isHighlighted?: boolean; // For recall visualization
}

export interface ProcessStage {
  id: 'asr' | 'vision' | 'semantic';
  label: string;
  progress: number; // 0-100
  status: 'idle' | 'running' | 'completed';
}
