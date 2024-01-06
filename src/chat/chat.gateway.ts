import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { WebSocketServer } from '@nestjs/websockets/decorators';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() wss: Server;

  private usersConnected = new Map<string, [string, string]>();

  @SubscribeMessage('user-nickname')
  handleUserNickname(
    @MessageBody() nickname: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const { id: socketId } = socket;
    this.usersConnected.set(nickname, [socketId, socket.id]);

    this.wss.emit('users-on', Array.from(this.usersConnected.keys()));

    this.wss.emit('user-data', [nickname, socketId]);

    this.botMessages(socket);
  }

  private botMessages(socket: Socket) {
    setTimeout(() => {
      socket.emit('chat-message', {
        nickname: 'CPU 1',
        msg: 'Hello there!',
      });
    }, 2000);

    setTimeout(() => {
      socket.emit('chat-message', {
        nickname: 'CPU 2',
        msg: 'Hey You!',
      });
    }, 5000);

    setTimeout(() => {
      socket.emit('chat-message', {
        nickname: 'CPU 1',
        msg: 'I could play this game for hours!',
      });
    }, 8000);
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(@MessageBody() data: { nickname: string; msg: string }) {
    this.wss.emit('chat-message', data);
  }

  handleDisconnect(socket: Socket) {
    const { id: socketId } = socket;
    let tempUserNickname;

    for (const [key, [clientId]] of this.usersConnected.entries()) {
      if (clientId === socketId) {
        tempUserNickname = key;
        this.usersConnected.delete(key);
        break;
      }
    }

    this.wss.emit('users-on', Array.from(this.usersConnected.keys()));

    socket.broadcast.emit('user-disconnected', tempUserNickname);

    console.log(`Client disconnected: ${socket.id}`);
  }

  async afterInit(server: Server) {
    try {
      const data = await this.chatService.findAll();
      server.emit('chat-messages', data);
    } catch (err) {
      console.error(err);
    }
  }

  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
  }
}
