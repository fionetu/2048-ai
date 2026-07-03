import { useCallback, useEffect, useRef } from "react";
import type { Direction } from "../types";
import { findBestMove, getHint } from "../ai/expectimax";
import { AI_SPEEDS } from "../utils/constants";
import { tilesToGrid } from "../utils/board";

interface UseAIProps {
  tiles: import("../types").TileData[];
  isAIPlaying: boolean;
  aiSpeed: "slow" | "normal" | "fast";
  isGameOver: boolean;
  hasWon: boolean;
  wonButContinuing: boolean;
  onMove: (direction: Direction) => void;
  onSuggest: (direction: Direction | null) => void;
}

export function useAI({
  tiles,
  isAIPlaying,
  aiSpeed,
  isGameOver,
  hasWon,
  wonButContinuing,
  onMove,
  onSuggest,
}: UseAIProps) {
  const hintTimeoutRef = useRef<number | null>(null);
  const aiIntervalRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef<number>(0);

  const computeBestMove = useCallback((): Direction | null => {
    const grid = tilesToGrid(tiles);
    const { direction } = findBestMove(grid, 3);
    return direction;
  }, [tiles]);

  // Show hint arrow briefly.
  const showHint = useCallback(() => {
    if (hintTimeoutRef.current) {
      window.clearTimeout(hintTimeoutRef.current);
    }
    const grid = tilesToGrid(tiles);
    const direction = getHint(grid);
    onSuggest(direction);
    hintTimeoutRef.current = window.setTimeout(() => {
      onSuggest(null);
      hintTimeoutRef.current = null;
    }, 1500);
  }, [tiles, onSuggest]);

  // AI auto-play loop.
  useEffect(() => {
    if (!isAIPlaying || isGameOver) {
      if (aiIntervalRef.current) {
        window.clearInterval(aiIntervalRef.current);
        aiIntervalRef.current = null;
      }
      return;
    }

    // Pause briefly on win unless continuing.
    if (hasWon && !wonButContinuing) {
      if (aiIntervalRef.current) {
        window.clearInterval(aiIntervalRef.current);
        aiIntervalRef.current = null;
      }
      return;
    }

    const interval = AI_SPEEDS[aiSpeed];

    const makeMove = () => {
      const now = Date.now();
      if (now - lastMoveTimeRef.current < interval) return;
      const direction = computeBestMove();
      if (direction) {
        onMove(direction);
        lastMoveTimeRef.current = now;
      }
    };

    makeMove();
    aiIntervalRef.current = window.setInterval(makeMove, interval);

    return () => {
      if (aiIntervalRef.current) {
        window.clearInterval(aiIntervalRef.current);
        aiIntervalRef.current = null;
      }
    };
  }, [
    isAIPlaying,
    isGameOver,
    hasWon,
    wonButContinuing,
    aiSpeed,
    computeBestMove,
    onMove,
  ]);

  // Clear suggestion when AI starts.
  useEffect(() => {
    if (isAIPlaying) {
      onSuggest(null);
    }
  }, [isAIPlaying, onSuggest]);

  return { showHint };
}
