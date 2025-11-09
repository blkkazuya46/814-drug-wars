import React from 'react';
import { INVENTORY_UPGRADE_COST_BASE, INVENTORY_UPGRADE_COST_MULTIPLIER, INVENTORY_UPGRADE_AMOUNT } from '../constants';
import { UpgradeIcon } from './icons/UpgradeIcon';
import { InventoryIcon } from './icons/InventoryIcon';

interface UpgradesProps {
  playerCash: number;
  currentInventorySpace: number;
  upgradeLevel: number;
  onUpgradeInventory: () => void;
}

const Upgrades: React.FC<UpgradesProps> = ({ playerCash, currentInventorySpace, upgradeLevel, onUpgradeInventory }) => {
  const upgradeCost = Math.round(INVENTORY_UPGRADE_COST_BASE * Math.pow(INVENTORY_UPGRADE_COST_MULTIPLIER, upgradeLevel));
  const canAfford = playerCash >= upgradeCost;
  const nextCapacity = currentInventorySpace + INVENTORY_UPGRADE_AMOUNT;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4">
      <div className="flex items-center gap-3">
        <UpgradeIcon />
        <h2 className="text-xl font-bold mb-1">Upgrades</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">Black Market Gear</p>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg">
          <div className="flex items-center gap-2">
            <InventoryIcon />
            <span className="font-semibold text-gray-400">Current Capacity:</span>
          </div>
          <span className="font-bold text-cyan-400">{currentInventorySpace.toLocaleString()}</span>
        </div>
        
        <div className="pt-3 border-t border-gray-700/50 mt-4">
          <h3 className="font-semibold text-gray-400 text-sm mb-2">Next Upgrade:</h3>
          <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg mb-3">
              <span className="font-semibold text-gray-400">Capacity Increase:</span>
              <span className="font-bold text-green-400">+{INVENTORY_UPGRADE_AMOUNT} (to {nextCapacity})</span>
          </div>
          <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg">
            <span className="font-semibold text-gray-400">Cost:</span>
            <span className="font-bold text-red-400">${upgradeCost.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="pt-2">
          <button
            onClick={onUpgradeInventory}
            disabled={!canAfford}
            className="w-full bg-purple-600 text-white font-bold py-3 px-2 rounded-md hover:bg-purple-500 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-400"
          >
            Buy Trenchcoat Lining
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upgrades;
