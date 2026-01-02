export enum ToolType {
  BRUSH = 'BRUSH',     // Adds Pigment + Water
  WATER = 'WATER',     // Adds Water only
  DRY = 'DRY',         // Removes Water
  ERASER = 'ERASER',   // Removes Pigment + Water
  BLOW = 'BLOW'        // Pushes fluid (velocity)
}

export interface BrushSettings {
  size: number;
  pressure: number; // Opacity/Flow
  waterLoad: number; // How much water is added (0-100)
  pigmentLoad: number; // How much color is added (0-100)
}

export interface SimulationSettings {
  evaporationRate: number; // 0.001 - 0.1
  diffusionSpeed: number; // How fast water spreads
  gravityX: number;
  gravityY: number;
  paperTexture: 'smooth' | 'rough' | 'cold-press';
  paused: boolean;
  showWetness: boolean; // Visualizer toggle
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ReferenceImage {
  url: string;
  prompt: string;
}
