export type Direction = "up" | "down" | "left" | "right";

export interface Position {
  row: number;
  col: number;
}

export interface TileData {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

export interface GameState {
  tiles: TileData[];
  score: number;
  bestScore: number;
  isGameOver: boolean;
  hasWon: boolean;
  wonButContinuing: boolean;
  isAIPlaying: boolean;
  aiSpeed: "slow" | "normal" | "fast";
  suggestedMove: Direction | null;
  nextId: number;
}

export type BoardGrid = number[][];
