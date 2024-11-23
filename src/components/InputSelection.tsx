import React, { useState, useEffect } from 'react';

interface InputConfig {
  whisperModel?: string;
  whisperChoice?: string;
}

interface InputSelectionProps {
  selectedInput: string | null;
  onInputSelect: (input: string | null, config?: InputConfig) => void;
  initialConfig?: InputConfig;
}

export default function InputSelection({ selectedInput, onInputSelect, initialConfig }: InputSelectionProps) {
  const [whisperModel, setWhisperModel] = useState(initialConfig?.whisperModel || 'base');
  const [whisperChoice, setWhisperChoice] = useState(initialConfig?.whisperChoice || 'TRANSCRIBE');

  useEffect(() => {
    setWhisperModel(initialConfig?.whisperModel || 'base');
    setWhisperChoice(initialConfig?.whisperChoice || 'TRANSCRIBE');
  }, [initialConfig]);

  const handleInputChange = (inputType: string | null) => {
    if (inputType === selectedInput) {
      onInputSelect(null);
      return;
    }

    let config: InputConfig = {};
    if (inputType === 'Speech') {
      config = { whisperModel, whisperChoice };
    }
    onInputSelect(inputType, config);
  };

  const handleConfigChange = (field: keyof InputConfig, value: string) => {
    if (selectedInput === 'Speech') {
      if (field === 'whisperModel') {
        setWhisperModel(value);
        onInputSelect(selectedInput, { whisperModel: value, whisperChoice });
      } else if (field === 'whisperChoice') {
        setWhisperChoice(value);
        onInputSelect(selectedInput, { whisperModel, whisperChoice: value });
      }
    }
  };

  const inputs = [
    { id: 'Text', name: 'Text Input', description: 'Type your messages using keyboard' },
    { id: 'Speech', name: 'Speech Input', description: 'Use your voice to interact' },
  ];

  const whisperModels = [
    { id: 'tiny', name: 'Tiny', description: 'Fastest, lowest VRAM requirement' },
    { id: 'base', name: 'Base', description: 'Balanced performance' },
    { id: 'small', name: 'Small', description: 'Better accuracy, higher VRAM' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Input Selection</h2>
      <div className="space-y-4 md:space-y-6">
        {inputs.map((input) => (
          <div key={input.id} className="space-y-4">
            <div className="p-3 md:p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div>
                  <h3 className="font-medium">{input.name}</h3>
                  <p className="text-sm text-gray-600">{input.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={selectedInput === input.id}
                    onChange={() => handleInputChange(input.id)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4
                    peer-focus:ring-blue-300 rounded-full peer
                    peer-checked:bg-blue-600
                    peer-checked:after:translate-x-full peer-checked:after:border-white
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                    after:bg-white after:border-gray-300 after:border after:rounded-full
                    after:h-5 after:w-5 after:transition-all">
                  </div>
                </label>
              </div>
            </div>

            {selectedInput === 'Speech' && input.id === 'Speech' && (
              <div className="ml-0 sm:ml-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Whisper Model
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {whisperModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleConfigChange('whisperModel', model.id)}
                        className={`p-3 border rounded-lg text-left ${
                          whisperModel === model.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <h4 className="font-medium">{model.name}</h4>
                        <p className="text-sm text-gray-600">{model.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Whisper Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleConfigChange('whisperChoice', 'TRANSCRIBE')}
                      className={`p-3 border rounded-lg text-left ${
                        whisperChoice === 'TRANSCRIBE'
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <h4 className="font-medium">Transcribe</h4>
                      <p className="text-sm text-gray-600">Keep original language</p>
                    </button>
                    <button
                      onClick={() => handleConfigChange('whisperChoice', 'TRANSLATE')}
                      className={`p-3 border rounded-lg text-left ${
                        whisperChoice === 'TRANSLATE'
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <h4 className="font-medium">Translate</h4>
                      <p className="text-sm text-gray-600">Convert to English</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}