import React, { useState } from 'react';
import { BrushSettings, SimulationSettings, RGB } from '../types';
import { HexColorPicker } from 'react-colorful'; // Using standard input if lib not avail, but assuming standard inputs here
import { Layers, Settings, Palette, Download, Play, Pause, RefreshCw, Eye, Lightbulb } from 'lucide-react';

interface PropertiesPanelProps {
  brushSettings: BrushSettings;
  setBrushSettings: React.Dispatch<React.SetStateAction<BrushSettings>>;
  simSettings: SimulationSettings;
  setSimSettings: React.Dispatch<React.SetStateAction<SimulationSettings>>;
  color: RGB;
  setColor: (c: RGB) => void;
  onGenerateInspiration: () => void;
  inspirationPrompt: string | null;
  onGenerateReference: () => void;
  referenceImage: string | null;
}

// Simple color converter
const rgbToHex = (c: RGB) => '#' + [c.r, c.g, c.b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
const hexToRgb = (hex: string): RGB => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  brushSettings, setBrushSettings,
  simSettings, setSimSettings,
  color, setColor,
  onGenerateInspiration, inspirationPrompt,
  onGenerateReference, referenceImage
}) => {
  const [activeTab, setActiveTab] = useState<'paint' | 'sim' | 'ai'>('paint');

  const updateBrush = (k: keyof BrushSettings, v: number) => setBrushSettings(p => ({ ...p, [k]: v }));
  const updateSim = (k: keyof SimulationSettings, v: any) => setSimSettings(p => ({ ...p, [k]: v }));

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col h-full overflow-hidden text-sm select-none z-20">
      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button onClick={() => setActiveTab('paint')} className={`flex-1 py-3 flex justify-center ${activeTab === 'paint' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}><Palette size={18} /></button>
        <button onClick={() => setActiveTab('sim')} className={`flex-1 py-3 flex justify-center ${activeTab === 'sim' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}><Settings size={18} /></button>
        <button onClick={() => setActiveTab('ai')} className={`flex-1 py-3 flex justify-center ${activeTab === 'ai' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}><Lightbulb size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {activeTab === 'paint' && (
          <>
            <div className="space-y-4">
              <h3 className="text-slate-400 font-semibold uppercase text-xs tracking-wider">Color</h3>
              <div className="w-full h-40 bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center border border-slate-700">
                 {/* Fallback color picker */}
                 <input 
                    type="color" 
                    value={rgbToHex(color)}
                    onChange={(e) => setColor(hexToRgb(e.target.value))}
                    className="w-[110%] h-[110%] -m-2 cursor-pointer bg-transparent"
                 />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>R: {Math.round(color.r)}</span>
                <span>G: {Math.round(color.g)}</span>
                <span>B: {Math.round(color.b)}</span>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-800 pt-4">
              <h3 className="text-slate-400 font-semibold uppercase text-xs tracking-wider">Brush Properties</h3>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Size</span>
                  <span className="text-slate-500">{brushSettings.size}px</span>
                </div>
                <input type="range" min="1" max="100" value={brushSettings.size} onChange={e => updateBrush('size', +e.target.value)} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Opacity / Pressure</span>
                  <span className="text-slate-500">{Math.round(brushSettings.pressure * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={brushSettings.pressure} onChange={e => updateBrush('pressure', +e.target.value)} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Water Load</span>
                  <span className="text-slate-500">{brushSettings.waterLoad}%</span>
                </div>
                <input type="range" min="0" max="100" value={brushSettings.waterLoad} onChange={e => updateBrush('waterLoad', +e.target.value)} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"/>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                    <span className="text-slate-300">Pigment Load</span>
                    <span className="text-slate-500">{brushSettings.pigmentLoad}%</span>
                </div>
                <input type="range" min="0" max="100" value={brushSettings.pigmentLoad} onChange={e => updateBrush('pigmentLoad', +e.target.value)} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"/>
               </div>
            </div>
          </>
        )}

        {activeTab === 'sim' && (
          <div className="space-y-6">
            <h3 className="text-slate-400 font-semibold uppercase text-xs tracking-wider">Fluid Physics</h3>

            <button 
                onClick={() => updateSim('paused', !simSettings.paused)}
                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${simSettings.paused ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-900/50 text-red-200 border border-red-800 hover:bg-red-900'}`}
            >
                {simSettings.paused ? <><Play size={16}/> Resume Simulation</> : <><Pause size={16}/> Pause Simulation</>}
            </button>

             <button 
                onClick={() => updateSim('showWetness', !simSettings.showWetness)}
                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors border border-slate-700 hover:bg-slate-800 text-slate-300`}
            >
                <Eye size={16}/> {simSettings.showWetness ? 'Show Paint' : 'Show Wetness Map'}
            </button>

            <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Diffusion Speed</span>
                  <span className="text-slate-500">{simSettings.diffusionSpeed.toFixed(2)}</span>
                </div>
                <input type="range" min="0" max="0.5" step="0.01" value={simSettings.diffusionSpeed} onChange={e => updateSim('diffusionSpeed', +e.target.value)} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Evaporation</span>
                  <span className="text-slate-500">{simSettings.evaporationRate.toFixed(3)}</span>
                </div>
                <input type="range" min="0" max="0.05" step="0.001" value={simSettings.evaporationRate} onChange={e => updateSim('evaporationRate', +e.target.value)} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"/>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-slate-500 uppercase">Gravity / Tilt</h4>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <span className="text-xs text-slate-400 block mb-1">Horizontal (X)</span>
                        <input type="range" min="-0.2" max="0.2" step="0.01" value={simSettings.gravityX} onChange={e => updateSim('gravityX', +e.target.value)} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"/>
                     </div>
                     <div>
                        <span className="text-xs text-slate-400 block mb-1">Vertical (Y)</span>
                        <input type="range" min="-0.2" max="0.2" step="0.01" value={simSettings.gravityY} onChange={e => updateSim('gravityY', +e.target.value)} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"/>
                     </div>
                </div>
            </div>
            
             <div className="pt-4 border-t border-slate-800">
                 <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Paper Texture</h4>
                 <div className="flex gap-2">
                    {['smooth', 'rough'].map(t => (
                        <button 
                            key={t}
                            onClick={() => updateSim('paperTexture', t)}
                            className={`flex-1 py-2 text-xs rounded border ${simSettings.paperTexture === t ? 'bg-slate-700 border-slate-500 text-white' : 'border-slate-800 text-slate-500 hover:border-slate-600'}`}
                        >
                            {t}
                        </button>
                    ))}
                 </div>
             </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <h3 className="text-slate-400 font-semibold uppercase text-xs tracking-wider">AI Studio</h3>
            
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 space-y-3">
               <h4 className="text-cyan-400 text-sm font-medium flex items-center gap-2"><Lightbulb size={14}/> Prompt Generator</h4>
               <p className="text-xs text-slate-400">Stuck? Get a creative painting idea.</p>
               <button 
                onClick={onGenerateInspiration}
                className="w-full bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-200 border border-cyan-800 py-2 px-3 rounded text-sm transition-colors flex items-center justify-center gap-2"
               >
                   <RefreshCw size={14}/> Inspire Me
               </button>
               {inspirationPrompt && (
                   <div className="text-sm text-slate-200 italic mt-2 bg-slate-900 p-2 rounded border border-slate-800">
                       "{inspirationPrompt}"
                   </div>
               )}
            </div>

            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 space-y-3">
               <h4 className="text-purple-400 text-sm font-medium flex items-center gap-2"><Eye size={14}/> Reference Image</h4>
               <p className="text-xs text-slate-400">Generate a reference image to paint from based on your prompt.</p>
               {inspirationPrompt ? (
                   <button 
                    onClick={onGenerateReference}
                    className="w-full bg-purple-900/30 hover:bg-purple-900/50 text-purple-200 border border-purple-800 py-2 px-3 rounded text-sm transition-colors flex items-center justify-center gap-2"
                   >
                       Generate Reference
                   </button>
               ) : (
                   <p className="text-xs text-red-400">Generate a prompt first.</p>
               )}
               
               {referenceImage && (
                   <div className="mt-2 rounded-lg overflow-hidden border border-slate-600">
                       <img src={referenceImage} alt="Reference" className="w-full h-auto object-cover" />
                   </div>
               )}
            </div>
          </div>
        )}

      </div>
      
      <div className="p-4 border-t border-slate-800 text-xs text-slate-600 text-center">
         v1.0.0 Alpha
      </div>
    </div>
  );
};
