// src/app/api/socket/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

const initSocket = (res: NextApiResponse) => {
    if (!(res.socket as any).server.io) {
      const httpServer = (res.socket as any).server as any;
      const io = new SocketIOServer(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
      });
      (res.socket as any).server.io = io;
    }
    return (res.socket as any).server.io;
  };

  
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const io = initSocket(res);

  io.on('connection', (socket : any) => {
    console.log('Client connected');

    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Joined room: ${roomId}`);
    });

    socket.on('send-message', (data : any) => {
      console.log('Message received:', data);
      io.to(data.roomId).emit('receive-message', {
        ...data,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  res.status(200).json({ message: 'Socket server is running' });
}