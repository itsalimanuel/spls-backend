import { Socket } from 'socket.io';

class Bot {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }
  sendMessage(nickname: string, message: string, delay: number): void {
    setTimeout(() => {
      this.socket.emit(
        'chat-message',
        {
          nickname,
          message,
        },
        delay,
      );
    });
  }
}

export { Bot };
