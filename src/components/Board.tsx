import { useEffect, useRef, useState } from "react";
import type { Direction, TileData } from "../types";
import { GRID_SIZE } from "../utils/constants";
import { Tile } from "./Tile";

interface BoardProps {
  tiles: TileData[];
  suggestedMove: Direction | null;
}

export function Board({ tiles, suggestedMove }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(0);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setBoardSize(width);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const gap = Math.max(8, Math.floor(boardSize * 0.02));
  const tileSize =
    boardSize > 0
      ? (boardSize - gap * (GRID_SIZE + 1)) / GRID_SIZE
      : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[360px] sm:max-w-[400px] aspect-square rounded-lg"
      style={{
        backgroundColor: "var(--board-bg)",
      }}
    >
      {/* Background grid cells */}
      <div
        className="absolute inset-0 grid grid-cols-4 grid-rows-4"
        style={{ padding: gap, gap }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
          <div
            key={index}
            className="rounded-md"
            style={{ backgroundColor: "var(--cell-bg)" }}
          />
        ))}
      </div>

      {/* Tiles */}
      <div className="absolute inset-0" style={{ padding: gap }}>
        {tiles.map((tile) => (
          <Tile
            key={tile.id}
            tile={tile}
            tileSize={tileSize}
            gap={gap}
          />
        ))}
      </div>

      {/* Suggestion arrow */}
      {suggestedMove && boardSize > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="text-white text-6xl opacity-70 fade-in drop-shadow-lg"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
          >
            {suggestedMove === "up" && "↑"}
            {suggestedMove === "down" && "↓"}
            {suggestedMove === "left" && "←"}
            {suggestedMove === "right" && "→"}
          </div>
        </div>
      )}
    </div>
  );
}
