import React, { useEffect, useRef } from 'react';
import { CANVAS_SCENES, VIDEO_DURATION } from './data';

interface VideoCanvasProps {
  currentTime: number;
  isPlaying: boolean;
}

export function VideoCanvas({ currentTime, isPlaying }: VideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      if (!isPlaying) {
        // Static background when paused
        ctx.fillStyle = '#0c183d'; // Deep Blue
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // Clear canvas with pure black for cinematic feel
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle gradient overlay for depth
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(12, 24, 61, 0.3)'); // Deep Blue
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Find current scene (interpolate between scenes)
      let currentScene = CANVAS_SCENES[0];
      let nextScene = CANVAS_SCENES[0];

      for (let i = 0; i < CANVAS_SCENES.length - 1; i++) {
        if (currentTime >= CANVAS_SCENES[i].time && currentTime < CANVAS_SCENES[i + 1].time) {
          currentScene = CANVAS_SCENES[i];
          nextScene = CANVAS_SCENES[i + 1];
          break;
        }
      }
      if (currentTime >= CANVAS_SCENES[CANVAS_SCENES.length - 1].time) {
        currentScene = CANVAS_SCENES[CANVAS_SCENES.length - 1];
        nextScene = currentScene;
      }

      // Interpolation factor
      const timeDiff = nextScene.time - currentScene.time;
      const t = timeDiff > 0 
        ? Math.min(1, (currentTime - currentScene.time) / timeDiff)
        : 1;

      // Draw elements from current and next scene (interpolated)
      const allElements = new Map<string, { x: number; y: number; type: string; label?: string }>();

      // Collect elements from current scene
      currentScene.elements.forEach(el => {
        allElements.set(`${el.type}-${el.label || ''}`, {
          x: el.x,
          y: el.y,
          type: el.type,
          label: el.label,
        });
      });

      // Interpolate with next scene
      nextScene.elements.forEach(el => {
        const key = `${el.type}-${el.label || ''}`;
        if (allElements.has(key)) {
          const current = allElements.get(key)!;
          allElements.set(key, {
            x: current.x + (el.x - current.x) * t,
            y: current.y + (el.y - current.y) * t,
            type: el.type,
            label: el.label || current.label,
          });
        } else {
          allElements.set(key, {
            x: el.x,
            y: el.y,
            type: el.type,
            label: el.label,
          });
        }
      });

      // Draw elements
      allElements.forEach((el, key) => {
        const x = (el.x / 100) * canvas.width;
        const y = (el.y / 100) * canvas.height;

        if (el.type === 'person') {
          // Draw person circle with glow
          const radius = 18;
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
          glowGradient.addColorStop(0, 'rgba(61, 166, 166, 0.4)');
          glowGradient.addColorStop(1, 'rgba(61, 166, 166, 0)');
          ctx.fillStyle = glowGradient;
          ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
          
          ctx.fillStyle = '#3da6a6'; // Teal
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Label with better typography
          if (el.label) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '500 13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(el.label, x, y - radius - 8);
          }
        } else if (el.type === 'location') {
          // Draw location rectangle with subtle glow
          const width = 60;
          const height = 35;
          ctx.fillStyle = 'rgba(204, 61, 143, 0.2)';
          ctx.fillRect(x - width/2 - 2, y - height/2 - 2, width + 4, height + 4);
          
          ctx.fillStyle = '#cc3d8f'; // Magenta
          ctx.globalAlpha = 0.4;
          ctx.fillRect(x - width/2, y - height/2, width, height);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = '#cc3d8f';
          ctx.lineWidth = 2;
          ctx.strokeRect(x - width/2, y - height/2, width, height);
          
          // Label
          if (el.label) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '500 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(el.label, x, y);
          }
        } else if (el.type === 'object') {
          // Draw object circle with glow
          const radius = 14;
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
          glowGradient.addColorStop(0, 'rgba(117, 74, 173, 0.3)');
          glowGradient.addColorStop(1, 'rgba(117, 74, 173, 0)');
          ctx.fillStyle = glowGradient;
          ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
          
          ctx.fillStyle = '#754aad'; // Violet
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Label
          if (el.label) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '500 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(el.label, x, y - radius - 6);
          }
        }
      });

      // Subtle timeline indicator (removed - handled by UI overlay)
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentTime, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
}

