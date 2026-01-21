import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Detection } from './data';
import { User, MapPin, Coffee, MessageSquare, Activity } from 'lucide-react';

interface VideoAnalysisCanvasProps {
  currentTime: number;
  detections: Detection[];
  isPlaying: boolean;
}

export function VideoAnalysisCanvas({ currentTime, detections, isPlaying }: VideoAnalysisCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      // Clear with dark background
      ctx.fillStyle = '#12122a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle scene elements (cafe interior simulation)
      drawScene(ctx, canvas.width, canvas.height, currentTime);

      // Draw audio waveform at bottom
      drawAudioWaveform(ctx, canvas.width, canvas.height, currentTime);

      // Draw scanner line
      if (isPlaying) {
        const scannerX = (currentTime / 12) * canvas.width;
        drawScanner(ctx, scannerX, canvas.height);
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [currentTime, isPlaying]);

  const visibleDetections = detections.filter(d => currentTime >= d.time && currentTime <= d.time + 2);
  
  // Get speech detections for timeline visualization
  const speechDetections = detections.filter(d => d.type === 'speech' && d.transcript);

  const getDetectionIcon = (type: Detection['type']) => {
    switch (type) {
      case 'face': return User;
      case 'scene': return MapPin;
      case 'object': return Coffee;
      case 'speech': return MessageSquare;
      case 'action': return Activity;
      default: return User;
    }
  };

  const getDetectionColor = (type: Detection['type']) => {
    switch (type) {
      case 'face': return '#3da6a6'; // Teal
      case 'scene': return '#cc3d8f'; // Magenta
      case 'object': return '#754aad'; // Violet
      case 'speech': return '#0092B8'; // Cyan
      case 'action': return '#0080c9'; // Azure
      default: return '#C0C0C0';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#12122a] overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Detection Overlays */}
      {visibleDetections.map((detection) => {
        if (!detection.bbox) return null;
        
        const Icon = getDetectionIcon(detection.type);
        const color = getDetectionColor(detection.type);
        const fadeProgress = Math.min(1, (currentTime - detection.time) / 2);
        const opacity = 1 - fadeProgress * 0.5;

        return (
          <motion.div
            key={detection.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute"
            style={{
              left: `${detection.bbox.x}%`,
              top: `${detection.bbox.y}%`,
              width: `${detection.bbox.width}%`,
              height: `${detection.bbox.height}%`,
            }}
          >
            {/* Bounding Box */}
            <div
              className="absolute inset-0 border-2 rounded-[14px]"
              style={{
                borderColor: color,
                boxShadow: `0 0 12px ${color}50, inset 0 0 8px ${color}20`,
              }}
            />
            
            {/* Label Badge */}
            <div
              className="absolute -top-7 left-0 px-2 py-1 rounded-[14px] flex items-center gap-1.5 text-xs font-medium text-white shadow-lg"
              style={{
                backgroundColor: color,
              }}
            >
              <Icon className="w-3 h-3" />
              <span>{detection.label}</span>
              <span className="text-[10px] opacity-80 font-mono">{Math.round(detection.confidence * 100)}%</span>
            </div>
          </motion.div>
        );
      })}

      {/* Utterance Labels on Audio Timeline */}
      {speechDetections.map((detection) => {
        if (!detection.transcript || !containerRef.current) return null;
        
        const containerWidth = containerRef.current.offsetWidth;
        const timelineX = (detection.time / 12) * containerWidth;
        const isVisible = currentTime >= detection.time - 0.5 && currentTime <= detection.time + 1.5;
        const fadeProgress = Math.min(1, Math.abs(currentTime - detection.time) / 1.5);
        const opacity = isVisible ? 1 - fadeProgress * 0.3 : 0;

        return (
          <motion.div
            key={`timeline-utterance-${detection.id}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute"
            style={{
              left: `${timelineX}px`,
              bottom: '60px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="px-2 py-1 bg-[#0092B8]/90 backdrop-blur-sm rounded-[14px] border border-[#0092B8]/50 shadow-lg">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 text-white" />
                <span className="text-xs font-medium text-white font-mono" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {detection.transcript}
                </span>
              </div>
              {/* Timeline marker */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-2 bg-[#0092B8]" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function drawScene(ctx: CanvasRenderingContext2D, width: number, height: number, currentTime: number) {
  // Draw cafe interior elements with subtle animation
  
  // Floor gradient
  const floorGradient = ctx.createLinearGradient(0, height * 0.7, 0, height);
  floorGradient.addColorStop(0, '#1a1a35');
  floorGradient.addColorStop(1, '#0f0f20');
  ctx.fillStyle = floorGradient;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);
  
  // Counter
  ctx.fillStyle = '#252545';
  ctx.fillRect(width * 0.55, height * 0.55, width * 0.3, height * 0.25);
  ctx.strokeStyle = '#3da6a640';
  ctx.lineWidth = 2;
  ctx.strokeRect(width * 0.55, height * 0.55, width * 0.3, height * 0.25);
  
  // Menu board
  ctx.fillStyle = '#1f1f3a';
  ctx.fillRect(width * 0.65, height * 0.15, width * 0.22, height * 0.18);
  ctx.strokeStyle = '#3da6a6';
  ctx.lineWidth = 1;
  ctx.strokeRect(width * 0.65, height * 0.15, width * 0.22, height * 0.18);
  
  // Menu text lines
  ctx.fillStyle = '#3da6a660';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(width * 0.67, height * 0.19 + i * 0.04, width * 0.15, height * 0.015);
  }
  
  // Person silhouette (animated position based on time)
  const personProgress = Math.min(1, currentTime / 10);
  const personX = width * 0.15 + (width * 0.35) * personProgress;
  const personY = height * 0.5;
  
  // Person glow
  const personGlow = ctx.createRadialGradient(personX, personY, 0, personX, personY, 40);
  personGlow.addColorStop(0, '#3da6a630');
  personGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = personGlow;
  ctx.beginPath();
  ctx.arc(personX, personY, 40, 0, Math.PI * 2);
  ctx.fill();
  
  // Person body
  ctx.fillStyle = '#3da6a6';
  ctx.beginPath();
  ctx.arc(personX, personY - 15, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(personX - 8, personY - 3, 16, 30);
  
  // Cup on counter (appears after ordering)
  if (currentTime > 5) {
    const cupOpacity = Math.min(1, (currentTime - 5) / 2);
    ctx.globalAlpha = cupOpacity;
    ctx.fillStyle = '#754aad';
    ctx.beginPath();
    ctx.ellipse(width * 0.62, height * 0.52, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(width * 0.612, height * 0.52, 16, 20);
    ctx.globalAlpha = 1;
  }
}

function drawScanner(ctx: CanvasRenderingContext2D, x: number, height: number) {
  // Scanner line with glow effect
  const gradient = ctx.createLinearGradient(x - 8, 0, x + 8, 0);
  gradient.addColorStop(0, 'rgba(61, 166, 166, 0)');
  gradient.addColorStop(0.5, 'rgba(61, 166, 166, 0.6)');
  gradient.addColorStop(1, 'rgba(61, 166, 166, 0)');
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();
  
  // Glow effect
  ctx.shadowBlur = 25;
  ctx.shadowColor = '#3da6a6';
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawAudioWaveform(ctx: CanvasRenderingContext2D, width: number, height: number, currentTime: number) {
  const waveformY = height - 35;
  const waveformHeight = 25;
  
  // Waveform background
  ctx.fillStyle = '#0092B810';
  ctx.fillRect(0, waveformY - waveformHeight, width, waveformHeight * 2);
  
  ctx.strokeStyle = '#0092B8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, waveformY);
  
  const samples = 60;
  for (let i = 0; i < samples; i++) {
    const x = (i / samples) * width;
    const timeOffset = (i / samples) * 12;
    const waveTime = currentTime - timeOffset;
    
    let amplitude = 0;
    if (waveTime >= 4 && waveTime <= 4.8) {
      // First utterance
      amplitude = Math.sin((waveTime - 4) * Math.PI * 5) * waveformHeight * 0.6;
    } else if (waveTime >= 8 && waveTime <= 8.6) {
      // Second utterance
      amplitude = Math.sin((waveTime - 8) * Math.PI * 5) * waveformHeight * 0.4;
    }
    
    ctx.lineTo(x, waveformY - amplitude);
  }
  
  ctx.stroke();
  
  // Baseline
  ctx.strokeStyle = '#0092B840';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, waveformY);
  ctx.lineTo(width, waveformY);
  ctx.stroke();
}
