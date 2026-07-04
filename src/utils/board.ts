import type { TileData, Direction, BoardGrid, MoveResult, MergeEvent } from "../types";
import { GRID_SIZE, NEW_TILE_PROBABILITY_4 } from "./constants";

export function tilesToGrid(tiles: TileData[]): BoardGrid {
  const grid: BoardGrid = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(0)
  );
  for (const tile of tiles) {
    grid[tile.row][tile.col] = tile.value;
  }
  return grid;
}

function getLine(grid: BoardGrid, direction: Direction, index: number): number[] {
  const line: number[] = [];
  if (direction === "left" || direction === "right") {
    for (let i = 0; i < GRID_SIZE; i++) {
      line.push(grid[index][i]);
    }
  } else {
    for (let i = 0; i < GRID_SIZE; i++) {
      line.push(grid[i][index]);
    }
  }
  if (direction === "right" || direction === "down") {
    line.reverse();
  }
  return line;
}

function setLine(
  grid: BoardGrid,
  direction: Direction,
  index: number,
  line: number[]
): void {
  const values =
    direction === "right" || direction === "down" ? [...line].reverse() : line;
  if (direction === "left" || direction === "right") {
    for (let i = 0; i < GRID_SIZE; i++) {
      grid[index][i] = values[i];
    }
  } else {
    for (let i = 0; i < GRID_SIZE; i++) {
      grid[i][index] = values[i];
    }
  }
}

function slideAndMerge(line: number[]): {
  merged: number[];
  score: number;
  moved: boolean;
} {
  const filtered = line.filter((v) => v !== 0);
  const merged: number[] = [];
  let score = 0;
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const newValue = filtered[i] * 2;
      merged.push(newValue);
      score += newValue;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i++;
    }
  }
  while (merged.length < GRID_SIZE) {
    merged.push(0);
  }
  const moved = !line.every((v, idx) => v === merged[idx]);
  return { merged, score, moved };
}

function getLineTiles(
  tiles: TileData[],
  direction: Direction,
  index: number
): TileData[] {
  switch (direction) {
    case "left":
      return tiles
        .filter((t) => t.row === index)
        .sort((a, b) => a.col - b.col);
    case "right":
      return tiles
        .filter((t) => t.row === index)
        .sort((a, b) => b.col - a.col);
    case "up":
      return tiles
        .filter((t) => t.col === index)
        .sort((a, b) => a.row - b.row);
    case "down":
      return tiles
        .filter((t) => t.col === index)
        .sort((a, b) => b.row - a.row);
  }
}

function getResultPosition(
  direction: Direction,
  lineIndex: number,
  slotIndex: number
): { row: number; col: number } {
  switch (direction) {
    case "left":
      return { row: lineIndex, col: slotIndex };
    case "right":
      return { row: lineIndex, col: GRID_SIZE - 1 - slotIndex };
    case "up":
      return { row: slotIndex, col: lineIndex };
    case "down":
      return { row: GRID_SIZE - 1 - slotIndex, col: lineIndex };
  }
}

function findSpawnedTile(
  before: BoardGrid,
  after: BoardGrid
): { row: number; col: number } | null {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (before[row][col] === 0 && after[row][col] !== 0) {
        return { row, col };
      }
    }
  }
  return null;
}

export function moveBoard(
  tiles: TileData[],
  direction: Direction,
  nextId: number
): MoveResult {
  const beforeGrid = tilesToGrid(tiles);
  let moved = false;
  let scoreDelta = 0;

  // First pass: simulate on numeric grid to detect movement and score.
  for (let i = 0; i < GRID_SIZE; i++) {
    const line = getLine(beforeGrid, direction, i);
    const result = slideAndMerge(line);
    if (result.moved) moved = true;
    scoreDelta += result.score;
  }

  if (!moved) {
    return { tiles, scoreDelta: 0, moved: false, nextId, mergeEvents: [] };
  }

  let currentNextId = nextId;
  const newTiles: TileData[] = [];
  const mergeEvents: MergeEvent[] = [];

  // Second pass: map tiles to new positions preserving ids and marking merges.
  for (let i = 0; i < GRID_SIZE; i++) {
    const lineTiles = getLineTiles(tiles, direction, i);
    const processed: {
      value: number;
      id: number;
      isMerged: boolean;
      sourceIds?: [number, number];
    }[] = [];
    let j = 0;
    while (j < lineTiles.length) {
      const current = lineTiles[j];
      const next = lineTiles[j + 1];
      if (next && current.value === next.value) {
        processed.push({
          value: current.value * 2,
          id: currentNextId++,
          isMerged: true,
          sourceIds: [current.id, next.id],
        });
        j += 2;
      } else {
        processed.push({
          value: current.value,
          id: current.id,
          isMerged: false,
        });
        j++;
      }
    }

    for (let slot = 0; slot < processed.length; slot++) {
      const pos = getResultPosition(direction, i, slot);
      const item = processed[slot];

      // Record merge event with source tile ids and target position.
      if (item.sourceIds) {
        mergeEvents.push({
          sourceIds: item.sourceIds,
          target: pos,
          value: item.value,
        });
      }

      newTiles.push({
        id: item.id,
        value: item.value,
        row: pos.row,
        col: pos.col,
        isMerged: item.isMerged,
      });
    }
  }

  // Build the post-move grid (before spawning new tile).
  const afterMoveGrid = tilesToGrid(newTiles);

  // Spawn a new tile.
  const spawnResult = spawnTile(afterMoveGrid, currentNextId);
  currentNextId = spawnResult.nextId;

  const spawned = findSpawnedTile(afterMoveGrid, spawnResult.grid);
  if (spawned) {
    newTiles.push({
      id: currentNextId - 1,
      value: spawnResult.grid[spawned.row][spawned.col],
      row: spawned.row,
      col: spawned.col,
      isNew: true,
    });
  }

  return { tiles: newTiles, scoreDelta, moved: true, nextId: currentNextId, mergeEvents };
}

export function spawnTile(
  grid: BoardGrid,
  nextId: number
): { grid: BoardGrid; nextId: number } {
  const emptyCells: { row: number; col: number }[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === 0) {
        emptyCells.push({ row, col });
      }
    }
  }
  if (emptyCells.length === 0) return { grid, nextId };

  const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < NEW_TILE_PROBABILITY_4 ? 4 : 2;
  const newGrid = grid.map((row) => [...row]);
  newGrid[cell.row][cell.col] = value;
  return { grid: newGrid, nextId: nextId + 1 };
}

export function createInitialBoard(nextId: number): {
  tiles: TileData[];
  nextId: number;
} {
  let grid: BoardGrid = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(0)
  );
  const first = spawnTile(grid, nextId);
  grid = first.grid;
  const second = spawnTile(grid, first.nextId);

  const tiles: TileData[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const value = second.grid[row][col];
      if (value !== 0) {
        tiles.push({ id: nextId++, value, row, col });
      }
    }
  }

  return { tiles, nextId: second.nextId };
}

export function hasValidMoves(grid: BoardGrid): boolean {
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

export function hasWinningTile(grid: BoardGrid): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] >= 2048) return true;
    }
  }
  return false;
}

export function cloneGrid(grid: BoardGrid): BoardGrid {
  return grid.map((row) => [...row]);
}

export function getEmptyCells(grid: BoardGrid): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === 0) {
        cells.push({ row, col });
      }
    }
  }
  return cells;
}

export function simulateMoveGrid(
  grid: BoardGrid,
  direction: Direction
): { grid: BoardGrid; score: number; moved: boolean } {
  let newGrid = cloneGrid(grid);
  let totalScore = 0;
  let moved = false;
  for (let i = 0; i < GRID_SIZE; i++) {
    const line = getLine(newGrid, direction, i);
    const result = slideAndMerge(line);
    if (result.moved) moved = true;
    totalScore += result.score;
    setLine(newGrid, direction, i, result.merged);
  }
  return { grid: newGrid, score: totalScore, moved };
}

export function addRandomTile(
  grid: BoardGrid
): { grid: BoardGrid; value: number } | null {
  const cells = getEmptyCells(grid);
  if (cells.length === 0) return null;
  const cell = cells[Math.floor(Math.random() * cells.length)];
  const value = Math.random() < NEW_TILE_PROBABILITY_4 ? 4 : 2;
  const newGrid = cloneGrid(grid);
  newGrid[cell.row][cell.col] = value;
  return { grid: newGrid, value };
}
