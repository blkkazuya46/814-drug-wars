import React, { useState } from 'react';
import type { PlayerState } from '../types';
import { STASH_HOUSE_COST, ITEMS, STASH_HOUSE_UPGRADE_COST_BASE, STASH_HOUSE_UPGRADE_COST_MULTIPLIER, STASH_HOUSE_UPGRADE_AMOUNT } from '../constants';
import { StashHouseIcon } from './icons/StashHouseIcon';
import { ItemIcon } from './icons/items/ItemIcon';

// New visual component for capacity
const CapacityMeter: React.FC<{ used: number; capacity: number }> = ({ used, capacity }) => {
  const UNIT_SIZE = 10;
  const totalUnits = Math.ceil(capacity / UNIT_SIZE);
  const usedUnits = Math.floor(used / UNIT_SIZE);

  const units = Array.from({ length: totalUnits }, (_, i) => {
    const isUsed = i < usedUnits;
    return (
      <div
        key={i}
        className={`w-2 h-4 rounded-sm ${isUsed ? 'bg-teal-400' : 'bg-gray-700/50'}`}
        title={`Capacity: ${used.toLocaleString()} / ${capacity.toLocaleString()}`}
      ></div>
    );
  });

  return (
    <div className="flex flex-wrap gap-1 p-1 bg-gray-900/50 rounded-md">
      {units}
    </div>
  );
};


interface StashItemRowProps {
  itemName: string;
  inventoryQty: number;
  stashQty: number;
  onMoveToStash: (itemName: string, quantity: number) => void;
  onMoveFromStash: (itemName: string, quantity: number) => void;
  inventorySpaceLeft: number;
  stashSpaceLeft: number;
}

const StashItemRow: React.FC<StashItemRowProps> = ({
  itemName,
  inventoryQty,
  stashQty,
  onMoveToStash,
  onMoveFromStash,
  inventorySpaceLeft,
  stashSpaceLeft
}) => {
  const [quantity, setQuantity] = useState<number | string>(1);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
        setQuantity('');
        return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
        setQuantity(numValue);
    }
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setQuantity(1);
    }
  };
  
  const transactionQuantity = Number(quantity) || 0;

  const canMoveToStash = transactionQuantity > 0 && inventoryQty >= transactionQuantity && stashSpaceLeft >= transactionQuantity;
  const canMoveFromStash = transactionQuantity > 0 && stashQty >= transactionQuantity && inventorySpaceLeft >= transactionQuantity;
  
  const maxToStash = Math.min(inventoryQty, stashSpaceLeft);
  const maxFromStash = Math.min(stashQty, inventorySpaceLeft);


  return (
    <div className="grid grid-cols-12 gap-2 items-center text-sm">
      <div className="col-span-3 flex items-center gap-2">
        <ItemIcon itemName={itemName} />
        <span className="hidden sm:inline">{itemName}</span>
      </div>
      <div className="col-span-2 text-center font-semibold">{inventoryQty.toLocaleString()}</div>
      <div className="col-span-5 flex items-stretch justify-center gap-1">
        <button 
            onClick={() => onMoveFromStash(itemName, transactionQuantity)}
            disabled={!canMoveFromStash}
            className="px-2 py-1 bg-cyan-700 rounded disabled:bg-gray-600 hover:bg-cyan-600 transition-colors"
            aria-label={`Move ${transactionQuantity} ${itemName} from stash`}
        >
            &lt;
        </button>
        <input
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          onBlur={handleBlur}
          min="1"
          className="w-16 bg-gray-900 border border-gray-700 rounded-md p-1 text-center focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          aria-label={`Quantity of ${itemName} to transfer`}
        />
        <button 
            onClick={() => onMoveToStash(itemName, transactionQuantity)}
            disabled={!canMoveToStash}
            className="px-2 py-1 bg-teal-700 rounded disabled:bg-gray-600 hover:bg-teal-600 transition-colors"
            aria-label={`Move ${transactionQuantity} ${itemName} to stash`}
        >
            &gt;
        </button>
      </div>
      <div className="col-span-2 text-center font-semibold">{stashQty.toLocaleString()}</div>
      <div className="col-span-3"></div>
      <div className="col-span-9 flex items-center justify-center gap-1 -mt-1">
          <button onClick={() => setQuantity(maxFromStash > 0 ? maxFromStash : 1)} disabled={maxFromStash <= 0} className="text-xs bg-gray-700/80 hover:bg-gray-700 rounded py-0.5 px-2 transition-colors font-semibold disabled:bg-gray-800 disabled:text-gray-500">
            Max Pockets
          </button>
          <button onClick={() => setQuantity(maxToStash > 0 ? maxToStash : 1)} disabled={maxToStash <= 0} className="text-xs bg-gray-700/80 hover:bg-gray-700 rounded py-0.5 px-2 transition-colors font-semibold disabled:bg-gray-800 disabled:text-gray-500">
            Max Stash
          </button>
      </div>
    </div>
  );
};


interface StashHouseProps {
  player: PlayerState;
  currentCity: string;
  onBuyStashHouse: () => void;
  onMoveToStash: (itemName: string, quantity: number) => void;
  onMoveFromStash: (itemName: string, quantity: number) => void;
  onUpgradeStashHouse: () => void;
}

const StashHouseComponent: React.FC<StashHouseProps> = ({ player, currentCity, onBuyStashHouse, onMoveToStash, onMoveFromStash, onUpgradeStashHouse }) => {
  const localStash = player.stashHouses.find(sh => sh.city === currentCity);

  const renderBuyView = () => (
    <div className="text-center py-4">
      <p className="mb-4 text-gray-400">Secure your assets by purchasing a local stash house.</p>
      <button
        onClick={onBuyStashHouse}
        disabled={player.cash < STASH_HOUSE_COST}
        className="w-full bg-teal-600 text-white font-bold py-3 px-2 rounded-md hover:bg-teal-500 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-400"
      >
        Buy Stash House - ${STASH_HOUSE_COST.toLocaleString()}
      </button>
    </div>
  );

  const renderManageView = () => {
    if (!localStash) return null;
    
    // Upgrade logic
    const upgradeCost = Math.round(STASH_HOUSE_UPGRADE_COST_BASE * Math.pow(STASH_HOUSE_UPGRADE_COST_MULTIPLIER, localStash.upgradeLevel));
    const canAffordUpgrade = player.cash >= upgradeCost;
    const nextCapacity = localStash.capacity + STASH_HOUSE_UPGRADE_AMOUNT;
    
    return (
        <div>
            <div className="mb-3">
                <div className="flex justify-between items-center mb-2 text-xs">
                    <span className="font-semibold">Stash Capacity</span>
                    <span className="font-bold">{localStash.used.toLocaleString()} / {localStash.capacity.toLocaleString()}</span>
                </div>
                <CapacityMeter used={localStash.used} capacity={localStash.capacity} />
            </div>
            <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-400 mb-2 px-1">
                <div className="col-span-3">Item</div>
                <div className="col-span-2 text-center">Pockets</div>
                <div className="col-span-5 text-center">Transfer</div>
                <div className="col-span-2 text-center">Stash</div>
            </div>
            <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                {ITEMS.map(item => (
                    (player.inventory[item.name] > 0 || localStash.contents[item.name] > 0) &&
                    <StashItemRow 
                        key={item.name}
                        itemName={item.name}
                        inventoryQty={player.inventory[item.name] || 0}
                        stashQty={localStash.contents[item.name] || 0}
                        onMoveToStash={onMoveToStash}
                        onMoveFromStash={onMoveFromStash}
                        inventorySpaceLeft={player.inventorySpace - player.inventoryUsed}
                        stashSpaceLeft={localStash.capacity - localStash.used}
                    />
                ))}
            </div>
             <div className="mt-4 pt-4 border-t border-gray-700/50">
                <h3 className="font-semibold text-gray-400 text-sm mb-2">Upgrade Storage</h3>
                <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg mb-2 text-xs">
                    <span className="font-semibold">Next Upgrade:</span>
                    <span className="font-bold text-green-400">+{STASH_HOUSE_UPGRADE_AMOUNT} (to {nextCapacity})</span>
                </div>
                <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg mb-3 text-xs">
                    <span className="font-semibold">Cost:</span>
                    <span className="font-bold text-red-400">${upgradeCost.toLocaleString()}</span>
                </div>
                <button
                    onClick={onUpgradeStashHouse}
                    disabled={!canAffordUpgrade}
                    className="w-full bg-purple-600 text-white font-bold py-2 px-2 rounded-md hover:bg-purple-500 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                >
                    Reinforce Walls
                </button>
            </div>
        </div>
    );
  };


  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4">
      <div className="flex items-center gap-3">
        <StashHouseIcon />
        <h2 className="text-xl font-bold mb-1">Stash House</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">Local Storage</p>

      {localStash ? renderManageView() : renderBuyView()}
    </div>
  );
};

export default StashHouseComponent;