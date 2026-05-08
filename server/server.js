require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const Room = require('./models/Room');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*', // For dev, allow all. In production, restrict to frontend URL
  methods: ['GET', 'POST']
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.io configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room
  socket.on('join_room', async ({ roomHash }) => {
    if (!roomHash) return;

    socket.join(roomHash);
    console.log(`User ${socket.id} joined room ${roomHash}`);

    try {
      // Find or create room
      let room = await Room.findOne({ roomHash });
      if (!room) {
        room = new Room({ roomHash });
        await room.save();
      } else {
        // Update lastActive
        room.lastActive = Date.now();
        await room.save();
      }

      // Fetch message history
      const messages = await Message.find({ roomHash }).sort({ timestamp: 1 });
      
      // Send history only to the user who just joined
      socket.emit('room_history', messages);
    } catch (err) {
      console.error('Error joining room:', err);
      socket.emit('error', 'Could not join room');
    }
  });

  // Handle incoming messages
  socket.on('send_message', async (data) => {
    const { roomHash, cipherText, senderId } = data;
    
    if (!roomHash || !cipherText || !senderId) return;

    try {
      // Save message to DB
      const newMessage = new Message({
        roomHash,
        cipherText,
        senderId,
        timestamp: Date.now()
      });
      await newMessage.save();

      // Update room lastActive
      await Room.updateOne({ roomHash }, { lastActive: Date.now() });

      // Broadcast message to everyone in the room
      io.to(roomHash).emit('receive_message', {
        _id: newMessage._id,
        roomHash: newMessage.roomHash,
        cipherText: newMessage.cipherText,
        senderId: newMessage.senderId,
        timestamp: newMessage.timestamp
      });
      
    } catch (err) {
      console.error('Error saving message:', err);
      socket.emit('error', 'Could not send message');
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SecureChat server running on port ${PORT}`);
});
