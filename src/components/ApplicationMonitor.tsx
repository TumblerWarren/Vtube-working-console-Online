import React, { useState, useEffect } from 'react';
import { Play, Square, Activity, FolderSearch } from 'lucide-react';
import { applicationService } from '../services/applicationService';

export default function ApplicationMonitor() {
  const [vtubeInstalled, setVtubeInstalled] = useState(false);
  const [voicevoxInstalled, setVoicevoxInstalled] = useState(false);
  const [vtubePath, setVtubePath] = useState('');
  const [voicevoxPath, setVoicevoxPath] = useState('');
  const [output, setOutput] = useState<string[]>([]);

  useEffect(() => {
    checkInstallations();
  }, []);

  const checkInstallations = () => {
    setVtubeInstalled(applicationService.checkInstallation('vtubeStudio'));
    setVoicevoxInstalled(applicationService.checkInstallation('voicevox'));
  };

  const handlePathUpdate = (app: 'vtubeStudio' | 'voicevox', path: string) => {
    applicationService.setCustomPath(app, path);
    if (app === 'vtubeStudio') {
      setVtubePath(path);
      setVtubeInstalled(applicationService.checkInstallation('vtubeStudio'));
    } else {
      setVoicevoxPath(path);
      setVoicevoxInstalled(applicationService.checkInstallation('voicevox'));
    }
  };

  const handleStart = (app: 'vtubeStudio' | 'voicevox') => {
    applicationService.startApplication(
      app,
      (data) => setOutput(prev => [...prev, `[${app}] ${data.trim()}`]),
      (error) => setOutput(prev => [...prev, `[${app}] Error: ${error.trim()}`])
    );
  };

  const handleStop = (app: 'vtubeStudio' | 'voicevox') => {
    applicationService.stopApplication(app);
    setOutput(prev => [...prev, `[${app}] Stopped application`]);
  };

  const ApplicationCard = ({
    title,
    app,
    isInstalled,
    path,
    onPathChange
  }: {
    title: string;
    app: 'vtubeStudio' | 'voicevox';
    isInstalled: boolean;
    path: string;
    onPathChange: (path: string) => void;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <Activity
            size={20}
            className={applicationService.isRunning(app) ? 'text-green-500 animate-pulse' : 'text-gray-400'}
          />
          <span className="text-sm font-medium">
            {applicationService.isRunning(app) ? 'Running' : 'Stopped'}
          </span>
        </div>
      </div>

      {!isInstalled && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Installation Path
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={path}
              onChange={(e) => onPathChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Enter ${title} path`}
            />
            <button
              onClick={() => checkInstallations()}
              className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
              title="Verify Installation"
            >
              <FolderSearch size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => handleStart(app)}
          disabled={!isInstalled || applicationService.isRunning(app)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm ${
            !isInstalled || applicationService.isRunning(app)
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <Play size={16} />
          Start
        </button>
        <button
          onClick={() => handleStop(app)}
          disabled={!applicationService.isRunning(app)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm ${
            !applicationService.isRunning(app)
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          <Square size={16} />
          Stop
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold">Application Monitor</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ApplicationCard
          title="VTube Studio"
          app="vtubeStudio"
          isInstalled={vtubeInstalled}
          path={vtubePath}
          onPathChange={(path) => handlePathUpdate('vtubeStudio', path)}
        />

        <ApplicationCard
          title="VOICEVOX"
          app="voicevox"
          isInstalled={voicevoxInstalled}
          path={voicevoxPath}
          onPathChange={(path) => handlePathUpdate('voicevox', path)}
        />
      </div>

      {output.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-3">Application Logs</h3>
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm h-48 overflow-y-auto">
            {output.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap py-1">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}