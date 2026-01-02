import React from 'react';
import { ToolType } from '../types';
import { TOOL_ICONS } from '../constants';
import { Brush, Droplets, Sun, Eraser, Wind } from 'lucide-react';

interface ToolbarProps {
  activeTool: ToolType;
  setTool: (t: ToolType) => void;
}

const IconMap = {
  [ToolType.BRUSH]: Brush,
  [ToolType.WATER]: Droplets,
  [ToolType.DRY]: Sun,
  [ToolType.ERASER]: Eraser,
  [ToolType.BLOW]: Wind,
};

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setTool }) => {
  return (
    <div className="flex flex-col gap-2 p-2 bg-slate-900 border-r border-slate-700 h-full w-16 items-center shadow-xl z-20">
      <div className="mb-4 mt-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
            Aq
        </div>
      </div>
      
      {Object.values(ToolType).map((t) => {
        const Icon = IconMap[t];
        const isActive = activeTool === t;
        return (
          <button
            key={t}
            onClick={() => setTool(t)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            {/* Tooltip */}
            <span className="absolute left-14 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
              {t}
            </span>
          </button>
        );
      })}
    </div>
  );
};
