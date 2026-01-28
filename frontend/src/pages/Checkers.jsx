import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

function Checkers() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [playerColor, setPlayerColor] = useState(null);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Game state
  const [board, setBoard] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTurn, setCurrentTurn] = useState('red');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [redReady, setRedReady] = useState(false);
  const [blackReady, setBlackReady] = useState(false);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');

  // Connect to Socket.IO
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('checkers-room-update', (data) => {
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
      setGameStarted(data.gameStarted);
    });

    socket.on('checkers-player-ready-update', (data) => {
      setRedReady(data.redReady);
      setBlackReady(data.blackReady);
    });

    socket.on('checkers-game-started', (data) => {
      setGameStarted(true);
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
      setMessage('Game started! Red goes first.');
      setTimeout(() => setMessage(''), 3000);
    });

    socket.on('checkers-state-update', (data) => {
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
      setSelectedSquare(null);
      setValidMoves([]);
      if (data.message) {
        setMessage(data.message);
        setTimeout(() => setMessage(''), 3000);
      }
    });

    socket.on('checkers-game-over', (data) => {
      setWinner(data.winner);
      setBoard(data.board);
      setGameStarted(false);
    });

    socket.on('checkers-player-left', () => {
      alert('Opponent left the game');
      leaveRoom();
    });

    return () => {
      socket.off('checkers-room-update');
      socket.off('checkers-player-ready-update');
      socket.off('checkers-game-started');
      socket.off('checkers-state-update');
      socket.off('checkers-game-over');
      socket.off('checkers-player-left');
    };
  }, [socket]);

  // Create room
  const createRoom = () => {
    if (!socket) return;
    
    socket.emit('create-checkers-room', (response) => {
      if (response.success) {
        setRoomCode(response.roomCode);
        setPlayerColor(response.color);
        setInRoom(true);
        setError('');
      } else {
        setError(response.error);
      }
    });
  };

  // Join room
  const joinRoom = () => {
    if (!socket || !joinCode) return;
    
    socket.emit('join-checkers-room', joinCode.toUpperCase(), (response) => {
      if (response.success) {
        setRoomCode(response.roomCode);
        setPlayerColor(response.color);
        setInRoom(true);
        setError('');
        if (response.board) setBoard(response.board);
        if (response.currentTurn) setCurrentTurn(response.currentTurn);
        if (response.gameStarted) setGameStarted(response.gameStarted);
      } else {
        setError(response.error);
      }
    });
  };

  // Leave room
  const leaveRoom = () => {
    // Emit leave event to notify other players
    if (socket && roomCode) {
      socket.emit('leave-checkers-room', roomCode);
    }

    setInRoom(false);
    setRoomCode('');
    setPlayerColor(null);
    setGameStarted(false);
    setBoard([]);
    setSelectedSquare(null);
    setValidMoves([]);
    setRedReady(false);
    setBlackReady(false);
    setWinner(null);
    setMessage('');
    setCopySuccess(false);
  };

  // Mark ready
  const markReady = () => {
    if (!socket || playerColor === 'spectator') return;
    socket.emit('checkers-player-ready', roomCode);
    if (playerColor === 'red') setRedReady(true);
    if (playerColor === 'black') setBlackReady(true);
  };

  // Copy room code
  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Paste code
  const pasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJoinCode(text.toUpperCase().slice(0, 6));
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  // Calculate valid moves for selected piece
  const calculateValidMoves = (row, col) => {
    const piece = board[row][col];
    if (!piece || piece.color !== playerColor || currentTurn !== playerColor) {
      return [];
    }

    const moves = [];
    const directions = piece.isKing 
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : piece.color === 'red'
        ? [[-1, -1], [-1, 1]]
        : [[1, -1], [1, 1]];

    // Check regular moves
    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (!board[newRow][newCol]) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }

    // Check captures
    const captureDirections = piece.isKing
      ? [[-2, -2], [-2, 2], [2, -2], [2, 2]]
      : piece.color === 'red'
        ? [[-2, -2], [-2, 2]]
        : [[2, -2], [2, 2]];

    for (const [dRow, dCol] of captureDirections) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      const midRow = row + dRow / 2;
      const midCol = col + dCol / 2;

      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const midPiece = board[midRow][midCol];
        const destPiece = board[newRow][newCol];

        if (midPiece && midPiece.color !== piece.color && !destPiece) {
          moves.push({ row: newRow, col: newCol, isCapture: true });
        }
      }
    }

    return moves;
  };

  // Handle square click
  const handleSquareClick = (row, col) => {
    if (!gameStarted || playerColor === 'spectator' || currentTurn !== playerColor) return;

    // If a square is already selected
    if (selectedSquare) {
      // Check if clicked square is a valid move
      const validMove = validMoves.find(m => m.row === row && m.col === col);
      
      if (validMove) {
        // Make the move
        socket.emit('checkers-move', {
          roomCode,
          from: selectedSquare,
          to: { row, col }
        }, (response) => {
          if (!response.success) {
            setMessage(response.error);
            setTimeout(() => setMessage(''), 3000);
          }
        });
      }
      
      // Deselect
      setSelectedSquare(null);
      setValidMoves([]);
    } else {
      // Select a piece
      const piece = board[row][col];
      if (piece && piece.color === playerColor) {
        setSelectedSquare({ row, col });
        setValidMoves(calculateValidMoves(row, col));
      }
    }
  };

  // Not in room - Show create/join UI
  if (!inRoom) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">
            🔴 Checkers
          </h1>
          
          {error && (
            <div className="max-w-md mx-auto mb-4 bg-red-600 text-white p-4 rounded">
              {error}
            </div>
          )}

          <div className="max-w-md mx-auto space-y-6">
            {/* Create Room */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Create Room</h2>
              <button
                onClick={createRoom}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded transition"
              >
                Create New Game
              </button>
            </div>

            {/* Join Room */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Join Room</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter room code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  maxLength={6}
                />
                <button
                  onClick={pasteCode}
                  className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded transition"
                  title="Paste from clipboard"
                >
                  📋
                </button>
              </div>
              <button
                onClick={joinRoom}
                disabled={!joinCode}
                className={`w-full font-bold py-3 px-6 rounded transition ${
                  joinCode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Join Game
              </button>
            </div>

            {/* Back button */}
            <div className="text-center">
              <button
                onClick={() => navigate('/board-games')}
                className="text-blue-400 hover:text-blue-300"
              >
                ← Back to Board Games
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // In room - Show game UI
  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Room: {roomCode}</h1>
              <button
                onClick={copyRoomCode}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded transition flex items-center gap-2"
              >
                {copySuccess ? (
                  <>
                    <span className="text-green-400">✓</span>
                    <span className="text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span className="text-sm">Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-gray-400">
              You are: <span className={`font-bold ${playerColor === 'red' ? 'text-red-400' : playerColor === 'black' ? 'text-gray-300' : 'text-blue-400'}`}>
                {playerColor === 'spectator' ? 'Spectator' : `${playerColor.charAt(0).toUpperCase() + playerColor.slice(1)} Player`}
              </span>
            </p>
          </div>
          <button
            onClick={leaveRoom}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded transition"
          >
            Leave Game
          </button>
        </div>

        {/* Message banner */}
        {message && (
          <div className="max-w-2xl mx-auto mb-4 bg-blue-600 text-white p-4 rounded text-center">
            {message}
          </div>
        )}

        {/* Waiting for players / Ready screen */}
        {!gameStarted && !winner && (
          <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Waiting for Players</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded">
                <span className="text-red-400 font-bold">Red Player</span>
                <span className={redReady ? 'text-green-400' : 'text-gray-400'}>
                  {redReady ? '✅ Ready' : '⏳ Waiting...'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded">
                <span className="text-gray-300 font-bold">Black Player</span>
                <span className={blackReady ? 'text-green-400' : 'text-gray-400'}>
                {blackReady ? '✅ Ready' : '⏳ Waiting...'}
                </span>
              </div>
            </div>
						{playerColor !== 'spectator' && (
						<button
							onClick={markReady}
							disabled={
								(playerColor === 'red' && redReady) ||
								(playerColor === 'black' && blackReady)
							}
							className={`w-full py-3 rounded font-bold transition ${
								(playerColor === 'red' && redReady) || (playerColor === 'black' && blackReady)
									? 'bg-gray-600 text-gray-400 cursor-not-allowed'
									: 'bg-green-600 hover:bg-green-700 text-white'
							}`}
						>
							{(playerColor === 'red' && redReady) || (playerColor === 'black' && blackReady)
								? '✅ READY'
								: 'CLICK READY'}
						</button>
					)}

					{playerColor === 'spectator' && (
						<p className="text-center text-gray-400">👁️ Spectating - Waiting for game to start...</p>
					)}
				</div>
			)}

			{/* Game board */}
			{(gameStarted || winner) && (
				<div className="max-w-4xl mx-auto">
					{/* Turn indicator */}
					<div className="text-center mb-4">
						<p className="text-2xl font-bold">
							Current Turn: <span className={currentTurn === 'red' ? 'text-red-400' : 'text-gray-300'}>
								{currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)}
							</span>
							{currentTurn === playerColor && !winner && ' (Your Turn!)'}
						</p>
					</div>

					{/* Checkerboard */}
					<div className="bg-gray-800 p-4 rounded-lg inline-block mx-auto">
						<div className="grid grid-cols-8 gap-0" style={{ width: '640px', height: '640px' }}>
							{board.map((row, rowIndex) =>
								row.map((piece, colIndex) => {
									const isLight = (rowIndex + colIndex) % 2 === 0;
									const isSelected = selectedSquare && selectedSquare.row === rowIndex && selectedSquare.col === colIndex;
									const isValidMove = validMoves.some(m => m.row === rowIndex && m.col === colIndex);
									
									return (
										<div
											key={`${rowIndex}-${colIndex}`}
											onClick={() => handleSquareClick(rowIndex, colIndex)}
											className={`
												w-20 h-20 flex items-center justify-center cursor-pointer transition
												${isLight ? 'bg-amber-100' : 'bg-amber-800'}
												${isSelected ? 'ring-4 ring-yellow-400' : ''}
												${isValidMove ? 'ring-4 ring-green-400' : ''}
												${!isLight && piece && currentTurn === playerColor && piece.color === playerColor ? 'hover:bg-amber-700' : ''}
											`}
										>
											{piece && (
												<div className={`
													w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold
													${piece.color === 'red' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}
													shadow-lg
												`}>
													{piece.isKing ? '♔' : '●'}
												</div>
											)}
										</div>
									);
								})
							)}
						</div>
					</div>

					{/* Legend */}
					<div className="mt-6 flex justify-center gap-8 text-sm">
						<div className="flex items-center gap-2">
							<div className="w-6 h-6 rounded-full bg-red-600"></div>
							<span>Red Pieces</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-6 h-6 rounded-full bg-gray-900"></div>
							<span>Black Pieces</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-2xl">♔</span>
							<span>King</span>
						</div>
					</div>
				</div>
			)}

			{/* Winner display */}
			{winner && (
				<div className="max-w-2xl mx-auto mt-8 bg-yellow-600 rounded-lg p-8 text-center">
					<h2 className="text-3xl font-bold mb-4">🏆 Game Over!</h2>
					<p className="text-2xl">
						{winner.charAt(0).toUpperCase() + winner.slice(1)} Player Wins!
					</p>
					{winner === playerColor && <p className="text-xl mt-2">Congratulations! 🎉</p>}
				</div>
			)}
		</div>
	</div>
	);
}
export default Checkers;
