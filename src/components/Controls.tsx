import { AI_SPEEDS } from "../utils/constants";

interface ControlsProps {
  isAIPlaying: boolean;
  aiSpeed: "slow" | "normal" | "fast";
  onNewGame: () => void;
  onToggleAI: () => void;
  onSetAISpeed: (speed: "slow" | "normal" | "fast") => void;
  onShowHint: () => void;
}

export function Controls({
  isAIPlaying,
  aiSpeed,
  onNewGame,
  onToggleAI,
  onSetAISpeed,
  onShowHint,
}: ControlsProps) {
  return (
    <div className="w-full max-w-[360px] sm:max-w-[400px] mt-4 flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          onClick={onNewGame}
          className="flex-1 py-2 px-4 rounded-md font-bold text-sm transition-transform active:scale-95 hover:opacity-90"
          style={{
            backgroundColor: "var(--text-dark)",
            color: "#f9f6f2",
          }}
        >
          New Game
        </button>

        <button
          onClick={onToggleAI}
          className="flex-1 py-2 px-4 rounded-md font-bold text-sm transition-transform active:scale-95 hover:opacity-90"
          style={{
            backgroundColor: isAIPlaying ? "#f65e3b" : "#8f7a66",
            color: "#f9f6f2",
          }}
        >
          {isAIPlaying ? "Stop AI" : "AI Auto-Play"}
        </button>

        <button
          onClick={onShowHint}
          disabled={isAIPlaying}
          className="flex-1 py-2 px-4 rounded-md font-bold text-sm transition-transform active:scale-95 hover:opacity-90 disabled:opacity-50"
          style={{
            backgroundColor: "#edcf72",
            color: "#f9f6f2",
          }}
        >
          Hint
        </button>
      </div>

      {isAIPlaying && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <span style={{ color: "var(--text)" }}>AI Speed:</span>
          <div className="flex rounded-md overflow-hidden" style={{ backgroundColor: "var(--board-bg)" }}>
            {(["slow", "normal", "fast"] as const).map((speed) => (
              <button
                key={speed}
                onClick={() => onSetAISpeed(speed)}
                className={`px-3 py-1 text-xs font-bold capitalize transition-colors ${
                  aiSpeed === speed
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
                style={{
                  backgroundColor:
                    aiSpeed === speed ? "var(--text-dark)" : "transparent",
                }}
              >
                {speed}
              </button>
            ))}
          </div>
          <span
            className="text-xs tabular-nums"
            style={{ color: "var(--text)" }}
          >
            {AI_SPEEDS[aiSpeed]}ms
          </span>
        </div>
      )}

      <p className="text-xs text-center mt-1" style={{ color: "var(--text)" }}>
        Use <strong>arrow keys</strong> or <strong>WASD</strong> on desktop, swipe on mobile.
      </p>
    </div>
  );
}
