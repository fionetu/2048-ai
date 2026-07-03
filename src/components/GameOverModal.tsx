interface GameOverModalProps {
  hasWon: boolean;
  wonButContinuing: boolean;
  isGameOver: boolean;
  onContinue: () => void;
  onNewGame: () => void;
}

export function GameOverModal({
  hasWon,
  wonButContinuing,
  isGameOver,
  onContinue,
  onNewGame,
}: GameOverModalProps) {
  const showWin = hasWon && !wonButContinuing;
  if (!showWin && !isGameOver) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-lg fade-in">
      <div
        className="text-center p-6 rounded-lg max-w-[80%]"
        style={{ backgroundColor: "rgba(238, 228, 218, 0.95)" }}
      >
        <h2
          className="text-5xl font-bold mb-2"
          style={{ color: "var(--text-dark)" }}
        >
          {showWin ? "You Win!" : "Game Over!"}
        </h2>
        <p className="text-base mb-6" style={{ color: "var(--text)" }}>
          {showWin
            ? "You reached 2048! Keep going for a higher score."
            : "No more moves available. Try again!"}
        </p>
        <div className="flex gap-3 justify-center">
          {showWin && (
            <button
              onClick={onContinue}
              className="py-2 px-5 rounded-md font-bold text-sm transition-transform active:scale-95 hover:opacity-90"
              style={{
                backgroundColor: "#8f7a66",
                color: "#f9f6f2",
              }}
            >
              Keep Going
            </button>
          )}
          <button
            onClick={onNewGame}
            className="py-2 px-5 rounded-md font-bold text-sm transition-transform active:scale-95 hover:opacity-90"
            style={{
              backgroundColor: "var(--text-dark)",
              color: "#f9f6f2",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
