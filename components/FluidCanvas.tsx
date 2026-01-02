import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BrushSettings, SimulationSettings, ToolType, RGB } from '../types';

interface FluidCanvasProps {
  width: number;
  height: number;
  activeTool: ToolType;
  color: RGB;
  brushSettings: BrushSettings;
  simSettings: SimulationSettings;
}

// Fixed simulation resolution for performance.
// We scale this up to the display size.
const SIM_W = 400;
const SIM_H = 300;

const FluidCanvas: React.FC<FluidCanvasProps> = ({
  width,
  height,
  activeTool,
  color,
  brushSettings,
  simSettings,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  
  // Simulation State Arrays (Flattened 2D)
  // Float32 for precision in physics
  const waterMap = useRef(new Float32Array(SIM_W * SIM_H));
  const pigmentR = useRef(new Float32Array(SIM_W * SIM_H));
  const pigmentG = useRef(new Float32Array(SIM_W * SIM_H));
  const pigmentB = useRef(new Float32Array(SIM_W * SIM_H));
  const wetnessMap = useRef(new Float32Array(SIM_W * SIM_H)); // 0 = dry, 1 = wet
  
  // Mouse interaction state
  const isDrawing = useRef(false);
  const lastPos = useRef<{x: number, y: number} | null>(null);

  // Helper to get index
  const idx = (x: number, y: number) => {
    if (x < 0) x = 0; if (x >= SIM_W) x = SIM_W - 1;
    if (y < 0) y = 0; if (y >= SIM_H) y = SIM_H - 1;
    return y * SIM_W + x;
  };

  const applyBrush = useCallback((x: number, y: number) => {
    // Convert screen coordinates to sim coordinates
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Relative position 0-1
    const relX = (x - rect.left) / rect.width;
    const relY = (y - rect.top) / rect.height;

    const simX = Math.floor(relX * SIM_W);
    const simY = Math.floor(relY * SIM_H);
    
    // Brush radius in sim pixels
    // Scale brush size relative to screen
    const simRadius = Math.max(1, (brushSettings.size / width) * SIM_W);
    
    const rSq = simRadius * simRadius;

    const wm = waterMap.current;
    const wetm = wetnessMap.current;
    const pr = pigmentR.current;
    const pg = pigmentG.current;
    const pb = pigmentB.current;

    const startX = Math.max(0, Math.floor(simX - simRadius));
    const endX = Math.min(SIM_W, Math.ceil(simX + simRadius));
    const startY = Math.max(0, Math.floor(simY - simRadius));
    const endY = Math.min(SIM_H, Math.ceil(simY + simRadius));

    for (let cy = startY; cy < endY; cy++) {
      for (let cx = startX; cx < endX; cx++) {
        const distSq = (cx - simX) ** 2 + (cy - simY) ** 2;
        if (distSq <= rSq) {
          const i = cy * SIM_W + cx;
          const falloff = 1 - (distSq / rSq); // Soft brush edge
          const amount = falloff * (brushSettings.pressure); // 0 to 1

          if (activeTool === ToolType.BRUSH) {
            // Add water
            wm[i] = Math.min(10, wm[i] + amount * (brushSettings.waterLoad / 20));
            wetm[i] = 1.0; // Make it wet
            // Add pigment (blend with existing?)
            // Simple additive mixing for now, clamped at 255
            const pLoad = brushSettings.pigmentLoad / 100;
            // Lerp towards brush color based on pressure
            const alpha = amount * pLoad * 0.5;
            pr[i] = pr[i] * (1 - alpha) + color.r * alpha;
            pg[i] = pg[i] * (1 - alpha) + color.g * alpha;
            pb[i] = pb[i] * (1 - alpha) + color.b * alpha;
          } 
          else if (activeTool === ToolType.WATER) {
            wm[i] = Math.min(10, wm[i] + amount * (brushSettings.waterLoad / 10));
            wetm[i] = 1.0;
          }
          else if (activeTool === ToolType.DRY) {
             wm[i] = Math.max(0, wm[i] - amount * 2);
             wetm[i] = Math.max(0, wetm[i] - amount * 2);
          }
          else if (activeTool === ToolType.ERASER) {
             const eraseStr = amount * 0.5;
             pr[i] *= (1 - eraseStr);
             pg[i] *= (1 - eraseStr);
             pb[i] *= (1 - eraseStr);
             wm[i] *= (1 - eraseStr);
          }
          // BLOW handled in update loop via velocity modifiers if implemented, 
          // or simple directional push here.
        }
      }
    }
  }, [activeTool, color, brushSettings, width]);

  // The Physics Loop
  const updateSimulation = useCallback(() => {
    if (simSettings.paused) return;

    const wm = waterMap.current;
    const wetm = wetnessMap.current;
    const pr = pigmentR.current;
    const pg = pigmentG.current;
    const pb = pigmentB.current;

    // Temporary buffers for diffusion step to avoid direction bias
    // To optimize, we might toggle between two buffers, but cloning is safer for MVP
    // For performance in JS, we often do in-place with random iteration order or multiple passes
    // Let's do a simple 4-neighbor diffusion.
    
    // We'll use a single pass with "flow" accumulation to keep it fast.
    
    const w = SIM_W;
    const h = SIM_H;
    
    const diff = simSettings.diffusionSpeed;
    const gravX = simSettings.gravityX;
    const gravY = simSettings.gravityY;
    const evap = simSettings.evaporationRate;

    // Helper arrays for flow calc could be large, allocate once if possible.
    // For MVP, we iterate and push/pull.
    
    // A simplified Cellular Automata for fluid
    // 1. Calculate flows
    // 2. Move Water & Pigment
    // 3. Evaporate

    // Using a randomized start index to reduce directional bias in single-threaded loop
    // or just standard top-down. 
    // Top-down is okay if we alternate directions, but let's just do standard for now.

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        
        if (wm[i] <= 0.01) continue; // Dry cell, skip logic

        // Evaporation
        wm[i] = Math.max(0, wm[i] - evap);
        if (wm[i] <= 0) {
            wetm[i] = 0;
            continue;
        }

        // Neighbors: Top, Bottom, Left, Right
        // We only push to neighbors to simulate flow
        const neighbors = [
          { idx: idx(x + 1, y), bias: -gravX }, // Right
          { idx: idx(x - 1, y), bias: gravX },  // Left
          { idx: idx(x, y + 1), bias: gravY },  // Bottom
          { idx: idx(x, y - 1), bias: -gravY }  // Top
        ];

        // Distribute water
        let totalWater = wm[i];
        let amountToFlow = totalWater * diff; // Percentage that wants to move
        
        // Simple flow logic: Flow to cells with LESS water or favored by gravity
        // This is a naive heuristic but looks okay for watercolor
        
        neighbors.forEach(n => {
           if (amountToFlow <= 0) return;
           
           const neighborWater = wm[n.idx];
           
           // Gravity bias adds "virtual capacity" to the receiving cell or reduces its pressure
           // If bias is positive, flow is encouraged.
           
           const gradient = (totalWater - neighborWater) + (n.bias * 5); 
           
           if (gradient > 0) {
              const flow = Math.min(amountToFlow, gradient * 0.1); 
              if (flow > 0.001) {
                  wm[i] -= flow;
                  wm[n.idx] += flow;
                  
                  // Move pigment with water
                  // Pigment follows water flow ratio
                  const ratio = flow / totalWater;
                  const pFlowR = pr[i] * ratio;
                  const pFlowG = pg[i] * ratio;
                  const pFlowB = pb[i] * ratio;

                  pr[i] -= pFlowR;
                  pg[i] -= pFlowG;
                  pb[i] -= pFlowB;

                  pr[n.idx] += pFlowR;
                  pg[n.idx] += pFlowG;
                  pb[n.idx] += pFlowB;
                  
                  // Wet the neighbor
                  wetm[n.idx] = 1.0;
                  
                  amountToFlow -= flow;
                  totalWater -= flow;
              }
           }
        });
      }
    }
  }, [simSettings]);

  // Rendering Loop
  const render = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const wm = waterMap.current;
    const pr = pigmentR.current;
    const pg = pigmentG.current;
    const pb = pigmentB.current;
    
    // Create ImageData (Upscaled or same size?)
    // For sharp pixels, we render SIM size then canvas scales it via CSS or transform.
    // Let's render at SIM size.
    const imgData = ctx.getImageData(0, 0, SIM_W, SIM_H);
    const data = imgData.data;

    // Paper background color
    const paperR = 250;
    const paperG = 246;
    const paperB = 235;

    for (let i = 0; i < SIM_W * SIM_H; i++) {
        const baseIdx = i * 4;
        
        // Pigment amounts (not clamped yet)
        const r = pr[i];
        const g = pg[i];
        const b = pb[i];
        const w = wm[i];
        
        // Simple compositing
        // Calculate opacity based on pigment density
        // A rough density to alpha heuristic
        const maxC = Math.max(r, g, b);
        // Normalize pigment: if r=255, it's fully that color. 
        // But usually pigment accumulates > 255 in simulation? 
        // We should clamp for display.
        
        // Mix pigment with paper
        // If density is 0, paper color.
        // As density increases, move towards pigment color.
        
        // Basic alpha compositing over paper
        // We treat r,g,b as "amounts" of ink on the paper. 
        // 255 amount = full coverage.
        
        // Subtractive mixing simulation (Mock)
        // Paper - (InvColor * Amount) -> Darker
        // But simple additive mixing is easier for MVP
        
        // Let's assume r,g,b tracks the COLOR VALUE * DENSITY
        // Actually, separate Density map is better, but here we track component mass.
        // We need to normalize. 
        // Let's assume the array stores RGB values directly but we weight them by an alpha derived from magnitude?
        // No, let's assume they store mass.
        // Mass -> Color:
        // Color = (MassR, MassG, MassB). 
        // We clip at 255.
        
        const finalR = Math.min(255, r);
        const finalG = Math.min(255, g);
        const finalB = Math.min(255, b);
        
        // Alpha determines how much it covers the paper.
        // We need a separate alpha/density channel really.
        // Estimation: Alpha = max(r,g,b) / 255? 
        // Or just assume initialized to 0 and we add RGB mass.
        
        // Better: Initialize canvas to white (255,255,255).
        // Pigment is subtractive. 
        // Store CMY? No, too complex.
        
        // Let's stick to standard alpha blending logic:
        // The array holds the "Source Over" color. 
        // Since we initialize to 0,0,0, we treat non-zero as paint.
        // We just display what is in the array, assuming it's premultiplied alpha-ish.
        
        if (simSettings.showWetness && w > 0.1) {
            // Debug view: Show blue for water
            data[baseIdx] = 0;
            data[baseIdx + 1] = 0;
            data[baseIdx + 2] = 255;
            data[baseIdx + 3] = Math.min(255, w * 50);
        } else {
            // Paint view
            // If very little pigment, show paper.
            // We blend (FinalR, FinalG, FinalB) over Paper.
            // How to determine Alpha? 
            // Let's assume Alpha is proportional to total pigment mass.
            const totalMass = (r + g + b) / 3;
            const alpha = Math.min(1, totalMass / 100); 
            
            // Manual lerp
            data[baseIdx] = paperR * (1 - alpha) + finalR * alpha;
            data[baseIdx + 1] = paperG * (1 - alpha) + finalG * alpha;
            data[baseIdx + 2] = paperB * (1 - alpha) + finalB * alpha;
            data[baseIdx + 3] = 255; // Opaque texture
        }
    }
    
    ctx.putImageData(imgData, 0, 0);

  }, [simSettings]);

  // Main Loop
  useEffect(() => {
    const loop = () => {
      updateSimulation();
      render();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  }, [updateSimulation, render]);

  // Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawing.current = true;
    canvasRef.current?.setPointerCapture(e.pointerId);
    applyBrush(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    // Interpolate for smoother strokes if moving fast
    // MVP: Just apply at current point
    applyBrush(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDrawing.current = false;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-200 overflow-hidden cursor-crosshair touch-none">
       {/* Paper Texture Overlay */}
       <div 
         className="absolute inset-0 pointer-events-none z-10 opacity-40 mix-blend-multiply"
         style={{
            backgroundImage: simSettings.paperTexture === 'rough' 
             ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
             : 'none',
             backgroundSize: '200px'
         }}
       />
      
      <canvas
        ref={canvasRef}
        width={SIM_W}
        height={SIM_H}
        className="w-full h-full block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>
  );
};

export default FluidCanvas;
