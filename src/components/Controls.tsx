import React from 'react';
import { Play, Square, Activity } from 'lucide-react';

interface ControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function Controls({ isRunning, onStart, onStop }: ControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <button
          onClick={onStart}
          disabled={isRunning}
          className={`flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-lg text-sm sm:text-base ${
            isRunning
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <Play size={20} />
          Execute Program
        </button>

        <button
          onClick={onStop}
          disabled={!isRunning}
          className={`flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-lg text-sm sm:text-base ${
            !isRunning
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          <Square size={20} />
          Stop Program
        </button>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-100">
        <Activity
          size={20}
          className={`${isRunning ? 'text-green-500 animate-pulse' : 'text-gray-400'}`}
        />
        <span className="font-medium text-sm sm:text-base">
          Status: {isRunning ? 'Program is running' : 'Program is stopped'}
        </span>
      </div>
    </div>
  );
}