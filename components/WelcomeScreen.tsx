import React from 'react';

interface WelcomeScreenProps {
  onStart: (duration: number) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="text-center max-w-2xl bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-8 border-2 border-cyan-500/50">
        <h1 className="text-5xl md:text-7xl font-black text-cyan-400 tracking-wider uppercase mb-2">
          814 Drug Wars
        </h1>
        <p className="text-2xl font-semibold text-gray-300 mb-6">The Come Up</p>
        <p className="text-lg text-gray-400 mb-8 leading-relaxed">
          Welcome to the underworld. Buy low, sell high, and watch your back.
          Choose your hustle.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onStart(30)}
              className="w-full sm:w-auto bg-cyan-600 text-white font-bold py-3 px-6 rounded-md hover:bg-cyan-500 transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400 transform hover:scale-105"
            >
              30 Days
              <span className="block text-xs opacity-75">(Classic)</span>
            </button>
            <button
              onClick={() => onStart(60)}
              className="w-full sm:w-auto bg-purple-600 text-white font-bold py-3 px-6 rounded-md hover:bg-purple-500 transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-400 transform hover:scale-105"
            >
              60 Days
              <span className="block text-xs opacity-75">(Extended)</span>
            </button>
            <button
              onClick={() => onStart(90)}
              className="w-full sm:w-auto bg-orange-600 text-white font-bold py-3 px-6 rounded-md hover:bg-orange-500 transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-orange-400 transform hover:scale-105"
            >
              90 Days
              <span className="block text-xs opacity-75">(Marathon)</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;