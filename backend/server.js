import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleTestRoomEvents } from './controllers/testRoomController.js';
import { handleCheckersEvents } from './controllers/checkersController.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Game Hub Backend API is running!',
    version: '1.0.0',
    games: ['test-room', 'checkers', 'chess (coming soon)']
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Register game controllers
  handleTestRoomEvents(io, socket);
  handleCheckersEvents(io, socket);

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO ready for connections`);
  console.log(`📁 Game controllers loaded: Test Room, Checkers`);
});