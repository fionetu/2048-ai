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
  isMerging?: boolean;
}

export interface MergeEvent {
  sourceIds: [number, number];
  target: Position;
  value: number;
}

export interface MoveResult {
  tiles: TileData[];
  scoreDelta: number;
  moved: boolean;
  nextId: number;
  mergeEvents: MergeEvent[];
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
  isAnimating: boolean;
}

export type BoardGrid = number[][];
