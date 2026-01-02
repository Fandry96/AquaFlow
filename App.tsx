import React, { useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import FluidCanvas from './components/FluidCanvas';
import { ToolType, BrushSettings, SimulationSettings, RGB } from './types';
import { DEFAULT_BRUSH, DEFAULT_SIMULATION } from './constants';
import { generateInspirationPrompt, generateReferenceImage } from './services/geminiService';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.BRUSH);
  const [color, setColor] = useState<RGB>({ r: 40, g: 150, b: 250 }); // Default blue
  const [brushSettings, setBrushSettings] = useState<BrushSettings>(DEFAULT_BRUSH);
  const [simSettings, setSimSettings] = useState<SimulationSettings>(DEFAULT_SIMULATION);
  
  // AI State
  const [inspirationPrompt, setInspirationPrompt] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleGenerateInspiration = async () => {
      setIsLoadingAI(true);
      const prompt = await generateInspirationPrompt();
      setInspirationPrompt(prompt);
      setIsLoadingAI(false);
  };

  const handleGenerateReference = async () => {
      if (!inspirationPrompt) return;
      setIsLoadingAI(true);
      const img = await generateReferenceImage(inspirationPrompt);
      setReferenceImage(img);
      setIsLoadingAI(false);
  };

  return (
    <div className="flex w-screen h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Left Toolbar */}
      <Toolbar activeTool={activeTool} setTool={setActiveTool} />

      {/* Main Workspace */}
      <div className="flex-1 relative bg-slate-900 flex flex-col">
          {/* Header/Top Bar could go here if needed, keeping it minimal for now */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8 bg-slate-800">
            {/* The Canvas Area */}
            <div className="relative shadow-2xl shadow-black/50" style={{ width: '800px', height: '600px', backgroundColor: '#faf6eb' }}>
                <FluidCanvas 
                    width={800} 
                    height={600}
                    activeTool={activeTool}
                    color={color}
                    brushSettings={brushSettings}
                    simSettings={simSettings}
                />
                
                {/* Floating Loading Indicator */}
                {isLoadingAI && (
                    <div className="absolute top-4 right-4 bg-slate-900/80 text-cyan-400 px-3 py-1 rounded-full text-xs backdrop-blur-sm border border-cyan-500/30 animate-pulse z-50">
                        AI Thinking...
                    </div>
                )}
            </div>
          </div>
      </div>

      {/* Right Properties Panel */}
      <PropertiesPanel 
        brushSettings={brushSettings} 
        setBrushSettings={setBrushSettings}
        simSettings={simSettings}
        setSimSettings={setSimSettings}
        color={color}
        setColor={setColor}
        onGenerateInspiration={handleGenerateInspiration}
        inspirationPrompt={inspirationPrompt}
        onGenerateReference={handleGenerateReference}
        referenceImage={referenceImage}
      />
    </div>
  );
};

export default App;
