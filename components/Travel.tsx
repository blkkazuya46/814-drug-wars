

import React from 'react';
import type { City } from '../types';
import { GlobeIcon } from './icons/GlobeIcon';

interface TravelProps {
  cities: City[];
  currentCity: string;
  onTravel: (destination: string) => void;
  isLoading: boolean;
}

const Travel: React.FC<TravelProps> = ({ cities, currentCity, onTravel, isLoading }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4 border-b-2 border-cyan-500 pb-2">Travel</h2>
      <div className="grid grid-cols-2 gap-3">
        {cities.map(city => {
          if (city.name === currentCity) {
            return (
              <div key={city.name} className="w-full bg-gray-700 text-gray-400 font-bold py-3 px-2 rounded-md text-center cursor-default">
                {city.name} (Current)
              </div>
            );
          }

          if (city.isOverseas) {
            return (
              <button
                key={city.name}
                onClick={() => onTravel(city.name)}
                disabled={isLoading}
                className="w-full bg-red-700 text-white font-bold py-3 px-2 rounded-md hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                title="High-risk international travel!"
              >
                <GlobeIcon />
                {city.name}
              </button>
            );
          }

          return (
            <button
              key={city.name}
              onClick={() => onTravel(city.name)}
              disabled={isLoading}
              className="w-full bg-cyan-600 text-white font-bold py-3 px-2 rounded-md hover:bg-cyan-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {city.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Travel;