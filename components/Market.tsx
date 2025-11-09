

import React, { useState, useMemo } from 'react';
import { ITEMS, ALLIANCES, ALLIANCE_DISCOUNT } from '../constants';
import type { Inventory, Item } from '../types';
import { ItemIcon } from './icons/items/ItemIcon';
import { SortIcon } from './icons/SortIcon';

interface MarketItemRowProps {
  itemName: string;
  price: number;
  owned: number;
  onBuy: (itemName: string, quantity: number, price: number) => void;
  onSell: (itemName: string, quantity: number, price: number) => void;
  playerCash: number;
  inventorySpaceLeft: number;
  playerAlliance: string | null;
  currentCity: string;
}

const MarketItemRow: React.FC<MarketItemRowProps> = ({ itemName, price, owned, onBuy, onSell, playerCash, inventorySpaceLeft, playerAlliance, currentCity }) => {
  const [quantity, setQuantity] = useState<number | string>(1);

  const alliance = useMemo(() => {
    if (!playerAlliance) return null;
    return ALLIANCES.find(a => a.name === playerAlliance);
  }, [playerAlliance]);

  const isDiscounted = alliance && alliance.homeCity === currentCity && alliance.specialtyItem === itemName;
  const displayPrice = isDiscounted ? Math.round(price * ALLIANCE_DISCOUNT) : price;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow an empty string for user input flexibility
    if (value === '') {
      setQuantity('');
      return;
    }
    const numValue = parseInt(e.target.value, 10);
    // Update state only for valid positive integers
    if (!isNaN(numValue) && numValue > 0) {
      setQuantity(numValue);
    }
  };

  const adjustQuantity = (amount: number) => {
    setQuantity(q => {
      const current = Number(q) || 0;
      const newValue = current + amount;
      return newValue > 0 ? newValue : 1;
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setQuantity(1);
    }
  };


  const transactionQuantity = Number(quantity) || 0;

  const canBuy = transactionQuantity > 0 && playerCash >= displayPrice * transactionQuantity && inventorySpaceLeft >= transactionQuantity;
  const canSell = transactionQuantity > 0 && owned >= transactionQuantity;
  
  const maxBuy = displayPrice > 0 ? Math.min(Math.floor(playerCash / displayPrice), inventorySpaceLeft) : inventorySpaceLeft;
  
  const handleBuyClick = () => {
    onBuy(itemName, transactionQuantity, displayPrice);
    setQuantity(1);
  };

  const handleSellClick = () => {
    onSell(itemName, transactionQuantity, displayPrice);
    setQuantity(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center bg-gray-800/60 p-3 rounded-lg hover:bg-gray-800 transition-colors duration-200">
      <div className="md:col-span-3 font-bold text-lg flex items-center gap-3">
        <ItemIcon itemName={itemName} />
        <span>{itemName}</span>
      </div>
      <div className="md:col-span-2 text-green-400">
        ${displayPrice.toLocaleString()}
        {isDiscounted && <span className="text-xs text-orange-400 ml-1 font-bold">(Ally)</span>}
      </div>
      <div className="md:col-span-1"><span className="font-semibold text-gray-400 md:hidden">Owned: </span>{owned}</div>
      <div className="md:col-span-2">
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            onBlur={handleBlur}
            min="1"
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-1 text-center focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            aria-label={`Quantity for ${itemName}`}
          />
          <div className="flex flex-col -space-y-px">
            <button onClick={() => adjustQuantity(1)} className="px-2 py-0.5 bg-gray-700 text-white font-bold rounded-t-md hover:bg-gray-600 text-xs transition-colors" aria-label="Increase quantity by 1">▲</button>
            <button onClick={() => adjustQuantity(-1)} className="px-2 py-0.5 bg-gray-700 text-white font-bold rounded-b-md hover:bg-gray-600 text-xs transition-colors" aria-label="Decrease quantity by 1">▼</button>
          </div>
        </div>
        <div className="flex gap-1 mt-1">
          <button onClick={() => adjustQuantity(10)} className="flex-1 text-xs bg-gray-700/80 hover:bg-gray-700 rounded py-0.5 transition-colors font-semibold" aria-label="Increase quantity by 10">+10</button>
          <button onClick={() => adjustQuantity(100)} className="flex-1 text-xs bg-gray-700/80 hover:bg-gray-700 rounded py-0.5 transition-colors font-semibold" aria-label="Increase quantity by 100">+100</button>
        </div>
      </div>
      <div className="md:col-span-2 flex gap-1">
        <button
          onClick={handleBuyClick}
          disabled={!canBuy}
          className="flex-grow bg-green-600 text-white font-bold py-2 px-2 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-green-500 transition-colors duration-200 text-sm"
        >
          Buy
        </button>
        <button
            onClick={() => setQuantity(maxBuy > 0 ? maxBuy : 1)}
            disabled={maxBuy <= 0}
            className="flex-shrink-0 bg-green-800 text-white font-bold py-2 px-2 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-green-700 transition-colors duration-200 text-xs"
            title={`Buy max: ${maxBuy.toLocaleString()}`}
        >
          Max
        </button>
      </div>
      <div className="md:col-span-2 flex gap-1">
        <button
          onClick={handleSellClick}
          disabled={!canSell}
          className="flex-grow bg-red-600 text-white font-bold py-2 px-2 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-red-500 transition-colors duration-200 text-sm"
        >
          Sell
        </button>
        <button
            onClick={() => setQuantity(owned > 0 ? owned : 1)}
            disabled={owned <= 0}
            className="flex-shrink-0 bg-red-800 text-white font-bold py-2 px-2 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-red-700 transition-colors duration-200 text-xs"
            title={`Sell max: ${owned.toLocaleString()}`}
        >
          Max
        </button>
      </div>
    </div>
  );
};


interface MarketProps {
  prices: Record<string, number>;
  playerInventory: Inventory;
  onBuy: (itemName: string, quantity: number, price: number) => void;
  onSell: (itemName: string, quantity: number, price: number) => void;
  playerCash: number;
  inventorySpaceLeft: number;
  playerAlliance: string | null;
  currentCity: string;
}

type SortKey = 'name' | 'price' | 'owned';
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const Market: React.FC<MarketProps> = ({ prices, playerInventory, onBuy, onSell, playerCash, inventorySpaceLeft, playerAlliance, currentCity }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });

  const sortedItems = useMemo(() => {
    const sortableItems: Item[] = [...ITEMS];
    sortableItems.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortConfig.key) {
        case 'price':
          aValue = prices[a.name] || 0;
          bValue = prices[b.name] || 0;
          break;
        case 'owned':
          aValue = playerInventory[a.name] || 0;
          bValue = playerInventory[b.name] || 0;
          break;
        case 'name':
        default:
          aValue = a.name;
          bValue = b.name;
          break;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [prices, playerInventory, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const SortableHeader: React.FC<{ title: string; sortKey: SortKey; className?: string }> = ({ title, sortKey, className }) => {
    const isActive = sortConfig.key === sortKey;
    const activeClass = isActive ? 'text-cyan-400' : '';
    return (
      <div className={className}>
        <button onClick={() => requestSort(sortKey)} className={`flex items-center hover:text-white transition-colors ${activeClass}`}>
          {title}
          {isActive && <SortIcon direction={sortConfig.direction} />}
        </button>
      </div>
    );
  };


  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 h-full">
      <h2 className="text-xl font-bold mb-4 border-b-2 border-cyan-500 pb-2">Local Market</h2>
      <div className="hidden md:grid md:grid-cols-12 gap-4 text-sm font-semibold text-gray-400 px-3 pb-2">
        <SortableHeader title="Item" sortKey="name" className="md:col-span-3" />
        <SortableHeader title="Price" sortKey="price" className="md:col-span-2" />
        <SortableHeader title="Owned" sortKey="owned" className="md:col-span-1" />
        <div className="md:col-span-2">Quantity</div>
        <div className="md:col-span-2 text-center">Buy</div>
        <div className="md:col-span-2 text-center">Sell</div>
      </div>
      <div className="space-y-2">
        {sortedItems.map(item => (
          <MarketItemRow
            key={item.name}
            itemName={item.name}
            price={prices[item.name] || 0}
            owned={playerInventory[item.name] || 0}
            onBuy={onBuy}
            onSell={onSell}
            playerCash={playerCash}
            inventorySpaceLeft={inventorySpaceLeft}
            playerAlliance={playerAlliance}
            currentCity={currentCity}
          />
        ))}
      </div>
    </div>
  );
};

export default Market;