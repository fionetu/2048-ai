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

  const fontSize =
    value < 100 ? 55 : value < 1000 ? 45 : value < 10000 ? 35 : 25;

  const left = gap + col * (tileSize + gap);
  const top = gap + row * (tileSize + gap);

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
        className={`w-full h-full flex items-center justify-center rounded-md font-bold ${
          isNew ? "tile-new" : ""
        } ${isMerged ? "tile-merged" : ""}`}
        style={{
          backgroundColor: color.bg,
          color: color.text,
          fontSize,
        }}
      >
        {value}
      </div>
    </div>
  );
}
