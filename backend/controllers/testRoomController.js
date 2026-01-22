import { generateRoomCode } from '../utils/roomCodeGenerator.js';

// Store active test rooms
const testRooms = new Map();

export function handleTestRoomEvents(io, socket) {
  // Create room
  socket.on('create-room', (callback) => {
    let roomCode = generateRoomCode();
    
    // Ensure unique code
    while (testRooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    testRooms.set(roomCode, {
      players: [{ id: socket.id, ready: false }],
      spectators: [],
      settings: {
        duration: 180, // Default 3 minutes (in seconds)
        startingPlayer: 'player1'
      },
      gameState: {
        started: false,
        currentTurn: null,
        player1Time: 180,
        player2Time: 180,
        winner: null
      },
      createdAt: Date.now()
    });

    socket.join(roomCode);
    console.log(`🎮 Test room created: ${roomCode} by ${socket.id}`);
    callback({ success: true, roomCode, role: 'player1' });
  });

  // Join room
  socket.on('join-room', (roomCode, callback) => {
    const room = testRooms.get(roomCode);
    
    if (!room) {
      return callback({ success: false, error: 'Room not found' });
    }

    socket.join(roomCode);

    if (room.players.length < 2) {
      room.players.push({ id: socket.id, ready: false });
      console.log(`👥 Player 2 joined test room: ${roomCode}`);
      
      io.to(roomCode).emit('room-update', {
        players: room.players.length,
        settings: room.settings,
        gameState: room.gameState
      });

      callback({ success: true, roomCode, role: 'player2' });
    } else {
      room.spectators.push(socket.id);
      console.log(`👁️  Spectator joined test room: ${roomCode}`);
      
      io.to(roomCode).emit('room-update', {
        players: room.players.length,
        spectators: room.spectators.length,
        settings: room.settings,
        gameState: room.gameState
      });

      callback({ success: true, roomCode, role: 'spectator' });
    }
  });

  // Update settings (Player 1 only)
  socket.on('update-settings', ({ roomCode, settings }) => {
    const room = testRooms.get(roomCode);
    if (room && room.players[0].id === socket.id) {
      room.settings = settings;
      room.gameState.player1Time = settings.duration;
      room.gameState.player2Time = settings.duration;
      
      io.to(roomCode).emit('settings-updated', settings);
      console.log(`⚙️  Settings updated in test room ${roomCode}:`, settings);
    }
  });

  // Player ready (Player 2 only)
  socket.on('player-ready', (roomCode) => {
    const room = testRooms.get(roomCode);
    if (room && room.players.length === 2 && room.players[1].id === socket.id) {
      room.players[1].ready = true;
      io.to(roomCode).emit('player2-ready');
      console.log(`✅ Player 2 ready in test room: ${roomCode}`);
    }
  });

  // Start game (Player 1 only)
  socket.on('start-game', (roomCode) => {
    const room = testRooms.get(roomCode);
    if (room && room.players[0].id === socket.id && room.players.length === 2 && room.players[1].ready) {
      let startingPlayer = room.settings.startingPlayer;
      if (startingPlayer === 'random') {
        startingPlayer = Math.random() < 0.5 ? 'player1' : 'player2';
      }

      room.gameState.started = true;
      room.gameState.currentTurn = startingPlayer;
      room.gameState.player1Time = room.settings.duration;
      room.gameState.player2Time = room.settings.duration;

      io.to(roomCode).emit('game-started', {
        currentTurn: startingPlayer,
        player1Time: room.settings.duration,
        player2Time: room.settings.duration
      });

      console.log(`🎮 Test game started in room ${roomCode}, starting player: ${startingPlayer}`);
    }
  });

  // End turn
  socket.on('end-turn', ({ roomCode, timeLeft }) => {
    const room = testRooms.get(roomCode);
    if (!room || !room.gameState.started) return;

    const currentTurn = room.gameState.currentTurn;
    const isPlayer1 = room.players[0].id === socket.id;
    const isPlayer2 = room.players.length > 1 && room.players[1].id === socket.id;

    if ((currentTurn === 'player1' && isPlayer1) || (currentTurn === 'player2' && isPlayer2)) {
      if (currentTurn === 'player1') {
        room.gameState.player1Time = timeLeft;
        room.gameState.currentTurn = 'player2';
      } else {
        room.gameState.player2Time = timeLeft;
        room.gameState.currentTurn = 'player1';
      }

      io.to(roomCode).emit('turn-ended', {
        currentTurn: room.gameState.currentTurn,
        player1Time: room.gameState.player1Time,
        player2Time: room.gameState.player2Time
      });

      console.log(`🔄 Turn ended in test room ${roomCode}, now: ${room.gameState.currentTurn}`);
    }
  });

  // Time ran out
  socket.on('time-up', ({ roomCode, player }) => {
    const room = testRooms.get(roomCode);
    if (!room || !room.gameState.started) return;

    const winner = player === 'player1' ? 'player2' : 'player1';
    room.gameState.winner = winner;
    room.gameState.started = false;

    io.to(roomCode).emit('game-over', {
      winner: winner,
      reason: `${player === 'player1' ? 'Player 1' : 'Player 2'} ran out of time!`
    });

    console.log(`⏰ Test game over in room ${roomCode}, winner: ${winner}`);
  });

  // Disconnect - cleanup test rooms
  // Player manually leaves room
  socket.on('leave-test-room', (roomCode) => {
    const room = testRooms.get(roomCode);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex > -1) {
      room.players.splice(playerIndex, 1);
      
      socket.leave(roomCode);
      
      if (room.players.length === 0) {
        testRooms.delete(roomCode);
        console.log(`🗑️  Test room deleted: ${roomCode}`);
      } else {
        // Notify remaining players
        io.to(roomCode).emit('player-left', { playerNumber: playerIndex + 1 });
        console.log(`👋 Player ${playerIndex + 1} left test room: ${roomCode}`);
      }
    }

    const spectatorIndex = room.spectators.indexOf(socket.id);
    if (spectatorIndex > -1) {
      room.spectators.splice(spectatorIndex, 1);
      socket.leave(roomCode);
    }
  });

  socket.on('disconnect', () => {
    testRooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex > -1) {
        room.players.splice(playerIndex, 1);
        
        if (room.players.length === 0) {
          testRooms.delete(roomCode);
          console.log(`🗑️  Test room deleted: ${roomCode}`);
        } else {
          io.to(roomCode).emit('player-left', { playerNumber: playerIndex + 1 });
        }
      }

      const spectatorIndex = room.spectators.indexOf(socket.id);
      if (spectatorIndex > -1) {
        room.spectators.splice(spectatorIndex, 1);
        io.to(roomCode).emit('spectator-left');
      }
    });
  });
}