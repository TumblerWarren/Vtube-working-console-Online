import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Terminal, Bot, Volume2, Mic, Info } from 'lucide-react';

interface Config {
  input: string | null;
  model: string | null;
  tts: string | null;
}

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  onNavigate: (page: string) => void;
  hasUnsavedChanges: boolean;
  config: Config;
}

export default function Sidebar({ isOpen, toggle, onNavigate, hasUnsavedChanges, config }: SidebarProps) {
  const isModelEnabled = !!config.input;
  const isTTSEnabled = !!config.model;
  const [showModelTooltip, setShowModelTooltip] = useState(false);
  const [showTTSTooltip, setShowTTSTooltip] = useState(false);

  const handleInfoClick = (e: React.MouseEvent, tooltip: 'model' | 'tts') => {
    e.stopPropagation();
    if (tooltip === 'model') {
      setShowModelTooltip(!showModelTooltip);
      setShowTTSTooltip(false);
    } else {
      setShowTTSTooltip(!showTTSTooltip);
      setShowModelTooltip(false);
    }
  };

  return (
    <div className={`h-screen bg-gray-900 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <span className={`font-semibold ${!isOpen && 'hidden'}`}>DevControl</span>
        <button onClick={toggle} className="p-1 hover:bg-gray-700 rounded">
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="p-4 space-y-2">
        <div
          onClick={() => onNavigate('terminal')}
          className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer"
        >
          <Terminal size={20} />
          <span className={`${!isOpen && 'hidden'}`}>Terminal</span>
        </div>
        <div
          onClick={() => onNavigate('input')}
          className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer relative"
        >
          <Mic size={20} />
          <span className={`${!isOpen && 'hidden'}`}>Input Selection</span>
          {hasUnsavedChanges && (
            <span className="absolute right-2 top-2 w-2 h-2 bg-yellow-400 rounded-full"></span>
          )}
        </div>
        <div
          onClick={() => isModelEnabled && onNavigate('model')}
          className={`flex items-center gap-3 p-2 rounded cursor-pointer relative
            ${isModelEnabled ? 'hover:bg-gray-800' : 'opacity-50 cursor-not-allowed'}`}
        >
          <Bot size={20} />
          <span className={`${!isOpen && 'hidden'}`}>Model Selection</span>
          {!isModelEnabled && isOpen && (
            <button
              onClick={(e) => handleInfoClick(e, 'model')}
              className="absolute right-2 top-2 p-1 hover:bg-gray-700 rounded-full"
            >
              <Info size={16} />
            </button>
          )}
          {showModelTooltip && !isModelEnabled && (
            <div className="absolute left-full ml-2 top-0 z-50 w-48 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
              Please select an input method first to enable model selection
            </div>
          )}
          {hasUnsavedChanges && isModelEnabled && (
            <span className="absolute right-2 top-2 w-2 h-2 bg-yellow-400 rounded-full"></span>
          )}
        </div>
        <div
          onClick={() => isTTSEnabled && onNavigate('tts')}
          className={`flex items-center gap-3 p-2 rounded cursor-pointer relative
            ${isTTSEnabled ? 'hover:bg-gray-800' : 'opacity-50 cursor-not-allowed'}`}
        >
          <Volume2 size={20} />
          <span className={`${!isOpen && 'hidden'}`}>TTS Settings</span>
          {!isTTSEnabled && isOpen && (
            <button
              onClick={(e) => handleInfoClick(e, 'tts')}
              className="absolute right-2 top-2 p-1 hover:bg-gray-700 rounded-full"
            >
              <Info size={16} />
            </button>
          )}
          {showTTSTooltip && !isTTSEnabled && (
            <div className="absolute left-full ml-2 top-0 z-50 w-48 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
              Please select a model first to enable TTS settings
            </div>
          )}
          {hasUnsavedChanges && isTTSEnabled && (
            <span className="absolute right-2 top-2 w-2 h-2 bg-yellow-400 rounded-full"></span>
          )}
        </div>
      </div>
    </div>
  );
}