interface GameHeaderProps {
  score: number;
  bestScore: number;
}

export function GameHeader({ score, bestScore }: GameHeaderProps) {
  return (
    <div className="w-full max-w-[360px] sm:max-w-[400px] flex justify-between items-end mb-4">
      <div>
        <h1
          className="text-6xl sm:text-7xl font-bold m-0 leading-none"
          style={{ color: "var(--text-dark)" }}
        >
          2048
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--text)" }}>
          合并数字， reaching 2048!
        </p>
      </div>

      <div className="flex gap-2">
        <ScoreBox label="SCORE" value={score} />
        <ScoreBox label="BEST" value={bestScore} />
      </div>
    </div>
  );
}

function ScoreBox({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-3 py-2 rounded-md min-w-[70px]"
      style={{ backgroundColor: "var(--board-bg)" }}
    >
      <span
        className="text-[10px] font-bold tracking-wider"
        style={{ color: "#eee4da" }}
      >
        {label}
      </span>
      <span
        className="text-xl font-bold"
        style={{ color: "#f9f6f2" }}
      >
        {value.toLocaleString()}
      </span>
    </div>
  );
}
