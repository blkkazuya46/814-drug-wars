import React from 'react';
import { ALLIANCES, ALLIANCE_DISCOUNT } from '../constants';
import { AllianceIcon } from './icons/AllianceIcon';
import { ItemIcon } from './icons/items/ItemIcon';
import { RivalIcon } from './icons/RivalIcon';
import { BenefitIcon } from './icons/BenefitIcon';
import { WarningIcon } from './icons/WarningIcon';

interface AlliancesProps {
  currentCity: string;
  playerAlliance: string | null;
  playerCash: number;
  onJoinAlliance: (allianceName: string) => void;
}

const Alliances: React.FC<AlliancesProps> = ({ currentCity, playerAlliance, playerCash, onJoinAlliance }) => {
  const localAlliance = ALLIANCES.find(a => a.homeCity === currentCity);
  const myAllianceDetails = playerAlliance ? ALLIANCES.find(a => a.name === playerAlliance) : null;
  const isRivalTerritory = !!(myAllianceDetails && localAlliance && myAllianceDetails.rival === localAlliance.name);

  if (!localAlliance) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4">
        <h2 className="text-xl font-bold mb-4 border-b-2 border-orange-500 pb-2">Factions</h2>
        <p className="text-gray-400 text-center italic py-4">No major factions operate in this city.</p>
      </div>
    );
  }

  const isMember = playerAlliance === localAlliance.name;
  const canAfford = playerCash >= localAlliance.joinFee;
  const rivalAlliance = ALLIANCES.find(a => a.name === localAlliance.rival);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4">
      {isRivalTerritory && (
        <div className="mb-4 p-3 rounded-lg border-2 border-red-500 bg-red-900/40 text-red-300 flex items-start gap-3">
          <WarningIcon />
          <div>
            <h3 className="font-bold">RIVAL TERRITORY</h3>
            <p className="text-xs opacity-90">You're on hostile ground. The local faction is your enemy. Expect trouble.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <AllianceIcon />
        <h2 className="text-xl font-bold mb-1">{localAlliance.name}</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">Local Faction</p>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg">
          <span className="font-semibold text-gray-400">Specialty:</span>
          <div className="flex items-center gap-2">
            <ItemIcon itemName={localAlliance.specialtyItem} />
            <span className="font-bold">{localAlliance.specialtyItem}</span>
          </div>
        </div>
        <div 
          className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg cursor-help"
          title={rivalAlliance ? `Based in: ${rivalAlliance.homeCity}` : 'Rival information unavailable'}
        >
            <span className="font-semibold text-gray-400">Rival:</span>
            <div className="flex items-center gap-2">
                <RivalIcon />
                <span className="font-bold text-red-500">{localAlliance.rival}</span>
            </div>
        </div>
        <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg">
          <span className="font-semibold text-gray-400">Join Fee:</span>
          <span className="font-bold text-green-400">${localAlliance.joinFee.toLocaleString()}</span>
        </div>

        <div className="pt-3 border-t border-gray-700/50 mt-4">
            <h3 className="font-semibold text-gray-400 text-sm mb-2">Membership Perks:</h3>
            <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0"><BenefitIcon type="positive" /></div>
                    <span><span className="font-bold text-green-400">{(1 - ALLIANCE_DISCOUNT) * 100}% discount</span> on {localAlliance.specialtyItem} in this city.</span>
                </li>
                <li className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0"><BenefitIcon type="positive" /></div>
                    <span><span className="font-bold text-green-400">Safer travel</span> when visiting allied turf.</span>
                </li>
                <li className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0"><BenefitIcon type="negative" /></div>
                    <span><span className="font-bold text-red-500">Increased risk</span> when traveling through {localAlliance.rival} territory.</span>
                </li>
            </ul>
        </div>


        <div className="pt-2">
          {isMember ? (
            <div className="w-full bg-green-800/50 text-green-300 font-bold py-3 px-2 rounded-md text-center">
              You are a member
            </div>
          ) : (
            <button
              onClick={() => onJoinAlliance(localAlliance.name)}
              disabled={!canAfford || isRivalTerritory}
              className="w-full bg-orange-600 text-white font-bold py-3 px-2 rounded-md hover:bg-orange-500 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-400"
            >
              {isRivalTerritory ? 'Cannot Join Rivals' : (playerAlliance ? 'Switch Allegiance' : 'Join Faction')} {!canAfford && !isRivalTerritory && `(Need $${localAlliance.joinFee.toLocaleString()})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alliances;
