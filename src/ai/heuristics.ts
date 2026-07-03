import type { BoardGrid } from "../types";
import { GRID_SIZE } from "../utils/constants";
import { cloneGrid, getEmptyCells, simulateMoveGrid } from "../utils/board";

// Snake-pattern weights encourage the largest tile to sit in a corner
// and values to decrease monotonically along the snake.
const SNAKE_WEIGHTS: number[][] = [
  [65536, 32768, 16384, 8192],
  [512, 1024, 2048, 4096],
  [256, 128, 64, 32],
  [16, 8, 4, 2],
];

export function evaluateBoard(grid: BoardGrid): number {
  const emptyWeight = 10000;
  const snakeWeight = 1;
  const smoothWeight = 50;
  const monoWeight = 100;
  const maxCornerWeight = 1000;

  const emptyCells = getEmptyCells(grid).length;
  const snakeScore = calculateSnakeScore(grid);
  const smoothness = calculateSmoothness(grid);
  const monotonicity = calculateMonotonicity(grid);
  const cornerBonus = calculateCornerBonus(grid);

  return (
    emptyCells * emptyWeight +
    snakeScore * snakeWeight -
    smoothness * smoothWeight +
    monotonicity * monoWeight +
    cornerBonus * maxCornerWeight
  );
}

function calculateSnakeScore(grid: BoardGrid): number {
  let score = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      score += grid[row][col] * SNAKE_WEIGHTS[row][col];
    }
  }
  return score;
}

function calculateMonotonicity(grid: BoardGrid): number {
  let score = 0;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE - 1; col++) {
      const current = grid[row][col];
      const next = grid[row][col + 1];
      if (current > 0 && next > 0 && current >= next) {
        score += current - next;
      }
    }
  }

  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE - 1; row++) {
      const current = grid[row][col];
      const next = grid[row + 1][col];
      if (current > 0 && next > 0 && current >= next) {
        score += current - next;
      }
    }
  }

  return score;
}

function calculateSmoothness(grid: BoardGrid): number {
  let smoothness = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const value = grid[row][col];
      if (value === 0) continue;
      if (col + 1 < GRID_SIZE && grid[row][col + 1] > 0) {
        smoothness += Math.abs(value - grid[row][col + 1]);
      }
      if (row + 1 < GRID_SIZE && grid[row + 1][col] > 0) {
        smoothness += Math.abs(value - grid[row + 1][col]);
      }
    }
  }
  return smoothness;
}

function getMaxTile(grid: BoardGrid): number {
  let max = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] > max) {
        max = grid[row][col];
      }
    }
  }
  return max;
}

function calculateCornerBonus(grid: BoardGrid): number {
  const max = getMaxTile(grid);
  if (max === 0) return 0;
  const corners = [
    grid[0][0],
    grid[0][GRID_SIZE - 1],
    grid[GRID_SIZE - 1][0],
    grid[GRID_SIZE - 1][GRID_SIZE - 1],
  ];
  return corners.includes(max) ? 1 : -2;
}

export function hasValidMoveGrid(grid: BoardGrid): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const value = grid[row][col];
      if (value === 0) return true;
      if (col + 1 < GRID_SIZE && grid[row][col + 1] === value) return true;
      if (row + 1 < GRID_SIZE && grid[row + 1][col] === value) return true;
    }
  }
  return false;
}

export function getPossibleMoves(grid: BoardGrid): {
  direction: import("../types").Direction;
  grid: BoardGrid;
  score: number;
}[] {
  const moves: {
    direction: import("../types").Direction;
    grid: BoardGrid;
    score: number;
  }[] = [];
  const directions: import("../types").Direction[] = [
    "up",
    "down",
    "left",
    "right",
  ];
  for (const direction of directions) {
    const result = simulateMoveGrid(grid, direction);
    if (result.moved) {
      moves.push({ direction, grid: result.grid, score: result.score });
    }
  }
  return moves;
}

export function getEmptyCellSpawns(grid: BoardGrid): {
  row: number;
  col: number;
  value: number;
  probability: number;
}[] {
  const cells = getEmptyCells(grid);
  const spawns: { row: number; col: number; value: number; probability: number }[] =
    [];
  for (const cell of cells) {
    spawns.push({ ...cell, value: 2, probability: 0.9 / cells.length });
    spawns.push({ ...cell, value: 4, probability: 0.1 / cells.length });
  }
  return spawns;
}

export function spawnTileAt(
  grid: BoardGrid,
  row: number,
  col: number,
  value: number
): BoardGrid {
  const newGrid = cloneGrid(grid);
  newGrid[row][col] = value;
  return newGrid;
}
