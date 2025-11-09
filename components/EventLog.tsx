
import React from 'react';

interface EventLogProps {
  messages: string[];
}

const EventLog: React.FC<EventLogProps> = ({ messages }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 h-96 flex flex-col">
      <h2 className="text-xl font-bold mb-4 border-b-2 border-cyan-500 pb-2 flex-shrink-0">Log & News</h2>
      <div className="overflow-y-auto flex-grow pr-2">
        <ul className="space-y-2 text-sm">
          {messages.map((msg, index) => (
            <li key={index} className={`opacity-80 transition-all duration-300 ${msg.includes("NEWS:") ? "text-yellow-300 font-semibold border-l-2 border-yellow-400 pl-2" : ""}`}>
              {msg}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EventLog;
