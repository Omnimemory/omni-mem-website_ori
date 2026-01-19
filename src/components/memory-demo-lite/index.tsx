import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sparkles, User, RotateCcw } from 'lucide-react';
import { DemoState, EVIDENCE_NODES, ENTITY_NODES, GRAPH_EDGES, DEMO_QUESTIONS, VIDEO_DURATION } from './data';
import { VideoCanvas } from './VideoCanvas';
import { DenseGraph } from './DenseGraph';
import { MemoryStream } from './MemoryStream';

export function MemoryPlayerLite() {
  const [state, setState] = useState<DemoState>('playing');
  const [currentTime, setCurrentTime] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play sequence
  useEffect(() => {
    if (isPaused || state === 'answering') return;

    if (state === 'playing') {
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1;
          
          // Transition to questioning when video is 80% complete
          if (next >= VIDEO_DURATION * 0.8 && state === 'playing') {
            setState('questioning');
            return next;
          }

          if (next >= VIDEO_DURATION) {
            clearInterval(interval);
            setState('questioning');
            return VIDEO_DURATION;
          }
          return next;
        });
      }, 100);

      return () => clearInterval(interval);
    }

    if (state === 'questioning') {
      // Show question for 3 seconds, then answer
      const timer = setTimeout(() => {
        setState('answering');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, isPaused]);

  // Auto-reset after answering
  useEffect(() => {
    if (state === 'answering') {
      const timer = setTimeout(() => {
        // Move to next question or reset
        const nextIndex = (currentQuestionIndex + 1) % DEMO_QUESTIONS.length;
        setCurrentQuestionIndex(nextIndex);
        setCurrentTime(0);
        setState('playing');
      }, 8000); // Show answer for 8 seconds
      return () => clearTimeout(timer);
    }
  }, [state, currentQuestionIndex]);

  const handleReset = () => {
    setCurrentTime(0);
    setCurrentQuestionIndex(0);
    setState('playing');
    setIsPaused(false);
  };

  const currentQuestion = DEMO_QUESTIONS[currentQuestionIndex];
  const visibleEvidence = EVIDENCE_NODES.filter(n => currentTime >= n.startTime);
  const visibleEntities = ENTITY_NODES.filter(n => currentTime >= n.startTime);
  const visibleEdges = GRAPH_EDGES.filter(e => currentTime >= e.startTime);

  // Filter edges to only show those relevant to the current question when answering
  const relevantEdges = state === 'answering' 
    ? visibleEdges.filter(e => 
        currentQuestion.evidencePath.includes(e.source) || 
        currentQuestion.evidencePath.includes(e.target)
      )
    : [];

  return (
    <div data-demo-component className="w-full h-[700px] bg-[#000000] rounded-[14px] border border-[rgb(var(--ink-muted))]/20 overflow-hidden relative">
      {/* Split Screen Layout */}
      <div className="flex h-full">
        {/* Left: Video Canvas (60%) */}
        <div className="flex-[3] relative bg-black overflow-hidden">
          <VideoCanvas currentTime={currentTime} isPlaying={state === 'playing' && !isPaused} />
          
          {/* Timeline Indicator */}
          <div className="absolute top-4 left-4 right-4 z-20">
            <div className="flex items-center gap-2 text-xs text-white/80 mb-2">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{currentTime.toFixed(1)}s / {VIDEO_DURATION}s</span>
              {state === 'playing' && (
                <span className="ml-auto px-2 py-0.5 bg-[rgb(var(--teal))]/20 border border-[rgb(var(--teal))]/30 rounded text-[rgb(var(--teal))] text-[10px]">
                  Building Memory...
                </span>
              )}
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[rgb(var(--teal))]"
                initial={{ width: 0 }}
                animate={{ width: `${(currentTime / VIDEO_DURATION) * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Answer Graph Overlay (only when answering) */}
          <AnimatePresence>
            {state === 'answering' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center"
              >
                <DenseGraph
                  evidenceNodes={visibleEvidence.filter(n => currentQuestion.evidencePath.includes(n.id))}
                  entityNodes={visibleEntities.filter(n => currentQuestion.evidencePath.includes(n.id))}
                  edges={relevantEdges}
                  currentTime={currentTime}
                  highlightPath={currentQuestion.evidencePath}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Memory Stream (40%) */}
        <div className="flex-[2] border-l border-[rgb(var(--ink-muted))]/20 bg-[rgb(var(--deep-blue))] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[rgb(var(--ink-muted))]/20">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-serif)' }}>
              <Sparkles className="w-4 h-4 text-[rgb(var(--teal))]" />
              Memory Stream
            </h3>
            <p className="text-xs text-[rgb(var(--ink-muted))] mt-1">
              Real-time insights from video analysis
            </p>
          </div>

          {/* Stream Content */}
          <div className="flex-1 overflow-hidden">
            <MemoryStream
              evidenceNodes={visibleEvidence}
              entityNodes={visibleEntities}
              currentTime={currentTime}
            />
          </div>
        </div>
      </div>

      {/* Question/Answer Overlay (Bottom) */}
      <AnimatePresence>
        {(state === 'questioning' || state === 'answering') && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-0 left-0 right-0 z-40 bg-[rgb(var(--deep-blue))]/95 backdrop-blur-md border-t border-[rgb(var(--ink-muted))]/30 p-6"
          >
            <div className="max-w-4xl mx-auto">
              {/* Question */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[rgb(var(--teal))]/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-[rgb(var(--teal))]" />
                  </div>
                  <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'var(--font-serif)' }}>
                    Question
                  </h3>
                </div>
                <p className="text-white text-lg pl-10">{currentQuestion.question}</p>
              </div>

              {/* Answer (shown when answering) */}
              {state === 'answering' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-start gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[rgb(var(--teal))]/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[rgb(var(--teal))]" />
                    </div>
                    <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'var(--font-serif)' }}>
                      Answer
                    </h3>
                  </div>
                  <p className="text-[rgb(var(--ink-muted))] text-base pl-10">{currentQuestion.answer}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="absolute top-4 right-4 z-50 p-2 bg-[rgb(var(--deep-blue))]/80 backdrop-blur-sm border border-[rgb(var(--ink-muted))]/20 rounded-full hover:border-[rgb(var(--teal))]/50 transition-colors"
        title="Reset Demo"
      >
        <RotateCcw className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}
