import React from 'react';
import type { Mission, PlayerState } from '../types';
import { MissionIcon } from './icons/MissionIcon';
import { ItemIcon } from './icons/items/ItemIcon';
import { CashIcon } from './icons/CashIcon';
import { LocationIcon } from './icons/LocationIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface ActiveMissionProps {
    activeMission: Mission | null;
    player: PlayerState;
    currentCity: string;
    onCompleteMission: () => void;
    onAbandonMission: () => void;
}


const ActiveMission: React.FC<ActiveMissionProps> = ({ activeMission, player, currentCity, onCompleteMission, onAbandonMission }) => {
    if (!activeMission) {
        return (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4">
                <div className="flex items-center gap-3">
                    <MissionIcon />
                    <h2 className="text-xl font-bold mb-1">Active Mission</h2>
                </div>
                <p className="text-sm text-gray-400 text-center italic py-4">No active mission. Check local contacts for jobs.</p>
            </div>
        );
    }
    
    let isObjectiveMet = false;
    let progressElement: React.ReactNode = null;

    if (activeMission.type === 'ACQUIRE_CASH' && activeMission.targetCash) {
        const target = activeMission.targetCash;
        const progress = Math.min(player.cash, target);
        isObjectiveMet = player.cash >= target;
        const percentage = (progress / target) * 100;
        
        progressElement = (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <CashIcon/>
                    <span className="font-semibold">Objective: Hold ${target.toLocaleString()}</span>
                     {isObjectiveMet && <CheckCircleIcon />}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                 <div className="text-xs text-right">${player.cash.toLocaleString()} / ${target.toLocaleString()}</div>
            </div>
        );
    }

    if (activeMission.type === 'DELIVER' && activeMission.itemName && activeMission.quantity && activeMission.destinationCity) {
        const hasItems = (player.inventory[activeMission.itemName] || 0) >= activeMission.quantity;
        const inCity = currentCity === activeMission.destinationCity;
        isObjectiveMet = hasItems && inCity;

        progressElement = (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <ItemIcon itemName={activeMission.itemName} />
                    <span className="font-semibold">Deliver: {activeMission.quantity}x {activeMission.itemName}</span>
                    {hasItems ? <CheckCircleIcon /> : <span className="text-xs text-red-400">({(player.inventory[activeMission.itemName] || 0)}/{activeMission.quantity})</span>}
                </div>
                <div className="flex items-center gap-2">
                    <LocationIcon />
                    <span className="font-semibold">Destination: {activeMission.destinationCity}</span>
                    {inCity ? <CheckCircleIcon /> : <span className="text-xs text-red-400">(Currently in {currentCity})</span>}
                </div>
            </div>
        );
    }


    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 border-2 border-yellow-500/50">
            <div className="flex items-center gap-3">
                <MissionIcon />
                <div>
                    <h2 className="text-xl font-bold -mb-1">{activeMission.title}</h2>
                    <p className="text-xs text-gray-400">Active Mission</p>
                </div>
            </div>

            <p className="text-sm text-gray-300 my-3 italic">"{activeMission.description}"</p>

            <div className="bg-gray-900/50 p-3 rounded-lg my-4">
                {progressElement}
            </div>

            <div className="mt-4 space-y-2">
                <button 
                    onClick={onCompleteMission}
                    disabled={!isObjectiveMet}
                    className="w-full bg-green-600 text-white font-bold py-3 px-2 rounded-md hover:bg-green-500 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Complete Mission (+${activeMission.rewardCash.toLocaleString()})
                </button>
                 <button 
                    onClick={onAbandonMission}
                    className="w-full bg-red-800 text-white font-bold py-2 px-2 rounded-md hover:bg-red-700 transition-colors duration-200 text-xs"
                >
                    Abandon Mission
                </button>
            </div>
        </div>
    );
};

export default ActiveMission;
