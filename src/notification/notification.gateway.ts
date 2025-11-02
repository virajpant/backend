import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('NotificationGateway');
  private connectedUsers = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      this.logger.log(`User ${userId} connected`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        this.logger.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  notifyTaskAssigned(task: any, assignedUser: any) {
    const userId = assignedUser._id.toString();
    const socketId = this.connectedUsers.get(userId);

    if (socketId) {
      this.server.to(socketId).emit('task:assigned', {
        message: `You have been assigned a new task: "${task.title}"`,
        task,
        timestamp: new Date(),
      });
      this.logger.log(`Notification sent to user ${userId}`);
    } else {
      this.logger.warn(`User ${userId} is not connected, skipping notification`);
    }
  }
}
