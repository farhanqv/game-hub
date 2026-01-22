import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import ScribbleCat from '../components/ScribbleCat/ScribbleCat';

function TestRoom() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [role, setRole] = useState(null);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Settings (Player 1 only)
  const [duration, setDuration] = useState(180);
  const [startingPlayer, setStartingPlayer] = useState('player1');

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [player2Ready, setPlayer2Ready] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [player1Time, setPlayer1Time] = useState(180);
  const [player2Time, setPlayer2Time] = useState(180);
  const [winner, setWinner] = useState(null);

  const timerInterval = useRef(null);

  // Connect to Socket.IO
// Connect to Socket.IO
  useEffect(() => {
    // Temporary: hardcode Railway URL for debugging
    const BACKEND_URL = 'https://game-hub-production-7736.up.railway.app';
    
    console.log('🔌 Connecting to backend:', BACKEND_URL);
    console.log('📦 Env variable:', import.meta.env.BACKEND_URL);
    
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('settings-updated', (settings) => {
      setDuration(settings.duration);
      setStartingPlayer(settings.startingPlayer);
      setPlayer1Time(settings.duration);
      setPlayer2Time(settings.duration);
    });

    socket.on('player2-ready', () => {
      setPlayer2Ready(true);
    });

    socket.on('game-started', (data) => {
      setGameStarted(true);
      setCurrentTurn(data.currentTurn);
      setPlayer1Time(data.player1Time);
      setPlayer2Time(data.player2Time);
    });

    socket.on('turn-ended', (data) => {
      setCurrentTurn(data.currentTurn);
      setPlayer1Time(data.player1Time);
      setPlayer2Time(data.player2Time);
    });

    socket.on('game-over', (data) => {
      setWinner(data.winner);
      setGameStarted(false);
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    });

    socket.on('player-left', () => {
      alert('A player left the room');
      leaveRoom();
    });

    return () => {
      socket.off('settings-updated');
      socket.off('player2-ready');
      socket.off('game-started');
      socket.off('turn-ended');
      socket.off('game-over');
      socket.off('player-left');
    };
  }, [socket]);

  // Timer countdown
  useEffect(() => {
    if (!gameStarted || !currentTurn) return;

    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }

    timerInterval.current = setInterval(() => {
      if (currentTurn === 'player1') {
        setPlayer1Time(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval.current);
            socket.emit('time-up', { roomCode, player: 'player1' });
            return 0;
          }
          return prev - 1;
        });
      } else {
        setPlayer2Time(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval.current);
            socket.emit('time-up', { roomCode, player: 'player2' });
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [gameStarted, currentTurn, socket, roomCode]);

  // Copy room code to clipboard
  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Paste from clipboard
  const pasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJoinCode(text.toUpperCase().slice(0, 6));
    } catch (err) {
      console.error('Failed to paste:', err);
      alert('Please allow clipboard access or paste manually');
    }
  };

  // Create room
  const createRoom = () => {
    if (!socket) return;
    
    socket.emit('create-room', (response) => {
      if (response.success) {
        setRoomCode(response.roomCode);
        setRole(response.role);
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
    
    socket.emit('join-room', joinCode.toUpperCase(), (response) => {
      if (response.success) {
        setRoomCode(response.roomCode);
        setRole(response.role);
        setInRoom(true);
        setError('');
      } else {
        setError(response.error);
      }
    });
  };

  // Leave room
  const leaveRoom = () => {
    // Emit leave event to notify other players
    if (socket && roomCode) {
      socket.emit('leave-test-room', roomCode);
    }

    setInRoom(false);
    setRoomCode('');
    setRole(null);
    setGameStarted(false);
    setPlayer2Ready(false);
    setWinner(null);
    setCopySuccess(false);
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
  };

  // Update settings (Player 1 only)
  const updateSettings = (newDuration, newStartingPlayer) => {
    if (role !== 'player1' || !socket) return;
    
    const settings = {
      duration: newDuration,
      startingPlayer: newStartingPlayer
    };
    
    socket.emit('update-settings', { roomCode, settings });
  };

  // Player 2 ready
  const markReady = () => {
    if (role !== 'player2' || !socket) return;
    socket.emit('player-ready', roomCode);
    setPlayer2Ready(true);
  };

  // Start game (Player 1 only)
  const startGame = () => {
    if (role !== 'player1' || !socket || !player2Ready) return;
    socket.emit('start-game', roomCode);
  };

  // End turn
  const endTurn = () => {
    if (!socket || role === 'spectator') return;
    
    const myTurn = (role === 'player1' && currentTurn === 'player1') || 
                   (role === 'player2' && currentTurn === 'player2');
    
    if (!myTurn) return;

    const timeLeft = currentTurn === 'player1' ? player1Time : player2Time;
    socket.emit('end-turn', { roomCode, timeLeft });
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Not in room - Show create/join UI
  if (!inRoom) {
    return (
      <div className="min-h-screen bg-gray-300 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">
            🧪 Test Room Connection
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition"
              >
                Create New Room
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
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Join Room
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
        <ScribbleCat />
      </div>
    );
  }

  // In room - Show game UI
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Room Code and Copy Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Room: {roomCode}</h1>
              <button
                onClick={copyRoomCode}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded transition flex items-center gap-2"
                title="Copy room code"
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
              You are: <span className="text-blue-400 capitalize">{role}</span>
            </p>
          </div>
          <button
            onClick={leaveRoom}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded transition"
          >
            Leave Room
          </button>
        </div>

        {/* Game Setup (before game starts) */}
        {!gameStarted && !winner && (
          <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Game Setup</h2>

            {/* Settings (Player 1 only) */}
            {role === 'player1' && (
              <>
                <div className="mb-6">
                  <label className="block text-gray-400 mb-2">Timer Duration:</label>
                  <div className="flex gap-4">
                    {[60, 180, 300].map((dur) => (
                      <button
                        key={dur}
                        onClick={() => {
                          setDuration(dur);
                          updateSettings(dur, startingPlayer);
                        }}
                        className={`px-6 py-2 rounded transition ${
                          duration === dur
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {dur / 60} min
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-400 mb-2">Starting Player:</label>
                  <div className="flex gap-4">
                    {['player1', 'player2', 'random'].map((sp) => (
                      <button
                        key={sp}
                        onClick={() => {
                          setStartingPlayer(sp);
                          updateSettings(duration, sp);
                        }}
                        className={`px-6 py-2 rounded capitalize transition ${
                          startingPlayer === sp
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {sp === 'player1' ? 'Player 1' : sp === 'player2' ? 'Player 2' : 'Random'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-400">
                    Player 2 Status: {player2Ready ? '✅ Ready' : '⏳ Waiting...'}
                  </p>
                </div>

                <button
                  onClick={startGame}
                  disabled={!player2Ready}
                  className={`w-full py-3 rounded font-bold transition ${
                    player2Ready
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  START GAME
                </button>
              </>
            )}

            {/* Player 2 - Ready button */}
            {role === 'player2' && (
              <>
                <div className="mb-6 space-y-2">
                  <p className="text-gray-400">Timer: {formatTime(duration)}</p>
                  <p className="text-gray-400 capitalize">
                    Starting Player: {startingPlayer === 'random' ? 'Random' : startingPlayer === 'player1' ? 'Player 1' : 'Player 2'}
                  </p>
                </div>

                <button
                  onClick={markReady}
                  disabled={player2Ready}
                  className={`w-full py-3 rounded font-bold transition ${
                    player2Ready
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {player2Ready ? '✅ READY' : 'CLICK READY'}
                </button>
              </>
            )}

            {/* Spectator */}
            {role === 'spectator' && (
              <p className="text-gray-400 text-center">
                👁️ Waiting for game to start...
              </p>
            )}
          </div>
        )}

        {/* Game Board (during game) */}
        {gameStarted && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Player 1 */}
            <div className={`bg-gray-800 rounded-lg p-6 transition ${
              currentTurn === 'player1' ? 'ring-4 ring-blue-500' : ''
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">
                  Player 1 {role === 'player1' && '(You)'}
                </h3>
                {currentTurn === 'player1' && <span className="text-blue-400">⬅ Current Turn</span>}
              </div>
              <div className="text-4xl font-mono mb-4">{formatTime(player1Time)}</div>
              <button
                onClick={endTurn}
                disabled={role !== 'player1' || currentTurn !== 'player1'}
                className={`w-full py-3 rounded font-bold transition ${
                  role === 'player1' && currentTurn === 'player1'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                END TURN
              </button>
            </div>

            {/* Player 2 */}
            <div className={`bg-gray-800 rounded-lg p-6 transition ${
              currentTurn === 'player2' ? 'ring-4 ring-green-500' : ''
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">
                  Player 2 {role === 'player2' && '(You)'}
                </h3>
                {currentTurn === 'player2' && <span className="text-green-400">⬅ Current Turn</span>}
              </div>
              <div className="text-4xl font-mono mb-4">{formatTime(player2Time)}</div>
              <button
                onClick={endTurn}
                disabled={role !== 'player2' || currentTurn !== 'player2'}
                className={`w-full py-3 rounded font-bold transition ${
                  role === 'player2' && currentTurn === 'player2'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                END TURN
              </button>
            </div>
          </div>
        )}

        {/* Winner Display */}
        {winner && (
          <div className="max-w-2xl mx-auto bg-yellow-600 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">🏆 Game Over!</h2>
            <p className="text-2xl">
              {winner === 'player1' ? 'Player 1' : 'Player 2'} Wins!
            </p>
            <p className="text-gray-200 mt-2">
              {winner === 'player1' ? 'Player 2' : 'Player 1'} ran out of time
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



export default TestRoom;
