import { Server } from 'socket.io';

let io = null;
const onlineUsers = new Map(); // userId -> socketId

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // In production, replace with specific frontend URL
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    
    if (userId && userId !== 'undefined') {
      onlineUsers.set(userId, socket.id);
      socket.join(`user:${userId}`);
      console.log(`User connected: ${userId} (Socket: ${socket.id})`);
      
      // Broadcast online status
      socket.broadcast.emit('presence_change', { userId, status: 'online' });
    }

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} left conversation: ${conversationId}`);
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, userId, userName }) => {
      socket.to(`conversation:${conversationId}`).emit('typing', { conversationId, userId, userName });
    });

    socket.on('stop_typing', ({ conversationId, userId }) => {
      socket.to(`conversation:${conversationId}`).emit('stop_typing', { conversationId, userId });
    });

    socket.on('disconnect', () => {
      if (userId && userId !== 'undefined') {
        onlineUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
        socket.broadcast.emit('presence_change', { userId, status: 'offline' });
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

/**
 * Emit real-time events to a specific user by their database User ID.
 */
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit real-time events to all members in a conversation room.
 */
export const emitToConversation = (conversationId, event, data) => {
  if (io) {
    io.to(`conversation:${conversationId}`).emit(event, data);
  }
};

/**
 * Helper to check if a user is currently online.
 */
export const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};
