import React from 'react';

interface GameOverModalProps {
  isOpen: boolean;
  finalScore: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  maxDays: number;
  message: string;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen, finalScore, onPlayAgain, onMainMenu, maxDays, message }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-sm w-full text-center border-2 border-cyan-500">
        <h2 className="text-4xl font-black text-cyan-400 mb-2">GAME OVER</h2>
        <p className="text-gray-300 mb-4">{message}</p>
        <div className="my-6">
          <p className="text-lg text-gray-400">Final Net Worth:</p>
          <p className="text-5xl font-bold text-green-400">${finalScore.toLocaleString()}</p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row-reverse gap-4">
          <button
            onClick={onPlayAgain}
            className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-500 transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400"
          >
            Play Again
          </button>
          <button
            onClick={onMainMenu}
            className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-500 transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-400"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;