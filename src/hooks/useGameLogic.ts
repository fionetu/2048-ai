import { useCallback, useEffect, useRef, useState } from "react";
import type { Direction, GameState, TileData, MergeEvent } from "../types";
import {
  createInitialBoard,
  hasValidMoves,
  hasWinningTile,
  moveBoard,
  tilesToGrid,
} from "../utils/board";
import { getBestScore, setBestScore } from "../utils/storage";

const MOVE_ANIMATION_DURATION = 150;

function clearAnimationFlags(tiles: TileData[]): TileData[] {
  return tiles.map((tile) => ({
    ...tile,
    isNew: false,
    isMerged: false,
    isMerging: false,
  }));
}

function buildAnimationTiles(
  currentTiles: TileData[],
  resultTiles: TileData[],
  mergeEvents: MergeEvent[]
): TileData[] {
  // Non-merged, non-new tiles slide to their new positions with preserved ids.
  const animationTiles: TileData[] = resultTiles
    .filter((t) => !t.isMerged && !t.isNew)
    .map((t) => ({ ...t, isNew: false, isMerged: false, isMerging: false }));

  // Merge source tiles become ghosts that slide into the merge target cell.
  for (const event of mergeEvents) {
    const [id1, id2] = event.sourceIds;
    const source1 = currentTiles.find((t) => t.id === id1);
    const source2 = currentTiles.find((t) => t.id === id2);
    if (source1 && source2) {
      animationTiles.push(
        {
          ...source1,
          row: event.target.row,
          col: event.target.col,
          isMerging: true,
          isNew: false,
          isMerged: false,
        },
        {
          ...source2,
          row: event.target.row,
          col: event.target.col,
          isMerging: true,
          isNew: false,
          isMerged: false,
        }
      );
    }
  }

  return animationTiles;
}

function createInitialState(): GameState {
  const { tiles, nextId } = createInitialBoard(1);
  return {
    tiles,
    score: 0,
    bestScore: getBestScore(),
    isGameOver: false,
    hasWon: false,
    wonButContinuing: false,
    isAIPlaying: false,
    aiSpeed: "normal",
    suggestedMove: null,
    nextId,
    isAnimating: false,
  };
}

export function useGameLogic() {
  const [state, setState] = useState<GameState>(createInitialState);
  const settleTimeoutRef = useRef<number | null>(null);

  const clearSettleTimeout = useCallback(() => {
    if (settleTimeoutRef.current) {
      window.clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
    }
  }, []);

  const move = useCallback(
    (direction: Direction) => {
      setState((prev) => {
        if (prev.isGameOver || prev.isAnimating) return prev;

        const result = moveBoard(
          clearAnimationFlags(prev.tiles),
          direction,
          prev.nextId
        );
        if (!result.moved) return prev;

        const animationTiles = buildAnimationTiles(
          prev.tiles,
          result.tiles,
          result.mergeEvents
        );

        const newScore = prev.score + result.scoreDelta;
        const newBestScore = Math.max(prev.bestScore, newScore);
        const grid = tilesToGrid(result.tiles);

        let hasWon = prev.hasWon;
        let wonButContinuing = prev.wonButContinuing;
        if (!hasWon && hasWinningTile(grid)) {
          hasWon = true;
        }

        const isGameOver = !hasValidMoves(grid);

        clearSettleTimeout();
        settleTimeoutRef.current = window.setTimeout(() => {
          setState((current) => ({
            ...current,
            tiles: result.tiles,
            score: newScore,
            bestScore: newBestScore,
            nextId: result.nextId,
            isGameOver,
            hasWon,
            wonButContinuing,
            isAnimating: false,
            suggestedMove: null,
          }));
          settleTimeoutRef.current = null;
        }, MOVE_ANIMATION_DURATION);

        return {
          ...prev,
          tiles: animationTiles,
          score: prev.score,
          bestScore: prev.bestScore,
          nextId: prev.nextId,
          isAnimating: true,
          suggestedMove: null,
        };
      });
    },
    [setState, clearSettleTimeout]
  );

  const newGame = useCallback(() => {
    clearSettleTimeout();
    setState(createInitialState);
  }, [setState, clearSettleTimeout]);

  const continueAfterWin = useCallback(() => {
    setState((prev) => ({
      ...prev,
      wonButContinuing: true,
    }));
  }, [setState]);

  const toggleAI = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isAIPlaying: !prev.isAIPlaying,
      suggestedMove: null,
    }));
  }, [setState]);

  const setAISpeed = useCallback(
    (speed: "slow" | "normal" | "fast") => {
      setState((prev) => ({
        ...prev,
        aiSpeed: speed,
      }));
    },
    [setState]
  );

  const setSuggestedMove = useCallback(
    (move: Direction | null) => {
      setState((prev) => ({
        ...prev,
        suggestedMove: move,
      }));
    },
    [setState]
  );

  const setTiles = useCallback(
    (updater: (prev: TileData[]) => TileData[]) => {
      setState((prev) => ({
        ...prev,
        tiles: updater(prev.tiles),
      }));
    },
    [setState]
  );

  useEffect(() => {
    setBestScore(state.bestScore);
  }, [state.bestScore]);

  useEffect(() => {
    return () => {
      clearSettleTimeout();
    };
  }, [clearSettleTimeout]);

  return {
    state,
    move,
    newGame,
    continueAfterWin,
    toggleAI,
    setAISpeed,
    setSuggestedMove,
    setTiles,
  };
}
