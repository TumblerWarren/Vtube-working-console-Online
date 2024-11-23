import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { spawn } from 'child_process';
import { writeFile, readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

let pythonProcess = null;

// Add endpoint to update .env file
app.post('/api/update-env', async (req, res) => {
  try {
    const { content } = req.body;
    const envPath = join(projectRoot, '.env');
    await writeFile(envPath, content, 'utf-8');
    console.log('Updated .env file with:', content);
    res.status(200).json({ message: 'Environment file updated successfully' });
  } catch (error) {
    console.error('Error updating .env file:', error);
    res.status(500).json({ error: 'Failed to update environment file' });
  }
});

// Serve .env file content
app.get('/api/env', async (req, res) => {
  try {
    const envPath = join(projectRoot, '.env');
    const content = await readFile(envPath, 'utf-8');
    res.type('text/plain').send(content);
  } catch (error) {
    console.error('Error reading .env file:', error);
    res.status(404).send('Environment file not found');
  }
});

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.emit('process-status', !!pythonProcess);

  socket.on('start-script', () => {
    if (pythonProcess) return;

    const pythonPath = 'F:\\Projects\\Virtual_Avatar_ChatBot\\venv\\Scripts\\python.exe';
    const scriptPath = 'F:\\Projects\\Virtual_Avatar_ChatBot\\main.py';

    try {
      pythonProcess = spawn(pythonPath, [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        socket.emit('script-output', output);
      });

      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString();
        socket.emit('script-error', error);
      });

      pythonProcess.on('error', (error) => {
        socket.emit('script-error', `Process error: ${error.message}`);
        pythonProcess = null;
      });

      pythonProcess.on('close', (code) => {
        socket.emit('script-output', `Process exited with code ${code}`);
        socket.emit('process-exit');
        pythonProcess = null;
      });

      if (pythonProcess.stdin) {
        pythonProcess.stdin.setDefaultEncoding('utf-8');
      }

      socket.emit('script-output', 'Python interactive shell started. Type your commands...');
    } catch (error) {
      socket.emit('script-error', `Failed to start Python process: ${error.message}`);
      pythonProcess = null;
    }
  });

  socket.on('script-input', (input) => {
    if (pythonProcess?.stdin) {
      try {
        socket.emit('script-output', `>>> ${input}`);
        pythonProcess.stdin.write(input + '\n');
      } catch (error) {
        socket.emit('script-error', `Failed to send input: ${error.message}`);
      }
    }
  });

  socket.on('stop-script', () => {
    if (pythonProcess) {
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', pythonProcess.pid.toString(), '/f', '/t']);
        } else {
          pythonProcess.kill();
        }
        socket.emit('script-output', 'Process terminated by user');
        socket.emit('process-exit');
        pythonProcess = null;
      } catch (error) {
        socket.emit('script-error', `Failed to stop process: ${error.message}`);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

httpServer.listen(3000, () => {
  console.log('Server running on port 3000');
});