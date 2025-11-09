import React from 'react';
import { SpeedIcon } from './SpeedIcon';
import { WeedIcon } from './WeedIcon';
import { AcidIcon } from './AcidIcon';
import { HeroinIcon } from './HeroinIcon';
import { CokeIcon } from './CokeIcon';
import { MethIcon } from './MethIcon';
import { LSDIcon } from './LSDIcon';
import { MushroomsIcon } from './MushroomsIcon';
import { OpiumIcon } from './OpiumIcon';
import { EcstasyIcon } from './EcstasyIcon';
import { PCPIcon } from './PCPIcon';
import { FentanylIcon } from './FentanylIcon';

interface ItemIconProps {
  itemName: string;
}

const itemIconMap: Record<string, React.FC> = {
  'Speed': SpeedIcon,
  'Weed': WeedIcon,
  'Acid': AcidIcon,
  'Heroin': HeroinIcon,
  'Coke': CokeIcon,
  'Meth': MethIcon,
  'LSD': LSDIcon,
  'Mushrooms': MushroomsIcon,
  'Opium': OpiumIcon,
  'Ecstasy': EcstasyIcon,
  'PCP': PCPIcon,
  'Fentanyl': FentanylIcon,
};

export const ItemIcon: React.FC<ItemIconProps> = ({ itemName }) => {
  const IconComponent = itemIconMap[itemName];

  if (!IconComponent) {
    // Return a default placeholder icon if no match is found
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    );
  }

  // Define colors for each item
  const colorClasses: Record<string, string> = {
    'Speed': 'text-yellow-400',
    'Weed': 'text-green-400',
    'Acid': 'text-purple-400',
    'Heroin': 'text-red-500',
    'Coke': 'text-blue-300',
    'Meth': 'text-cyan-300',
    'Mushrooms': 'text-pink-400',
    'LSD': 'text-indigo-400',
    'Opium': 'text-gray-400',
    'Ecstasy': 'text-rose-400',
    'PCP': 'text-lime-400',
    'Fentanyl': 'text-slate-300',
  }

  const color = colorClasses[itemName] || 'text-gray-300';

  return (
    <div className={color}>
        <IconComponent />
    </div>
  );
};