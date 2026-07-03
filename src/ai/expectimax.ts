import type { BoardGrid, Direction } from "../types";
import { evaluateBoard, getEmptyCellSpawns, getPossibleMoves } from "./heuristics";

const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

export function findBestMove(
  grid: BoardGrid,
  depth: number = 3
): { direction: Direction | null; score: number } {
  let bestDirection: Direction | null = null;
  let bestScore = -Infinity;

  for (const direction of DIRECTIONS) {
    const moveResult = getPossibleMoves(grid).find(
      (m) => m.direction === direction
    );
    if (!moveResult) continue;

    const score = expectimax(moveResult.grid, depth - 1, false);
    if (score > bestScore) {
      bestScore = score;
      bestDirection = direction;
    }
  }

  return { direction: bestDirection, score: bestScore };
}

function expectimax(
  grid: BoardGrid,
  depth: number,
  isPlayerTurn: boolean
): number {
  if (depth === 0) {
    return evaluateBoard(grid);
  }

  if (isPlayerTurn) {
    const moves = getPossibleMoves(grid);
    if (moves.length === 0) {
      return evaluateBoard(grid);
    }
    let maxScore = -Infinity;
    for (const move of moves) {
      const score = expectimax(move.grid, depth - 1, false);
      if (score > maxScore) {
        maxScore = score;
      }
    }
    return maxScore;
  }

  // Chance node: tile spawn.
  const spawns = getEmptyCellSpawns(grid);
  if (spawns.length === 0) {
    return evaluateBoard(grid);
  }

  let totalScore = 0;
  for (const spawn of spawns) {
    const newGrid = grid.map((row) => [...row]);
    newGrid[spawn.row][spawn.col] = spawn.value;
    totalScore += spawn.probability * expectimax(newGrid, depth - 1, true);
  }
  return totalScore;
}

export function getHint(grid: BoardGrid): Direction | null {
  const { direction } = findBestMove(grid, 2);
  return direction;
}
