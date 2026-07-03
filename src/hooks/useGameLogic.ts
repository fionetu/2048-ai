import { useCallback, useEffect, useState } from "react";
import type { Direction, GameState, TileData } from "../types";
import {
  createInitialBoard,
  hasValidMoves,
  hasWinningTile,
  moveBoard,
  tilesToGrid,
} from "../utils/board";
import { getBestScore, setBestScore } from "../utils/storage";

function clearAnimationFlags(tiles: TileData[]): TileData[] {
  return tiles.map((tile) => ({
    ...tile,
    isNew: false,
    isMerged: false,
  }));
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
  };
}

export function useGameLogic() {
  const [state, setState] = useState<GameState>(createInitialState);

  const move = useCallback(
    (direction: Direction) => {
      setState((prev) => {
        if (prev.isGameOver) return prev;

        const result = moveBoard(
          clearAnimationFlags(prev.tiles),
          direction,
          prev.nextId
        );
        if (!result.moved) return prev;

        const newScore = prev.score + result.scoreDelta;
        const newBestScore = Math.max(prev.bestScore, newScore);
        const grid = tilesToGrid(result.tiles);

        let hasWon = prev.hasWon;
        let wonButContinuing = prev.wonButContinuing;
        if (!hasWon && hasWinningTile(grid)) {
          hasWon = true;
        }

        const isGameOver = !hasValidMoves(grid);

        return {
          ...prev,
          tiles: result.tiles,
          score: newScore,
          bestScore: newBestScore,
          nextId: result.nextId,
          isGameOver,
          hasWon,
          wonButContinuing,
          suggestedMove: null,
        };
      });
    },
    [setState]
  );

  const newGame = useCallback(() => {
    setState(createInitialState);
  }, [setState]);

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
