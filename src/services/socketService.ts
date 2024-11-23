import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:3000');
    }
    return this.socket;
  }

  startScript() {
    this.socket?.emit('start-script');
  }

  stopScript() {
    this.socket?.emit('stop-script');
  }

  sendInput(input: string) {
    this.socket?.emit('script-input', input);
  }

  onOutput(callback: (data: string) => void) {
    this.socket?.on('script-output', callback);
  }

  onError(callback: (data: string) => void) {
    this.socket?.on('script-error', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();