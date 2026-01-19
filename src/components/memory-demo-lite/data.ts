export type DemoState = 'playing' | 'questioning' | 'answering';

export type NodeLayer = 'evidence' | 'entity';

export interface GraphNode {
  id: string;
  label: string;
  layer: NodeLayer;
  type: 'person' | 'object' | 'location' | 'action' | 'utterance' | 'visual' | 'temporal';
  startTime: number; // When it appears (seconds)
  x?: number; // Graph position (calculated)
  y?: number; // Graph position (calculated)
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'detected' | 'inferred' | 'temporal' | 'spatial';
  startTime: number; // When connection appears
}

export interface CanvasScene {
  time: number;
  elements: {
    type: 'person' | 'location' | 'object';
    x: number; // 0-100%
    y: number; // 0-100%
    label?: string;
  }[];
}

export interface RecallQnA {
  question: string;
  answer: string;
  evidencePath: string[]; // Node IDs forming the answer path
  evidenceTime: number;
}

// Evidence Layer (Perception) - What the system "sees"
export const EVIDENCE_NODES: GraphNode[] = [
  { id: 'ev1', label: 'Visual: Face Track', layer: 'evidence', type: 'visual', startTime: 1.0 },
  { id: 'ev2', label: 'Audio: "Kyoto Station"', layer: 'evidence', type: 'utterance', startTime: 2.0 },
  { id: 'ev3', label: 'Visual: Bamboo Grove', layer: 'evidence', type: 'visual', startTime: 4.0 },
  { id: 'ev4', label: 'Action: Walking', layer: 'evidence', type: 'action', startTime: 4.5 },
  { id: 'ev5', label: 'Visual: Cafe Sign', layer: 'evidence', type: 'visual', startTime: 6.0 },
  { id: 'ev6', label: 'Visual: Cup Detection', layer: 'evidence', type: 'visual', startTime: 7.0 },
  { id: 'ev7', label: 'Audio: "Delicious"', layer: 'evidence', type: 'utterance', startTime: 7.5 },
  { id: 'ev8', label: 'Visual: Temple Gate', layer: 'evidence', type: 'visual', startTime: 9.0 },
  { id: 'ev9', label: 'Action: Selfie Pose', layer: 'evidence', type: 'action', startTime: 9.5 },
];

// Entity Layer (Cognition) - What the system "understands"
export const ENTITY_NODES: GraphNode[] = [
  { id: 'e1', label: 'Alice', layer: 'entity', type: 'person', startTime: 1.5 },
  { id: 'e2', label: 'Kyoto Station', layer: 'entity', type: 'location', startTime: 2.5 },
  { id: 'e3', label: 'Arashiyama', layer: 'entity', type: 'location', startTime: 4.5 },
  { id: 'e4', label: 'Matcha Latte', layer: 'entity', type: 'object', startTime: 7.2 },
  { id: 'e5', label: '% Arabica', layer: 'entity', type: 'location', startTime: 6.5 },
  { id: 'e6', label: 'Kiyomizu-dera', layer: 'entity', type: 'location', startTime: 9.2 },
];

// Edges: Evidence -> Entity (inference)
export const GRAPH_EDGES: GraphEdge[] = [
  { source: 'ev1', target: 'e1', type: 'detected', startTime: 1.5 },
  { source: 'ev2', target: 'e2', type: 'detected', startTime: 2.5 },
  { source: 'ev3', target: 'e3', type: 'detected', startTime: 4.5 },
  { source: 'ev4', target: 'e1', type: 'inferred', startTime: 5.0 },
  { source: 'ev5', target: 'e5', type: 'detected', startTime: 6.5 },
  { source: 'ev6', target: 'e4', type: 'detected', startTime: 7.2 },
  { source: 'ev7', target: 'e1', type: 'inferred', startTime: 7.8 },
  { source: 'ev7', target: 'e4', type: 'inferred', startTime: 7.8 },
  { source: 'ev8', target: 'e6', type: 'detected', startTime: 9.2 },
  { source: 'ev9', target: 'e1', type: 'inferred', startTime: 10.0 },
  { source: 'ev9', target: 'e6', type: 'spatial', startTime: 10.0 },
];

// Canvas animation scenes for simulated video
export const CANVAS_SCENES: CanvasScene[] = [
  { time: 0, elements: [{ type: 'person', x: 50, y: 50, label: 'Alice' }] },
  { time: 2, elements: [{ type: 'person', x: 50, y: 50 }, { type: 'location', x: 70, y: 30, label: 'Station' }] },
  { time: 4, elements: [{ type: 'person', x: 60, y: 40 }, { type: 'location', x: 80, y: 60, label: 'Bamboo' }] },
  { time: 6, elements: [{ type: 'person', x: 40, y: 60 }, { type: 'location', x: 30, y: 70, label: 'Cafe' }] },
  { time: 7, elements: [{ type: 'person', x: 40, y: 60 }, { type: 'location', x: 30, y: 70 }, { type: 'object', x: 45, y: 55, label: 'Latte' }] },
  { time: 9, elements: [{ type: 'person', x: 70, y: 40 }, { type: 'location', x: 75, y: 30, label: 'Temple' }] },
];

export const DEMO_QUESTIONS: RecallQnA[] = [
  {
    question: "What did Alice drink?",
    answer: "Alice drank a Matcha Latte at % Arabica cafe.",
    evidencePath: ['ev6', 'e4', 'ev5', 'e5', 'e1'],
    evidenceTime: 7.0,
  },
  {
    question: "Where did Alice visit?",
    answer: "Alice visited Kyoto Station, Arashiyama Bamboo Grove, % Arabica cafe, and Kiyomizu-dera temple.",
    evidencePath: ['ev2', 'e2', 'ev3', 'e3', 'ev5', 'e5', 'ev8', 'e6'],
    evidenceTime: 9.0,
  },
];

export const VIDEO_DURATION = 12; // Total simulated duration
export const AUTO_PLAY_DELAY = 3000; // Delay before auto-start (ms)
