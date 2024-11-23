import { spawn, ChildProcess } from 'child_process';

class PythonService {
  private pythonProcess: ChildProcess | null = null;
  private pythonPath = 'F:\\Projects\\Virtual_Avatar_ChatBot\\venv\\Scripts\\python.exe';
  private scriptPath = 'F:\\Projects\\Virtual_Avatar_ChatBot\\main.py';

  startScript(onOutput: (data: string) => void, onError: (data: string) => void): void {
    if (this.pythonProcess) return;

    this.pythonProcess = spawn(this.pythonPath, [this.scriptPath]);

    this.pythonProcess.stdout?.on('data', (data) => {
      onOutput(data.toString());
    });

    this.pythonProcess.stderr?.on('data', (data) => {
      onError(data.toString());
    });

    this.pythonProcess.on('close', (code) => {
      onOutput(`Process exited with code ${code}`);
      this.pythonProcess = null;
    });
  }

  stopScript(): void {
    if (this.pythonProcess) {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', this.pythonProcess.pid.toString(), '/f', '/t']);
      } else {
        this.pythonProcess.kill();
      }
      this.pythonProcess = null;
    }
  }

  isRunning(): boolean {
    return this.pythonProcess !== null;
  }
}

export const pythonService = new PythonService();