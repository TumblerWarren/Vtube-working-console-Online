import React, { useState, useEffect } from 'react';

interface ModelConfig {
  pychaiApi?: string;
  characterKey?: string;
  ngrokUrl?: string;
}

interface ModelSelectionProps {
  selectedModel: string | null;
  onModelSelect: (model: string | null, config?: ModelConfig) => void;
  initialConfig?: ModelConfig;
  isEnabled: boolean;
}

export default function ModelSelection({ selectedModel, onModelSelect, initialConfig, isEnabled }: ModelSelectionProps) {
  const [pychaiApi, setPychaiApi] = useState(initialConfig?.pychaiApi || '');
  const [characterKey, setCharacterKey] = useState(initialConfig?.characterKey || '');
  const [ngrokUrl, setNgrokUrl] = useState(initialConfig?.ngrokUrl || '');

  useEffect(() => {
    setPychaiApi(initialConfig?.pychaiApi || '');
    setCharacterKey(initialConfig?.characterKey || '');
    setNgrokUrl(initialConfig?.ngrokUrl || '');
  }, [initialConfig]);

  const handleModelChange = (modelId: string | null) => {
    if (!isEnabled) return;

    if (modelId === selectedModel) {
      onModelSelect(null);
      return;
    }

    let config: ModelConfig = {};
    if (modelId === 'betacharacter') {
      config = { pychaiApi, characterKey };
    } else if (modelId === 'collab_llm') {
      config = { ngrokUrl };
    }
    onModelSelect(modelId, config);
  };

  const handleConfigChange = (field: keyof ModelConfig, value: string) => {
    if (!isEnabled) return;

    let config: ModelConfig = {};

    if (selectedModel === 'betacharacter') {
      if (field === 'pychaiApi') {
        setPychaiApi(value);
        config = { pychaiApi: value, characterKey };
      } else if (field === 'characterKey') {
        setCharacterKey(value);
        config = { pychaiApi, characterKey: value };
      }
    } else if (selectedModel === 'collab_llm') {
      if (field === 'ngrokUrl') {
        setNgrokUrl(value);
        config = { ngrokUrl: value };
      }
    }

    onModelSelect(selectedModel, config);
  };

  const models = [
    { id: 'collab_llm', name: 'Google Colab', description: 'Run models on Google Colab' },
    { id: 'local_llm', name: 'Local LLM', description: 'Run models locally on your machine' },
    { id: 'betacharacter', name: 'Beta Character', description: 'Use Beta Character API' },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 md:p-6 ${!isEnabled ? 'opacity-50' : ''}`}>
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Model Selection</h2>
      <div className="space-y-4 md:space-y-6">
        {models.map((model) => (
          <div key={model.id} className="space-y-4">
            <div className="p-3 md:p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div>
                  <h3 className="font-medium">{model.name}</h3>
                  <p className="text-sm text-gray-600">{model.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={selectedModel === model.id}
                    onChange={() => handleModelChange(model.id)}
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

            {selectedModel === 'betacharacter' && model.id === 'betacharacter' && (
              <div className="ml-0 sm:ml-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PyChai API Key
                  </label>
                  <input
                    type="text"
                    value={pychaiApi}
                    onChange={(e) => handleConfigChange('pychaiApi', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your PyChai API key"
                    disabled={!isEnabled}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Character Key
                  </label>
                  <input
                    type="text"
                    value={characterKey}
                    onChange={(e) => handleConfigChange('characterKey', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your Character key"
                    disabled={!isEnabled}
                  />
                </div>
              </div>
            )}

            {selectedModel === 'collab_llm' && model.id === 'collab_llm' && (
              <div className="ml-0 sm:ml-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngrok URL
                </label>
                <input
                  type="text"
                  value={ngrokUrl}
                  onChange={(e) => handleConfigChange('ngrokUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your Ngrok URL"
                  disabled={!isEnabled}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      {!isEnabled && (
        <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
          Please select an input method first to enable model selection
        </div>
      )}
    </div>
  );
}