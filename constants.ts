import { BrushSettings, SimulationSettings, ToolType } from "./types";

export const DEFAULT_BRUSH: BrushSettings = {
  size: 20,
  pressure: 0.5,
  waterLoad: 60,
  pigmentLoad: 80,
};

export const DEFAULT_SIMULATION: SimulationSettings = {
  evaporationRate: 0.002,
  diffusionSpeed: 0.15,
  gravityX: 0,
  gravityY: 0.05, // Slight downward drip by default
  paperTexture: 'rough',
  paused: false,
  showWetness: false,
};

export const TOOL_ICONS: Record<ToolType, string> = {
  [ToolType.BRUSH]: "Brush",
  [ToolType.WATER]: "Droplets",
  [ToolType.DRY]: "Sun",
  [ToolType.ERASER]: "Eraser",
  [ToolType.BLOW]: "Wind",
};

export const PAPER_COLORS = {
  white: { r: 255, g: 255, b: 255 },
  ivory: { r: 250, g: 246, b: 235 },
};
