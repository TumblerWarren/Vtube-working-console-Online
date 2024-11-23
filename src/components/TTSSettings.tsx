import React, { useState, useEffect } from 'react';

interface TTSConfig {
  elevenlabsKey?: string;
  voiceModel?: string;
  voiceId?: string;
}

interface TTSSettingsProps {
  selectedModel: string | null;
  selectedTTS: string | null;
  onTTSSelect: (tts: string | null, config?: TTSConfig) => void;
  initialConfig?: TTSConfig;
  isEnabled: boolean;
}

export default function TTSSettings({ selectedModel, selectedTTS, onTTSSelect, initialConfig, isEnabled }: TTSSettingsProps) {
  const [elevenlabsKey, setElevenlabsKey] = useState(initialConfig?.elevenlabsKey || '');
  const [voiceModel, setVoiceModel] = useState(initialConfig?.voiceModel || '');
  const [voiceId, setVoiceId] = useState(initialConfig?.voiceId || '');

  useEffect(() => {
    setElevenlabsKey(initialConfig?.elevenlabsKey || '');
    setVoiceModel(initialConfig?.voiceModel || '');
    setVoiceId(initialConfig?.voiceId || '');
  }, [initialConfig]);

  const handleTTSChange = (ttsId: string | null) => {
    if (!isEnabled) return;

    if (ttsId === selectedTTS) {
      onTTSSelect(null);
      return;
    }

    let config: TTSConfig = {};
    if (ttsId === 'ELEVENLABS') {
      config = { elevenlabsKey, voiceModel };
    } else if (ttsId === 'VOICEVOX') {
      config = { voiceId };
    }
    onTTSSelect(ttsId, config);
  };

  const handleConfigChange = (field: keyof TTSConfig, value: string) => {
    if (!isEnabled) return;

    let config: TTSConfig = {};

    if (selectedTTS === 'ELEVENLABS') {
      if (field === 'elevenlabsKey') {
        setElevenlabsKey(value);
        config = { elevenlabsKey: value, voiceModel };
      } else if (field === 'voiceModel') {
        setVoiceModel(value);
        config = { elevenlabsKey, voiceModel: value };
      }
    } else if (selectedTTS === 'VOICEVOX') {
      if (field === 'voiceId') {
        setVoiceId(value);
        config = { voiceId: value };
      }
    }

    onTTSSelect(selectedTTS, config);
  };

  const ttsOptions = [
    {
      id: 'ELEVENLABS',
      name: 'ElevenLabs',
      description: 'High-quality AI voice synthesis'
    },
    {
      id: 'VOICEVOX',
      name: 'VOICEVOX',
      description: 'Japanese voice synthesis (Japanese Only)'
    }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 md:p-6 ${!isEnabled ? 'opacity-50' : ''}`}>
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">TTS Settings</h2>
      <div className="space-y-4 md:space-y-6">
        {ttsOptions.map((tts) => (
          <div key={tts.id} className="space-y-4">
            <div className="p-3 md:p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div>
                  <h3 className="font-medium">{tts.name}</h3>
                  <p className="text-sm text-gray-600">{tts.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={selectedTTS === tts.id}
                    onChange={() => handleTTSChange(tts.id)}
                    disabled={!isEnabled}
                  />
                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4
                    peer-focus:ring-blue-300 rounded-full peer
                    peer-checked:bg-blue-600
                    peer-checked:after:translate-x-full peer-checked:after:border-white
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                    after:bg-white after:border-gray-300 after:border after:rounded-full
                    after:h-5 after:w-5 after:transition-all
                    ${!isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  </div>
                </label>
              </div>
            </div>

            {selectedTTS === 'ELEVENLABS' && tts.id === 'ELEVENLABS' && (
              <div className="ml-0 sm:ml-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ElevenLabs API Key
                  </label>
                  <input
                    type="text"
                    value={elevenlabsKey}
                    onChange={(e) => handleConfigChange('elevenlabsKey', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your ElevenLabs API key"
                    disabled={!isEnabled}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voice Model
                  </label>
                  <input
                    type="text"
                    value={voiceModel}
                    onChange={(e) => handleConfigChange('voiceModel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter voice model (e.g., Emmaline - young British girl)"
                    disabled={!isEnabled}
                  />
                </div>
              </div>
            )}

            {selectedTTS === 'VOICEVOX' && tts.id === 'VOICEVOX' && (
              <div className="ml-0 sm:ml-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice ID
                </label>
                <input
                  type="text"
                  value={voiceId}
                  onChange={(e) => handleConfigChange('voiceId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter voice ID (e.g., 2)"
                  disabled={!isEnabled}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      {!isEnabled && (
        <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
          Please select a model first to enable TTS settings
        </div>
      )}
    </div>
  );
}