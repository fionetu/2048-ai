import type { TileData } from "../types";
import { TILE_COLORS, DEFAULT_TILE_COLOR } from "../utils/constants";

interface TileProps {
  tile: TileData;
  tileSize: number;
  gap: number;
}

export function Tile({ tile, tileSize, gap }: TileProps) {
  const { value, row, col, isNew, isMerged, isMerging } = tile;
  const color = TILE_COLORS[value] ?? DEFAULT_TILE_COLOR;

  // Scale font size relative to tile size so numbers stay centered and readable.
  const fontSize =
    value < 100 ? tileSize * 0.58 : value < 1000 ? tileSize * 0.48 : tileSize * 0.38;

  // Offset tiles up-left to compensate for rendering mismatch between
  // calculated position and the actual CSS Grid cell position.
  const offset = tileSize * 0.12;
  const left = gap + col * (tileSize + gap) - offset;
  const top = gap + row * (tileSize + gap) - offset;

  return (
    <div
      className="absolute transition-transform duration-150 ease-in-out"
      style={{
        width: tileSize,
        height: tileSize,
        transform: `translate(${left}px, ${top}px)`,
        zIndex: isMerging ? 1 : isMerged ? 3 : 2,
        opacity: isMerging ? 0.9 : 1,
      }}
    >
      <div
        className={`w-full h-full flex items-center justify-center rounded-sm font-bold leading-none ${
          isNew ? "tile-new" : ""
        } ${isMerged ? "tile-merged" : ""}`}
        style={{
          backgroundColor: color.bg,
          color: color.text,
          fontSize,
          boxShadow: isMerging
            ? "none"
            : "inset 0 1px 0 rgba(255, 255, 255, 0.25)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
