import React from 'react';
import type { Mission, PlayerState } from '../types';
import { MissionIcon } from './icons/MissionIcon';

interface MissionsProps {
  currentCity: string;
  missions: Mission[];
  player: PlayerState;
  onAcceptMission: (missionId: string) => void;
}

const Missions: React.FC<MissionsProps> = ({ currentCity, missions, player, onAcceptMission }) => {
  const availableMissions = missions.filter(m => 
    m.originCity === currentCity && 
    !player.completedMissionIds.includes(m.id) &&
    player.activeMissionId !== m.id
  );

  if (availableMissions.length === 0) {
    return null; // Don't render the component if there are no missions available in this city
  }

  const hasActiveMission = player.activeMissionId !== null;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4">
        <div className="flex items-center gap-3">
            <MissionIcon />
            <h2 className="text-xl font-bold mb-1">Local Contacts</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">Available Jobs</p>

        <div className="space-y-4">
            {availableMissions.map(mission => (
                <div key={mission.id} className="bg-gray-900/50 p-3 rounded-lg">
                    <h3 className="font-bold text-yellow-400">{mission.title}</h3>
                    <p className="text-sm text-gray-300 my-2 italic">"{mission.description}"</p>
                    <div className="text-xs space-y-1 my-2">
                        {mission.type === 'DELIVER' && mission.itemName && (
                            <p><span className="font-semibold text-gray-400">Objective:</span> Deliver {mission.quantity}x {mission.itemName} to {mission.destinationCity}</p>
                        )}
                        {mission.type === 'ACQUIRE_CASH' && (
                            <p><span className="font-semibold text-gray-400">Objective:</span> Accumulate ${mission.targetCash?.toLocaleString()}</p>
                        )}
                        <p><span className="font-semibold text-gray-400">Reward:</span> <span className="text-green-400">${mission.rewardCash.toLocaleString()}</span></p>
                    </div>
                    <button
                        onClick={() => onAcceptMission(mission.id)}
                        disabled={hasActiveMission}
                        className="w-full mt-2 bg-yellow-600 text-white font-bold py-2 px-2 rounded-md hover:bg-yellow-500 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                        title={hasActiveMission ? "Complete your active mission first" : "Accept job"}
                    >
                        Accept Job
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Missions;
