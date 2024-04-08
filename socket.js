const socketIo = require('socket.io');
const http = require('http');
const express = require('express');

const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

let userSockets = {};

const getReceiverSocketId = (receiverId) => {
  return userSockets[receiverId];
};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('add-user', (userId) => {
    userSockets[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  });

  socket.on('update-online', async (data) => {
    try {
      const user = await User.findById(data.userId);
      if (!user) throw new Error('User not found');

      user.online = data.online;
      const savedUser = await user.save();
      socket.broadcast.emit('update-online', savedUser);
    } catch (error) {
      console.error('Error toggling online status:', error);
      socket.emit('error', { message: 'Failed to update online status' });
    }
  });

  socket.on('disconnect', () => {
    const userId = Object.keys(userSockets).find(
      (key) => userSockets[key] === socket.id
    );
    if (userId) {
      delete userSockets[userId];
      console.log(`User ${userId} disconnected`);
    }
    console.log('Client disconnected:', socket.id);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

module.exports = { app, io, server, express, getReceiverSocketId };
