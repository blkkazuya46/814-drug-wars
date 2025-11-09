import React from 'react';
import { CashIcon } from './icons/CashIcon';
import { DayIcon } from './icons/DayIcon';
import { LocationIcon } from './icons/LocationIcon';
import { InventoryIcon } from './icons/InventoryIcon';
import { MuteIcon } from './icons/MuteIcon';
import { UnmuteIcon } from './icons/UnmuteIcon';


interface HeaderProps {
  day: number;
  maxDays: number;
  cash: number;
  currentCity: string;
  inventoryUsed: number;
  inventoryMax: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

const Header: React.FC<HeaderProps> = ({ day, maxDays, cash, currentCity, inventoryUsed, inventoryMax, isMuted, onToggleMute }) => {
  const inventoryPercentage = inventoryMax > 0 ? (inventoryUsed / inventoryMax) * 100 : 0;

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-black text-cyan-400 tracking-wider uppercase">
            814 Drug Wars
            </h1>
            <button 
              onClick={onToggleMute} 
              className="p-2 bg-gray-700/50 rounded-full hover:bg-gray-700 transition-colors"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
              aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? <MuteIcon /> : <UnmuteIcon />}
            </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-gray-700/50 p-2 rounded-lg">
            <DayIcon />
            <div>
              <span className="font-bold">Day</span>
              <p>{day} / {maxDays}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-700/50 p-2 rounded-lg">
            <LocationIcon />
            <div>
              <span className="font-bold">Location</span>
              <p>{currentCity}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-700/50 p-2 rounded-lg col-span-2 sm:col-span-1">
            <CashIcon />
            <div>
              <span className="font-bold">Cash</span>
              <p className="text-green-400 font-semibold">${cash.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1 text-xs">
            <div className="flex items-center gap-1 font-semibold">
                <InventoryIcon />
                <span>Inventory</span>
            </div>
            <span>{inventoryUsed} / {inventoryMax}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${inventoryPercentage}%` }}
          ></div>
        </div>
      </div>
    </header>
  );
};

export default Header;