import { Server } from 'socket.io';
import * as http from 'http';

export const setupSocket = (server: http.Server, tasksService: any) => {
  const io = new Server(server, {
    cors: { origin: 'http://localhost:3000', credentials: true },
  });

  const userSocketMap: { [userId: string]: string } = {};

  io.on('connection', (socket) => {
    socket.on('register', (userId: string) => {
      userSocketMap[userId] = socket.id;
    });

    socket.on('disconnect', () => {
      for (const id in userSocketMap) {
        if (userSocketMap[id] === socket.id) {
          delete userSocketMap[id];
          break;
        }
      }
    });
  });

  tasksService.setNotificationEmitter = (task: any, assignedUser: any) => {
    const socketId = userSocketMap[assignedUser._id.toString()];
    if (socketId) {
      io.to(socketId).emit('taskAssigned', {
        _id: Date.now().toString(),
        message: `New task: "${task.title}"`,
        title: task.title,
        assignedBy: task.createdBy?.name || task.createdBy?.email,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }
  };

  return io;
};