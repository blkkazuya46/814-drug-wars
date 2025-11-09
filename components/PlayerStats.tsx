import React from 'react';
import type { Inventory, PlayerState } from '../types';
import { CashIcon } from './icons/CashIcon';
import { InventoryIcon } from './icons/InventoryIcon';
import { ItemIcon } from './icons/items/ItemIcon';
import { ITEMS, STASH_HOUSE_UPKEEP_COST } from '../constants';
import { AllianceIcon } from './icons/AllianceIcon';
import { StashHouseIcon } from './icons/StashHouseIcon';
import { BankIcon } from './icons/BankIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { SharkIcon } from './icons/SharkIcon';

interface PlayerStatsProps {
  player: PlayerState;
  netWorth: number;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ player, netWorth }) => {
  const { cash, inventory, inventoryUsed, inventorySpace, playerAlliance, stashHouses, bankBalance, debt } = player;
  const ownedItems = ITEMS.filter(item => inventory[item.name] > 0);
  const stashHouseUpkeep = stashHouses.length * STASH_HOUSE_UPKEEP_COST;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4 border-b-2 border-cyan-500 pb-2">My Stash</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <TrendingUpIcon />
            <span className="font-semibold">Net Worth</span>
          </div>
          <span className="font-bold text-yellow-400 text-lg">${netWorth.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <CashIcon />
            <span className="font-semibold">Cash</span>
          </div>
          <span className="font-bold text-green-400 text-lg">${cash.toLocaleString()}</span>
        </div>
        {debt > 0 && (
          <div className="flex justify-between items-center bg-red-900/50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <SharkIcon />
              <span className="font-semibold">Debt</span>
            </div>
            <span className="font-bold text-red-400 text-lg">${debt.toLocaleString()}</span>
          </div>
        )}
         <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <BankIcon />
            <span className="font-semibold">Bank</span>
          </div>
          <span className="font-bold text-blue-400 text-lg">${bankBalance.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <InventoryIcon />
            <span className="font-semibold">Inventory</span>
          </div>
          <span className="font-bold text-cyan-400 text-lg">{inventoryUsed} / {inventorySpace}</span>
        </div>

        {playerAlliance && (
          <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <AllianceIcon />
              <span className="font-semibold">Allegiance</span>
            </div>
            <span className="font-bold text-orange-400 text-lg">{playerAlliance}</span>
          </div>
        )}

        {stashHouses.length > 0 && (
          <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <StashHouseIcon />
              <span className="font-semibold">Stash Houses</span>
            </div>
            <div>
              <span className="font-bold text-teal-400 text-lg">{stashHouses.length}</span>
              {stashHouseUpkeep > 0 && (
                <span className="text-xs text-red-400 ml-2">(-${stashHouseUpkeep.toLocaleString()}/day)</span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
            <h3 className="font-semibold text-gray-400 text-sm">Holdings:</h3>
            {ownedItems.length > 0 ? (
                 ownedItems.map(item => (
                    <div key={item.name} className="flex justify-between items-center text-sm bg-gray-700/40 px-3 py-2 rounded">
                        <div className="flex items-center gap-2">
                            <ItemIcon itemName={item.name} />
                            <span>{item.name}</span>
                        </div>
                        <span className="font-semibold">{inventory[item.name].toLocaleString()}</span>
                    </div>
                ))
            ) : (
                <p className="text-sm text-gray-500 italic text-center py-2">Your pockets are empty.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;