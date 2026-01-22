import { generateRoomCode } from '../utils/roomCodeGenerator.js';

// Store active checkers rooms
const checkersRooms = new Map();

// Initial board setup
function createInitialBoard() {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place black pieces (top, rows 0-2)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'black', isKing: false };
      }
    }
  }
  
  // Place red pieces (bottom, rows 5-7)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'red', isKing: false };
      }
    }
  }
  
  return board;
}

export function handleCheckersEvents(io, socket) {
  // Create checkers room
  socket.on('create-checkers-room', (callback) => {
    let roomCode = generateRoomCode();
    
    while (checkersRooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    checkersRooms.set(roomCode, {
      players: [{ id: socket.id, color: 'red', ready: false }],
      spectators: [],
      board: createInitialBoard(),
      currentTurn: 'red',
      gameStarted: false,
      winner: null,
      mustCapture: null, // For forced multi-captures
      createdAt: Date.now()
    });

    socket.join(roomCode);
    console.log(`♟️  Checkers room created: ${roomCode} by ${socket.id}`);
    callback({ success: true, roomCode, color: 'red' });
  });

  // Join checkers room
  socket.on('join-checkers-room', (roomCode, callback) => {
    const room = checkersRooms.get(roomCode);
    
    if (!room) {
      return callback({ success: false, error: 'Room not found' });
    }

    socket.join(roomCode);

    if (room.players.length < 2) {
      // Join as black player
      room.players.push({ id: socket.id, color: 'black', ready: false });
      console.log(`👥 Black player joined checkers room: ${roomCode}`);
      
      io.to(roomCode).emit('checkers-room-update', {
        players: room.players.length,
        board: room.board,
        currentTurn: room.currentTurn,
        gameStarted: room.gameStarted
      });

      callback({ success: true, roomCode, color: 'black' });
    } else {
      // Join as spectator
      room.spectators.push(socket.id);
      console.log(`👁️  Spectator joined checkers room: ${roomCode}`);
      
      callback({ 
        success: true, 
        roomCode, 
        color: 'spectator',
        board: room.board,
        currentTurn: room.currentTurn,
        gameStarted: room.gameStarted
      });
    }
  });

  // Player ready
  socket.on('checkers-player-ready', (roomCode) => {
    const room = checkersRooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.ready = true;
      
      // Check if both players are ready
      if (room.players.length === 2 && room.players.every(p => p.ready)) {
        room.gameStarted = true;
        io.to(roomCode).emit('checkers-game-started', {
          board: room.board,
          currentTurn: room.currentTurn
        });
        console.log(`🎮 Checkers game started in room: ${roomCode}`);
      } else {
        io.to(roomCode).emit('checkers-player-ready-update', {
          redReady: room.players[0]?.ready || false,
          blackReady: room.players[1]?.ready || false
        });
      }
    }
  });

  // Make move
  socket.on('checkers-move', ({ roomCode, from, to }, callback) => {
    const room = checkersRooms.get(roomCode);
    if (!room || !room.gameStarted) {
      return callback({ success: false, error: 'Game not started' });
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
      return callback({ success: false, error: 'Not a player' });
    }

    if (player.color !== room.currentTurn) {
      return callback({ success: false, error: 'Not your turn' });
    }

    // Validate and execute move
    const result = executeMove(room, from, to, player.color);
    
    if (!result.valid) {
      return callback({ success: false, error: result.error });
    }

    // Update board
    room.board = result.board;

    // Check for multi-capture
    if (result.captured && result.canCaptureAgain) {
      room.mustCapture = to;
      io.to(roomCode).emit('checkers-state-update', {
        board: room.board,
        currentTurn: room.currentTurn,
        mustCapture: room.mustCapture,
        message: 'You must capture again!'
      });
    } else {
      // Switch turns
      room.currentTurn = room.currentTurn === 'red' ? 'black' : 'red';
      room.mustCapture = null;

      // Check for winner
      const winner = checkWinner(room.board, room.currentTurn);
      if (winner) {
        room.winner = winner;
        room.gameStarted = false;
        io.to(roomCode).emit('checkers-game-over', {
          winner: winner,
          board: room.board
        });
        console.log(`🏆 Checkers game over in room ${roomCode}, winner: ${winner}`);
      } else {
        io.to(roomCode).emit('checkers-state-update', {
          board: room.board,
          currentTurn: room.currentTurn,
          mustCapture: null
        });
      }
    }

    callback({ success: true });
  });

  // Disconnect
  // Player manually leaves room
  socket.on('leave-checkers-room', (roomCode) => {
    const room = checkersRooms.get(roomCode);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex > -1) {
      const playerColor = room.players[playerIndex].color;
      room.players.splice(playerIndex, 1);
      
      socket.leave(roomCode);
      
      if (room.players.length === 0) {
        checkersRooms.delete(roomCode);
        console.log(`🗑️  Checkers room deleted: ${roomCode}`);
      } else {
        // Notify remaining players
        io.to(roomCode).emit('checkers-player-left', { color: playerColor });
        console.log(`👋 ${playerColor} player left checkers room: ${roomCode}`);
      }
    }

    const spectatorIndex = room.spectators.indexOf(socket.id);
    if (spectatorIndex > -1) {
      room.spectators.splice(spectatorIndex, 1);
      socket.leave(roomCode);
    }
  });

  socket.on('disconnect', () => {
    checkersRooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex > -1) {
        const playerColor = room.players[playerIndex].color;
        room.players.splice(playerIndex, 1);
        
        if (room.players.length === 0) {
          checkersRooms.delete(roomCode);
          console.log(`🗑️  Checkers room deleted: ${roomCode}`);
        } else {
          io.to(roomCode).emit('checkers-player-left', { color: playerColor });
        }
      }

      const spectatorIndex = room.spectators.indexOf(socket.id);
      if (spectatorIndex > -1) {
        room.spectators.splice(spectatorIndex, 1);
      }
    });
  });
}

// Validate and execute move
function executeMove(room, from, to, playerColor) {
  const board = room.board.map(row => [...row]);
  const piece = board[from.row][from.col];

  if (!piece || piece.color !== playerColor) {
    return { valid: false, error: 'Invalid piece' };
  }

  // If must capture, validate it's the same piece
  if (room.mustCapture && (from.row !== room.mustCapture.row || from.col !== room.mustCapture.col)) {
    return { valid: false, error: 'Must continue capturing with the same piece' };
  }

  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;

  // Check if destination is empty
  if (board[to.row][to.col] !== null) {
    return { valid: false, error: 'Destination occupied' };
  }

  // Determine if it's a regular move or capture
  const isCapture = Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2;
  const isRegularMove = Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1;

  // Check direction (non-kings can only move forward)
  if (!piece.isKing) {
    if (playerColor === 'red' && rowDiff > 0) {
      return { valid: false, error: 'Red pieces can only move upward' };
    }
    if (playerColor === 'black' && rowDiff < 0) {
      return { valid: false, error: 'Black pieces can only move downward' };
    }
  }

  let captured = false;
  let canCaptureAgain = false;

  if (isCapture) {
    // Check if there's an opponent piece to capture
    const midRow = (from.row + to.row) / 2;
    const midCol = (from.col + to.col) / 2;
    const capturedPiece = board[midRow][midCol];

    if (!capturedPiece || capturedPiece.color === playerColor) {
      return { valid: false, error: 'No opponent piece to capture' };
    }

    // Remove captured piece
    board[midRow][midCol] = null;
    captured = true;

    // Move piece
    board[to.row][to.col] = { ...piece };
    board[from.row][from.col] = null;

    // Check for king promotion
    if ((playerColor === 'red' && to.row === 0) || (playerColor === 'black' && to.row === 7)) {
      board[to.row][to.col].isKing = true;
    }

    // Check if can capture again from new position
    canCaptureAgain = hasAvailableCaptures(board, to, playerColor);

  } else if (isRegularMove && !room.mustCapture) {
    // Regular move (only if no forced captures)
    board[to.row][to.col] = { ...piece };
    board[from.row][from.col] = null;

    // Check for king promotion
    if ((playerColor === 'red' && to.row === 0) || (playerColor === 'black' && to.row === 7)) {
      board[to.row][to.col].isKing = true;
    }
  } else {
    return { valid: false, error: 'Invalid move' };
  }

  return { 
    valid: true, 
    board, 
    captured,
    canCaptureAgain 
  };
}

// Check if a piece has available captures
function hasAvailableCaptures(board, position, playerColor) {
  const piece = board[position.row][position.col];
  if (!piece) return false;

  const directions = piece.isKing 
    ? [[-2, -2], [-2, 2], [2, -2], [2, 2]]
    : playerColor === 'red'
      ? [[-2, -2], [-2, 2]]
      : [[2, -2], [2, 2]];

  for (const [dRow, dCol] of directions) {
    const newRow = position.row + dRow;
    const newCol = position.col + dCol;
    const midRow = position.row + dRow / 2;
    const midCol = position.col + dCol / 2;

    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const midPiece = board[midRow][midCol];
      const destPiece = board[newRow][newCol];

      if (midPiece && midPiece.color !== playerColor && !destPiece) {
        return true;
      }
    }
  }

  return false;
}

// Check for winner
// Check for winner
function checkWinner(board, currentTurn) {
  let redCount = 0;
  let blackCount = 0;
  let redHasMoves = false;
  let blackHasMoves = false;

  // Count pieces and check for available moves
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        if (piece.color === 'red') {
          redCount++;
          if (!redHasMoves && hasAnyValidMoves(board, { row, col }, 'red')) {
            redHasMoves = true;
          }
        }
        if (piece.color === 'black') {
          blackCount++;
          if (!blackHasMoves && hasAnyValidMoves(board, { row, col }, 'black')) {
            blackHasMoves = true;
          }
        }
      }
    }
  }

  // Win conditions:
  // 1. All opponent pieces captured
  if (redCount === 0) return 'black';
  if (blackCount === 0) return 'red';

  // 2. Current player has no legal moves (loses)
  if (currentTurn === 'red' && !redHasMoves) return 'black';
  if (currentTurn === 'black' && !blackHasMoves) return 'red';

  return null;
}

// Check if a piece has any valid moves (regular or capture)
function hasAnyValidMoves(board, position, playerColor) {
  const piece = board[position.row][position.col];
  if (!piece || piece.color !== playerColor) return false;

  // Check regular moves
  const moveDirections = piece.isKing 
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : playerColor === 'red'
      ? [[-1, -1], [-1, 1]]
      : [[1, -1], [1, 1]];

  for (const [dRow, dCol] of moveDirections) {
    const newRow = position.row + dRow;
    const newCol = position.col + dCol;
    
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      if (!board[newRow][newCol]) {
        return true; // Has at least one regular move
      }
    }
  }

  // Check capture moves
  const captureDirections = piece.isKing
    ? [[-2, -2], [-2, 2], [2, -2], [2, 2]]
    : playerColor === 'red'
      ? [[-2, -2], [-2, 2]]
      : [[2, -2], [2, 2]];

  for (const [dRow, dCol] of captureDirections) {
    const newRow = position.row + dRow;
    const newCol = position.col + dCol;
    const midRow = position.row + dRow / 2;
    const midCol = position.col + dCol / 2;

    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const midPiece = board[midRow][midCol];
      const destPiece = board[newRow][newCol];

      if (midPiece && midPiece.color !== playerColor && !destPiece) {
        return true; // Has at least one capture move
      }
    }
  }

  return false;
}