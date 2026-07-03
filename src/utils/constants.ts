export const GRID_SIZE = 4;

export const WINNING_TILE = 2048;

export const INITIAL_TILE_COUNT = 2;

export const NEW_TILE_PROBABILITY_4 = 0.1;

export const AI_SPEEDS = {
  slow: 600,
  normal: 300,
  fast: 120,
} as const;

export const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: "#eee4da", text: "#776e65" },
  4: { bg: "#ede0c8", text: "#776e65" },
  8: { bg: "#f2b179", text: "#f9f6f2" },
  16: { bg: "#f59563", text: "#f9f6f2" },
  32: { bg: "#f67c5f", text: "#f9f6f2" },
  64: { bg: "#f65e3b", text: "#f9f6f2" },
  128: { bg: "#edcf72", text: "#f9f6f2" },
  256: { bg: "#edcc61", text: "#f9f6f2" },
  512: { bg: "#edc850", text: "#f9f6f2" },
  1024: { bg: "#edc53f", text: "#f9f6f2" },
  2048: { bg: "#edc22e", text: "#f9f6f2" },
};

export const DEFAULT_TILE_COLOR = { bg: "#3c3a32", text: "#f9f6f2" };

export const DIRECTION_VECTORS: Record<
  import("../types").Direction,
  { row: number; col: number }
> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};
