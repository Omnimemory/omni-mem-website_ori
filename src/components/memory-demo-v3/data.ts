/**
 * Data model aligned with MOYAN_AGENT_INFRA architecture (TKG-Graph-v1.0-Ultimate.md):
 * 
 * Video/Audio → Evidence (raw detections) → Entity (resolved) → Event (semantic summaries)
 * 
 * Event nodes are semantic summaries (e.g., "Cafe Visit", "Order Placed")
 * Actions are NOT separate nodes - they are represented as EDGES between entities.
 * 
 * Storage:
 * - Qdrant: memory_text, memory_image, memory_audio, memory_clip_image, memory_face (Evidence)
 * - Neo4j: Entity nodes + Event nodes + Edge relationships (TKG - Temporal Knowledge Graph)
 */

export type DetectionType = 'face' | 'scene' | 'object' | 'speech' | 'action';

export interface Detection {
  id: string;
  time: number;
  type: DetectionType;
  label: string;
  confidence: number;
  bbox?: { x: number; y: number; width: number; height: number };
  transcript?: string; // For speech type
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'evidence' | 'entity' | 'event';
  category: DetectionType | 'person' | 'location' | 'object' | 'event';
  createdAt: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string; // e.g., "BELONGS_TO_ENTITY", "INVOLVES", "OCCURS_AT", "MENTIONED"
  createdAt: number;
}

export interface ExtractionLog {
  id: string;
  time: number;
  message: string;
  type: 'detection' | 'inference' | 'edge';
}

export type DemoState = 'playing' | 'complete';

// ============================================================================
// SCENE DETECTIONS (Raw multimodal input → Evidence)
// ============================================================================
export const SCENE_DETECTIONS: Detection[] = [
  // Face detection
  { id: 'd1', time: 0.5, type: 'face', label: 'Face', confidence: 0.98, bbox: { x: 20, y: 40, width: 15, height: 20 } },
  
  // Scene classification  
  { id: 'd2', time: 1.0, type: 'scene', label: 'Indoor: Cafe', confidence: 0.95, bbox: { x: 55, y: 25, width: 35, height: 45 } },
  
  // Speech-to-text
  { id: 'd3', time: 4.0, type: 'speech', label: 'Speech', confidence: 0.94, transcript: '"One matcha latte please"' },
  
  // Object detection
  { id: 'd4', time: 6.5, type: 'object', label: 'Cup', confidence: 0.99, bbox: { x: 45, y: 50, width: 12, height: 18 } },
  
  // Speech-to-text
  { id: 'd5', time: 8.0, type: 'speech', label: 'Speech', confidence: 0.88, transcript: '"Delicious!"' },
];

// ============================================================================
// GRAPH NODES (Evidence + Entity + Event)
// ============================================================================
export const GRAPH_NODES: GraphNode[] = [
  // === Evidence Nodes (from detections - stored in Qdrant) ===
  { id: 'ev_face', label: 'Face Detection', type: 'evidence', category: 'face', createdAt: 0.5 },
  { id: 'ev_scene', label: 'Scene: Cafe', type: 'evidence', category: 'scene', createdAt: 1.0 },
  { id: 'ev_speech1', label: '"matcha latte"', type: 'evidence', category: 'speech', createdAt: 4.0 },
  { id: 'ev_object', label: 'Object: Cup', type: 'evidence', category: 'object', createdAt: 6.5 },
  { id: 'ev_speech2', label: '"Delicious!"', type: 'evidence', category: 'speech', createdAt: 8.0 },
  
  // === Entity Nodes (resolved from evidence - stored in Neo4j) ===
  { id: 'ent_person', label: 'Person: Alice', type: 'entity', category: 'person', createdAt: 0.8 },
  { id: 'ent_location', label: 'Location: Cafe', type: 'entity', category: 'location', createdAt: 1.3 },
  { id: 'ent_object', label: 'Object: Matcha Latte', type: 'entity', category: 'object', createdAt: 4.3 },
  
  // === Event Nodes (semantic summaries - stored in Neo4j) ===
  { id: 'evt_visit', label: 'Cafe Visit', type: 'event', category: 'event', createdAt: 2.2 },
  { id: 'evt_order', label: 'Order Placed', type: 'event', category: 'event', createdAt: 4.8 },
  { id: 'evt_enjoy', label: 'Enjoyed Drink', type: 'event', category: 'event', createdAt: 8.8 },
];

// ============================================================================
// GRAPH EDGES (Relationships - stored in Neo4j)
// TKG edge types: BELONGS_TO_ENTITY, INVOLVES, OCCURS_AT, MENTIONED
// ============================================================================
export const GRAPH_EDGES: GraphEdge[] = [
  // Evidence → Entity resolution
  { id: 'e1', source: 'ev_face', target: 'ent_person', label: 'BELONGS_TO_ENTITY', createdAt: 0.9 },
  { id: 'e2', source: 'ev_scene', target: 'ent_location', label: 'IDENTIFIED_AS', createdAt: 1.4 },
  { id: 'e3', source: 'ev_speech1', target: 'ent_object', label: 'MENTIONED', createdAt: 4.4 },
  { id: 'e4', source: 'ev_object', target: 'ent_object', label: 'VISUAL_MATCH', createdAt: 7.0 },
  { id: 'e5', source: 'ev_speech2', target: 'ent_object', label: 'SENTIMENT', createdAt: 8.3 },
  
  // Event → Entity relationships (Events INVOLVE entities)
  { id: 'e6', source: 'evt_visit', target: 'ent_person', label: 'INVOLVES', createdAt: 2.3 },
  { id: 'e7', source: 'evt_visit', target: 'ent_location', label: 'OCCURS_AT', createdAt: 2.4 },
  { id: 'e8', source: 'evt_order', target: 'ent_person', label: 'INVOLVES', createdAt: 4.9 },
  { id: 'e9', source: 'evt_order', target: 'ent_object', label: 'INVOLVES', createdAt: 5.0 },
  { id: 'e10', source: 'evt_enjoy', target: 'ent_person', label: 'INVOLVES', createdAt: 8.9 },
  { id: 'e11', source: 'evt_enjoy', target: 'ent_object', label: 'INVOLVES', createdAt: 9.0 },
];

// ============================================================================
// EXTRACTION LOG (System reasoning)
// ============================================================================
export const EXTRACTION_LOGS: ExtractionLog[] = [
  { id: 'log1', time: 0.5, type: 'detection', message: 'Face detected (98% confidence) → memory_face' },
  { id: 'log2', time: 0.9, type: 'inference', message: 'Entity resolved: Person → "Alice"' },
  { id: 'log3', time: 1.0, type: 'detection', message: 'Scene classified: Indoor Cafe → memory_clip_image' },
  { id: 'log4', time: 1.4, type: 'inference', message: 'Entity resolved: Location → "Cafe"' },
  { id: 'log5', time: 2.0, type: 'edge', message: 'Edge created: Alice VISITED Cafe' },
  { id: 'log6', time: 4.0, type: 'detection', message: 'Speech-to-text: "matcha latte" → memory_audio' },
  { id: 'log7', time: 4.4, type: 'inference', message: 'Entity extracted: Object → "Matcha Latte"' },
  { id: 'log8', time: 4.5, type: 'edge', message: 'Edge created: Alice ORDERED Matcha Latte' },
  { id: 'log9', time: 6.5, type: 'detection', message: 'Object detected: Cup (99%) → memory_image' },
  { id: 'log10', time: 7.0, type: 'inference', message: 'Visual matched to entity: Matcha Latte' },
  { id: 'log11', time: 8.0, type: 'detection', message: 'Speech-to-text: "Delicious!" → memory_text' },
  { id: 'log12', time: 8.5, type: 'edge', message: 'Edge created: Alice CONSUMED Matcha Latte' },
  { id: 'log13', time: 2.2, type: 'inference', message: 'Event created: Cafe Visit' },
  { id: 'log14', time: 4.8, type: 'inference', message: 'Event created: Order Placed' },
  { id: 'log15', time: 8.8, type: 'inference', message: 'Event created: Enjoyed Drink' },
  { id: 'log16', time: 10.0, type: 'inference', message: 'TKG complete: 3 entities, 3 events, 11 edges' },
];

export const VIDEO_DURATION = 12;

// ============================================================================
// CHAT SCENARIOS (Pre-defined Q&A for demo)
// ============================================================================
export interface ChatScenario {
  query: string;
  response: string;
  citations: {
    nodeIds: string[];
    edgeIds: string[];
  };
}

export const CHAT_SCENARIOS: ChatScenario[] = [
  {
    query: "What did Alice do today?",
    response: "Alice visited a cafe, ordered a matcha latte, and enjoyed her drink. She expressed satisfaction saying it was delicious.",
    citations: {
      nodeIds: ['ent_person', 'evt_visit', 'evt_order', 'evt_enjoy', 'ent_location', 'ent_object'],
      edgeIds: ['e6', 'e7', 'e8', 'e9', 'e10', 'e11'],
    }
  },
  {
    query: "Where did Alice go?",
    response: "Alice visited a Cafe. The scene was detected as an indoor cafe environment.",
    citations: {
      nodeIds: ['ent_person', 'ent_location', 'ev_scene', 'evt_visit'],
      edgeIds: ['e2', 'e6', 'e7'],
    }
  },
  {
    query: "What did Alice order?",
    response: "Alice ordered a Matcha Latte. She said \"One matcha latte please\" and later received a cup.",
    citations: {
      nodeIds: ['ent_person', 'ent_object', 'ev_speech1', 'ev_object', 'evt_order'],
      edgeIds: ['e3', 'e4', 'e8', 'e9'],
    }
  },
  {
    query: "Was Alice happy?",
    response: "Yes! Alice expressed positive sentiment by saying \"Delicious!\" while enjoying her matcha latte.",
    citations: {
      nodeIds: ['ent_person', 'ev_speech2', 'evt_enjoy', 'ent_object'],
      edgeIds: ['e5', 'e10', 'e11'],
    }
  },
  {
    query: "Show me all the events",
    response: "I found 3 events in Alice's visit:\n\n1. **Cafe Visit** - Alice entered the cafe\n2. **Order Placed** - Alice ordered a matcha latte\n3. **Enjoyed Drink** - Alice consumed and enjoyed her drink",
    citations: {
      nodeIds: ['evt_visit', 'evt_order', 'evt_enjoy'],
      edgeIds: ['e6', 'e7', 'e8', 'e9', 'e10', 'e11'],
    }
  },
];

export const SUGGESTED_QUERIES = [
  "What did Alice do today?",
  "Where did Alice go?",
  "What did she order?",
  "Was Alice happy?",
];
