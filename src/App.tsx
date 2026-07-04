import { Board } from "./components/Board";
import { Controls } from "./components/Controls";
import { GameHeader } from "./components/GameHeader";
import { GameOverModal } from "./components/GameOverModal";
import { useAI } from "./hooks/useAI";
import { useGameLogic } from "./hooks/useGameLogic";
import { useKeyboard } from "./hooks/useKeyboard";
import { useTouchSwipe } from "./hooks/useTouchSwipe";

function App() {
  const {
    state,
    move,
    newGame,
    continueAfterWin,
    toggleAI,
    setAISpeed,
    setSuggestedMove,
  } = useGameLogic();

  const { showHint } = useAI({
    tiles: state.tiles,
    isAIPlaying: state.isAIPlaying,
    aiSpeed: state.aiSpeed,
    isGameOver: state.isGameOver,
    hasWon: state.hasWon,
    wonButContinuing: state.wonButContinuing,
    isAnimating: state.isAnimating,
    onMove: move,
    onSuggest: setSuggestedMove,
  });

  const inputEnabled = !state.isGameOver && !state.isAIPlaying && !state.isAnimating;
  useKeyboard(move, inputEnabled);
  useTouchSwipe(move, inputEnabled);

  return (
    <div className="flex flex-col items-center w-full max-w-lg py-6">
      <GameHeader score={state.score} bestScore={state.bestScore} />

      <div className="relative w-full flex justify-center">
        <Board tiles={state.tiles} suggestedMove={state.suggestedMove} />
        <GameOverModal
          hasWon={state.hasWon}
          wonButContinuing={state.wonButContinuing}
          isGameOver={state.isGameOver}
          onContinue={continueAfterWin}
          onNewGame={newGame}
        />
      </div>

      <Controls
        isAIPlaying={state.isAIPlaying}
        aiSpeed={state.aiSpeed}
        onNewGame={newGame}
        onToggleAI={toggleAI}
        onSetAISpeed={setAISpeed}
        onShowHint={showHint}
      />
    </div>
  );
}

export default App;
