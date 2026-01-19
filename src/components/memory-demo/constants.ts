import { GraphData, TimelineEvent, TraceStep } from './types';

export const INITIAL_GRAPH_DATA: GraphData = {
  nodes: [],
  links: []
};

// Brand Colors - OmniMemory Palette
const C = {
  MEDIA: '#424243',        // Deep Black - Physical/Index
  TIME: '#424243',         // Deep Black - TimeSlice
  EVIDENCE: '#0092B8',     // Cyan - Perception (Evidence/Sensors)
  ASR: '#2BA399',          // Seafoam - Utterance
  ENTITY: '#3da6a6',       // Teal - Entity (Global ID) - Primary Accent
  EVENT: '#cc3d8f',        // Magenta - Event (Process/Atomic)
  KNOWLEDGE: '#754aad',    // Violet - Fact/Abstract
  REGION: '#C0C0C0'        // Silver - Spatial Region
};

// STH = (V, H, τ, σ, λ) Implementation
export const DENSE_GRAPH_DATA: GraphData = {
  nodes: [
    // --- 1. Physical Layer (Index) ---
    // Media Segment
    { id: "m1", label: "Media_Seg_01", type: "Media", color: C.MEDIA, val: 50 },
    
    // TimeSlices (τ) - Hierarchical
    { id: "ts_root", label: "Day_14", type: "TimeSlice", color: C.TIME, val: 40 },
    { id: "ts_morning", label: "Morning", type: "TimeSlice", color: C.TIME, val: 30 },
    { id: "ts_noon", label: "Noon_12:30", type: "TimeSlice", color: C.TIME, val: 30 },
    { id: "ts_afternoon", label: "PM_14:15", type: "TimeSlice", color: C.TIME, val: 30 },

    // Spatial Regions (σ)
    { id: "n2", label: "Kyoto", type: "Region", color: C.REGION, val: 40 }, // Mapped ID for recall
    { id: "n3", label: "Kiyomizu-dera", type: "Region", color: C.REGION, val: 35 }, // Mapped ID
    { id: "n6", label: "Matcha Cafe", type: "Region", color: C.REGION, val: 25 }, // Mapped ID
    { id: "n11", label: "Bamboo Forest", type: "Region", color: C.REGION, val: 28 }, // Mapped ID
    { id: "r_stage", label: "Wooden Stage", type: "Region", color: C.REGION, val: 20 },

    // --- 2. Perception Layer (Evidence) ---
    // Visual Evidence (Det/Track)
    { id: "ev_face_01", label: "Face_Track_A", type: "Evidence", color: C.EVIDENCE, val: 15 },
    { id: "ev_obj_01", label: "Cup_Detect_99%", type: "Evidence", color: C.EVIDENCE, val: 15 },
    { id: "ev_smile", label: "Exp_Smile_0.9", type: "Evidence", color: C.EVIDENCE, val: 15 },
    { id: "n4", label: "Emotion_Happy", type: "Evidence", color: C.EVIDENCE, val: 20 }, // Mapped ID (Smile)
    
    // Utterance Evidence (ASR)
    { id: "asr_1", label: "\"This matcha...\"", type: "Utterance", color: C.ASR, val: 18 },
    { id: "asr_2", label: "\"So beautiful!\"", type: "Utterance", color: C.ASR, val: 18 },

    // --- 3. Cognition Layer (Entity/Event) ---
    // Entities (Global Identity)
    { id: "n1", label: "Alice", type: "Person", color: C.ENTITY, val: 45 }, // Core Entity
    { id: "n7", label: "Latte", type: "Object", color: C.ENTITY, val: 20 }, // Promoted Object
    { id: "n9", label: "Kimono", type: "Object", color: C.ENTITY, val: 20 },
    
    // Events (Atomic/Process)
    { id: "n5", label: "Event:Drink", type: "Event", color: C.EVENT, val: 25 },
    { id: "n8", label: "Event:Selfie", type: "Event", color: C.EVENT, val: 25 },
    { id: "n10", label: "Event:Walk", type: "Event", color: C.EVENT, val: 22 },
    
    // Knowledge/Facts (Summary)
    { id: "k1", label: "Fact:Alice likes Matcha", type: "Knowledge", color: C.KNOWLEDGE, val: 20 },
    { id: "k2", label: "Fact:Trip to Kyoto", type: "Knowledge", color: C.KNOWLEDGE, val: 30 },

    // --- Density Fillers (Context) ---
    { id: "ev_env_1", label: "Audio:Chatter", type: "Evidence", color: C.EVIDENCE, val: 12 },
    { id: "ev_env_2", label: "Scene:Crowd", type: "Evidence", color: C.EVIDENCE, val: 12 },
    { id: "n18", label: "Arashiyama", type: "Region", color: C.REGION, val: 25 },
    { id: "ts_late", label: "Sunset", type: "TimeSlice", color: C.TIME, val: 25 },
    { id: "n12", label: "Event:WatchSunset", type: "Event", color: C.EVENT, val: 20 },
  ],
  links: [
    // --- Timeline & Media Structure ---
    { source: "m1", target: "ts_root", label: "HAS_TIMELINE" },
    { source: "ts_root", target: "ts_morning", label: "CONTAINS" },
    { source: "ts_root", target: "ts_noon", label: "CONTAINS" },
    { source: "ts_root", target: "ts_afternoon", label: "CONTAINS" },
    { source: "ts_root", target: "ts_late", label: "CONTAINS" },

    // --- Spatial Hierarchy ---
    { source: "n2", target: "n6", label: "SPATIALLY_CONTAINS" }, // Kyoto -> Cafe
    { source: "n2", target: "n3", label: "SPATIALLY_CONTAINS" }, // Kyoto -> Kiyomizu
    { source: "n3", target: "r_stage", label: "SPATIALLY_CONTAINS" },
    { source: "n2", target: "n11", label: "SPATIALLY_CONTAINS" }, // Kyoto -> Bamboo
    { source: "n2", target: "n18", label: "SPATIALLY_CONTAINS" },

    // --- Event to Spatio-Temporal Anchoring ---
    { source: "n5", target: "ts_noon", label: "OCCURS_AT" }, // Drink at Noon
    { source: "n5", target: "n6", label: "OCCURS_IN" },    // Drink in Cafe
    { source: "n8", target: "ts_afternoon", label: "OCCURS_AT" }, // Selfie in PM
    { source: "n8", target: "r_stage", label: "OCCURS_IN" },    // Selfie on Stage
    { source: "n10", target: "ts_morning", label: "OCCURS_AT" }, // Walk in Morning
    { source: "n10", target: "n11", label: "OCCURS_IN" },       // Walk in Bamboo

    // --- Evidence Support (Grounding) ---
    // Utterance Binding
    { source: "m1", target: "asr_1", label: "CONTAINS_AUDIO" },
    { source: "ts_noon", target: "asr_1", label: "TEMPORALLY_COVERS" },
    { source: "asr_1", target: "n1", label: "SPOKEN_BY" }, // Alice spoke it
    { source: "n5", target: "asr_1", label: "SUPPORTED_BY" }, // Drinking event supported by speech
    
    { source: "ts_afternoon", target: "asr_2", label: "TEMPORALLY_COVERS" },
    { source: "asr_2", target: "n1", label: "SPOKEN_BY" },
    { source: "n8", target: "asr_2", label: "SUPPORTED_BY" },

    // Visual Binding
    { source: "ts_noon", target: "ev_obj_01", label: "FRAME_DATA" },
    { source: "ev_obj_01", target: "n7", label: "RESOLVED_TO" }, // Cup -> Latte
    
    { source: "ts_noon", target: "ev_face_01", label: "FRAME_DATA" },
    { source: "ev_face_01", target: "n1", label: "RESOLVED_TO" }, // Face -> Alice
    
    { source: "ev_smile", target: "n1", label: "OBSERVED_ON" },
    { source: "n4", target: "ev_smile", label: "DERIVED_FROM" },

    // --- Semantic / Entity Relations ---
    { source: "n5", target: "n1", label: "INVOLVES_AGENT" },
    { source: "n5", target: "n7", label: "INVOLVES_OBJECT" }, // Drink -> Latte
    { source: "n8", target: "n1", label: "INVOLVES_AGENT" },
    { source: "n8", target: "n9", label: "INVOLVES_OBJECT" }, // Selfie -> Kimono
    { source: "n10", target: "n1", label: "INVOLVES_AGENT" },

    // --- Knowledge / Abstract ---
    { source: "k1", target: "n5", label: "DESCRIBES_PATTERN" },
    { source: "k1", target: "n1", label: "ATTRIBUTE_OF" },
    { source: "k2", target: "m1", label: "SUMMARY_OF" },
    
    // --- Contextual Density ---
    { source: "ts_noon", target: "ev_env_1", label: "AMBIANCE" },
    { source: "ts_afternoon", target: "ev_env_2", label: "AMBIANCE" },
    { source: "n12", target: "ts_late", label: "OCCURS_AT" },
    { source: "n12", target: "n18", label: "OCCURS_IN" }
  ]
};

export const DENSE_TIMELINE_EVENTS: TimelineEvent[] = [
  { id: 't1', time: '09:15', description: 'Shinkansen arrival at Kyoto Station', type: 'movement' },
  { id: 't2', time: '10:00', description: 'Checking in at Hotel (QR Scan)', type: 'action' },
  { id: 't3', time: '10:45', description: 'Walking through Arashiyama Bamboo Grove', type: 'movement' },
  { id: 't4', time: '11:30', description: 'Taking photos with Kimono rental', type: 'visual' },
  { id: 't5', time: '12:30', description: 'Matcha Latte break at %Arabica', type: 'action' },
  { id: 't6', time: '14:15', description: 'Visiting Kiyomizu-dera main hall', type: 'movement' },
  { id: 't7', time: '14:45', description: 'Selfie sequence at the wooden stage', type: 'visual' },
  { id: 't8', time: '16:00', description: 'Buying Omamori (charms) at gift shop', type: 'action' },
  { id: 't9', time: '17:30', description: 'Sunset view over the city', type: 'visual' },
];

export const DEMO_SCRIPT: {
  question: string;
  recallNodes: string[];
  recallEvents: string[];
  answer: string;
  traces: TraceStep[];
}[] = [
  {
    question: "What did Alice drink during her trip?",
    // Recall IDs must match nodes in DENSE_GRAPH_DATA
    recallNodes: ["n1", "n5", "n7", "n6", "ev_obj_01", "ts_noon"], 
    recallEvents: ["t5"], 
    answer: "According to the visual timeline, Alice visited a cafe at 12:30 and drank a Matcha Latte.",
    traces: [
      { type: 'thinking', content: 'Parsing query for entity: "Drink" or "Beverage"' },
      { type: 'search', content: 'Graph Traversal: (Alice)-[INVOLVES]->(Event)-[OCCURS_AT]->(Time)' },
      { type: 'search_result', content: 'Found Node: "Latte" (Confidence: 0.99)' },
      { type: 'planning', content: 'Cross-referencing timestamp in timeline...' }
    ]
  },
  {
    question: "Did she visit any temples?",
    recallNodes: ["n3", "n18", "n11", "ts_afternoon", "r_stage"], 
    recallEvents: ["t6", "t7"], 
    answer: "Yes, she visited the Kiyomizu-dera temple around 14:15. There is also footage of her in the Arashiyama district earlier that morning.",
    traces: [
      { type: 'thinking', content: 'Identifying semantic category: "Temple" / "Landmark"' },
      { type: 'search', content: 'Vector Search: "Kiyomizu-dera"' },
      { type: 'search_result', content: 'Match Found: Timeline Event T6 & T7' },
      { type: 'planning', content: 'Synthesizing location data.' }
    ]
  }
];

export const INITIAL_CHAT_MESSAGE: import('./types').ChatMessage = {
  id: 'welcome',
  role: 'agent',
  content: 'Memory core initialized. Waiting for input stream...'
};

