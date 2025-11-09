import React from 'react';
import type { BustEvent } from '../types';
import { BustIcon } from './icons/BustIcon';

interface BustModalProps {
  isOpen: boolean;
  event: BustEvent | null;
  cashLost: number;
  itemsLost: Record<string, number>;
  onClose: () => void;
}

const BustModal: React.FC<BustModalProps> = ({ isOpen, event, cashLost, itemsLost, onClose }) => {
  if (!isOpen || !event) {
    return null;
  }

  const lostItemsEntries = Object.entries(itemsLost || {}).filter((entry): entry is [string, number] => typeof entry[1] === 'number' && entry[1] > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full text-center border-2 border-red-500">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-900 mb-4">
          <BustIcon />
        </div>
        <h2 className="text-3xl font-black text-red-400 mb-2 uppercase">Busted!</h2>
        <p className="text-lg text-gray-300 mb-4 italic">"{event.bustDescription}"</p>
        
        <div className="my-6 text-left bg-gray-900/50 p-4 rounded-lg space-y-3">
            <h3 className="text-md font-bold text-gray-400 border-b border-gray-700 pb-2">Penalties Applied:</h3>
            {cashLost > 0 && (
                <div className="flex justify-between items-center">
                    <span className="font-semibold">Cash Seized:</span>
                    <span className="font-bold text-red-400 text-xl">-${cashLost.toLocaleString()}</span>
                </div>
            )}
            {lostItemsEntries.length > 0 && (
                <div>
                    <span className="font-semibold">Inventory Confiscated:</span>
                    <ul className="text-sm mt-2 space-y-1 max-h-32 overflow-y-auto pr-2">
                        {lostItemsEntries.map(([name, qty]) => (
                            <li key={name} className="flex justify-between items-center bg-gray-800 p-1 rounded-md">
                                <span>{name}</span>
                                <span className="font-semibold">{qty.toLocaleString()} units</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-red-700 text-white font-bold py-3 px-4 rounded-md hover:bg-red-600 transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
        >
          Damn the Fuzz!
        </button>
      </div>
    </div>
  );
};

export default BustModal;