import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface ApplicationPaths {
  vtubeStudio: string;
  voicevox: string;
}

class ApplicationService {
  private vtubeProcess: ChildProcess | null = null;
  private voicevoxProcess: ChildProcess | null = null;
  private defaultPaths: ApplicationPaths = {
    vtubeStudio: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    voicevox: 'C:\\Program Files\\VOICEVOX\\VOICEVOX.exe'
  };

  checkInstallation(app: 'vtubeStudio' | 'voicevox'): boolean {
    return existsSync(this.defaultPaths[app]);
  }

  setCustomPath(app: 'vtubeStudio' | 'voicevox', path: string): void {
    this.defaultPaths[app] = path;
  }

  startApplication(
    app: 'vtubeStudio' | 'voicevox',
    onOutput: (data: string) => void,
    onError: (data: string) => void
  ): void {
    const process = app === 'vtubeStudio' ? this.vtubeProcess : this.voicevoxProcess;
    if (process) return;

    try {
      const newProcess = spawn(this.defaultPaths[app], [], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      if (app === 'vtubeStudio') {
        this.vtubeProcess = newProcess;
      } else {
        this.voicevoxProcess = newProcess;
      }

      newProcess.stdout?.on('data', (data) => {
        onOutput(data.toString());
      });

      newProcess.stderr?.on('data', (data) => {
        onError(data.toString());
      });

      newProcess.on('error', (error) => {
        onError(`Process error: ${error.message}`);
        if (app === 'vtubeStudio') {
          this.vtubeProcess = null;
        } else {
          this.voicevoxProcess = null;
        }
      });

      newProcess.on('close', (code) => {
        onOutput(`Process exited with code ${code}`);
        if (app === 'vtubeStudio') {
          this.vtubeProcess = null;
        } else {
          this.voicevoxProcess = null;
        }
      });
    } catch (error) {
      onError(`Failed to start ${app}: ${error}`);
    }
  }

  stopApplication(app: 'vtubeStudio' | 'voicevox'): void {
    const process = app === 'vtubeStudio' ? this.vtubeProcess : this.voicevoxProcess;

    if (process) {
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', process.pid.toString(), '/f', '/t']);
        } else {
          process.kill();
        }

        if (app === 'vtubeStudio') {
          this.vtubeProcess = null;
        } else {
          this.voicevoxProcess = null;
        }
      } catch (error) {
        console.error(`Failed to stop ${app}:`, error);
      }
    }
  }

  isRunning(app: 'vtubeStudio' | 'voicevox'): boolean {
    return app === 'vtubeStudio' ? this.vtubeProcess !== null : this.voicevoxProcess !== null;
  }
}

export const applicationService = new ApplicationService();