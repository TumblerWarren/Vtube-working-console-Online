import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Terminal from './components/Terminal';
import Controls from './components/Controls';
import ModelSelection from './components/ModelSelection';
import TTSSettings from './components/TTSSettings';
import InputSelection from './components/InputSelection';
import ApplicationMonitor from './components/ApplicationMonitor';
import { socketService } from './services/socketService';
import { envService } from './services/envService';
import { Menu } from 'lucide-react';

interface Config {
  input: string | null;
  model: string | null;
  tts: string | null;
  inputConfig?: {
    whisperModel?: string;
    whisperChoice?: string;
  };
  modelConfig?: {
    pychaiApi?: string;
    characterKey?: string;
    ngrokUrl?: string;
  };
  ttsConfig?: {
    elevenlabsKey?: string;
    voiceModel?: string;
    voiceId?: string;
  };
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([
    'Development environment initialized...',
    'Python virtual environment detected...',
    'Ready to execute program.',
  ]);
  const [currentPage, setCurrentPage] = useState('terminal');
  const [config, setConfig] = useState<Config>({
    input: null,
    model: null,
    tts: null,
    inputConfig: {},
    modelConfig: {},
    ttsConfig: {}
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const socket = socketService.connect();

    socketService.onOutput((data) => {
      setOutput(prev => [...prev, data.trim()]);
    });

    socketService.onError((data) => {
      setOutput(prev => [...prev, `Error: ${data.trim()}`]);
    });

    loadConfig();

    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      socketService.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const loadConfig = async () => {
    try {
      const envContent = await envService.readEnvFile();
      setConfig({
        input: envContent.INPUT_CHOICE || null,
        model: envContent.CHATBOT_SERVICE === 'none' ? null : envContent.CHATBOT_SERVICE,
        tts: envContent.TTS_CHOICE === 'none' ? null : envContent.TTS_CHOICE,
        inputConfig: {
          whisperModel: envContent.WHISPER_MODEL,
          whisperChoice: envContent.WHISPER_CHOICE
        },
        modelConfig: {
          pychaiApi: envContent.PYCHAI,
          characterKey: envContent.CHARECTER_KEY,
          ngrokUrl: envContent.ngrok_url
        },
        ttsConfig: {
          elevenlabsKey: envContent.ELEVENLAB_KEY,
          voiceModel: envContent.VOICE_MODEL,
          voiceId: envContent.VOICE_ID
        }
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  };

  const handleStart = () => {
    try {
      socketService.startScript();
      setIsRunning(true);
      setOutput(prev => [...prev, '> Starting Python script...']);
    } catch (error) {
      setOutput(prev => [...prev, `Error: Failed to start script - ${error}`]);
    }
  };

  const handleStop = () => {
    try {
      socketService.stopScript();
      setIsRunning(false);
      setOutput(prev => [...prev, '> Stopping Python script...']);
    } catch (error) {
      setOutput(prev => [...prev, `Error: Failed to stop script - ${error}`]);
    }
  };

  const handleInputSelect = (input: string | null, inputConfig = {}) => {
    setConfig(prev => ({
      ...prev,
      input,
      inputConfig,
      // Reset subsequent selections when input changes
      model: null,
      modelConfig: {},
      tts: null,
      ttsConfig: {}
    }));
    setHasUnsavedChanges(true);
  };

  const handleModelSelect = (model: string | null, modelConfig = {}) => {
    setConfig(prev => ({
      ...prev,
      model,
      modelConfig,
      // Reset TTS when model changes
      tts: null,
      ttsConfig: {}
    }));
    setHasUnsavedChanges(true);
  };

  const handleTTSSelect = (tts: string | null, ttsConfig = {}) => {
    setConfig(prev => ({ ...prev, tts, ttsConfig }));
    setHasUnsavedChanges(true);
  };

  const handleSaveConfig = async () => {
    try {
      const updates: any = {
        INPUT_CHOICE: config.input || 'Text',
        CHATBOT_SERVICE: config.model || 'none',
        TTS_CHOICE: config.tts || 'none',
      };

      if (config.input === 'Speech') {
        updates.WHISPER_MODEL = config.inputConfig?.whisperModel || 'base';
        updates.WHISPER_CHOICE = config.inputConfig?.whisperChoice || 'TRANSCRIBE';
      }

      if (config.model === 'betacharacter') {
        updates.PYCHAI = config.modelConfig?.pychaiApi || '';
        updates.CHARECTER_KEY = config.modelConfig?.characterKey || '';
      } else if (config.model === 'collab_llm') {
        updates.ngrok_url = config.modelConfig?.ngrokUrl || '';
      }

      if (config.tts === 'ELEVENLABS') {
        updates.ELEVENLAB_KEY = config.ttsConfig?.elevenlabsKey || '';
        updates.VOICE_MODEL = config.ttsConfig?.voiceModel || '';
      } else if (config.tts === 'VOICEVOX') {
        updates.VOICE_ID = config.ttsConfig?.voiceId || '';
      }

      await envService.updateEnv(updates);
      setHasUnsavedChanges(false);
      setOutput(prev => [...prev, '> Configuration saved successfully']);
    } catch (error) {
      setOutput(prev => [...prev, `Error: Failed to save configuration - ${error}`]);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'terminal':
        return (
          <>
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h1 className="text-xl md:text-2xl font-bold">Program Control Panel</h1>
                {hasUnsavedChanges && (
                  <button
                    onClick={handleSaveConfig}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base"
                  >
                    Save Configuration
                  </button>
                )}
              </div>
              <Controls
                isRunning={isRunning}
                onStart={handleStart}
                onStop={handleStop}
              />
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Program Output</h2>
              <Terminal output={output} />
            </div>
          </>
        );
      case 'monitor':
        return <ApplicationMonitor />;
      case 'input':
        return (
          <InputSelection
            selectedInput={config.input}
            onInputSelect={handleInputSelect}
            initialConfig={config.inputConfig}
          />
        );
      case 'model':
        return (
          <ModelSelection
            selectedModel={config.model}
            onModelSelect={handleModelSelect}
            initialConfig={config.modelConfig}
            isEnabled={!!config.input}
          />
        );
      case 'tts':
        return (
          <TTSSettings
            selectedModel={config.model}
            selectedTTS={config.tts}
            onTTSSelect={handleTTSSelect}
            initialConfig={config.ttsConfig}
            isEnabled={!!config.model}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex items-center justify-between">
        <span className="font-semibold">DevControl</span>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-700 rounded"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
        <Sidebar
          isOpen={isSidebarOpen}
          toggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavigate={setCurrentPage}
          hasUnsavedChanges={hasUnsavedChanges}
          config={config}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;