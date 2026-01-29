import { Link } from 'react-router-dom'

function Games() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-6xl font-bold text-center mb-4">
          🎮 Games
        </h1>
        <p className="text-xl text-center text-gray-400 mb-16">
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Puzzles Card */}
          <Link to="/puzzles">
            <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-700 transition cursor-pointer h-full">
              <div className="text-6xl mb-4 text-center">🧩</div>
              <h2 className="text-2xl font-bold text-center mb-2">Puzzles</h2>
              <p className="text-gray-400 text-center">
                Sudoku, Minesweeper & more
              </p>
            </div>
          </Link>

          {/* Arcade Card */}
          <Link to="/arcade">
            <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-700 transition cursor-pointer h-full">
              <div className="text-6xl mb-4 text-center">🕹️</div>
              <h2 className="text-2xl font-bold text-center mb-2">Arcade</h2>
              <p className="text-gray-400 text-center">
                Flappy Bird, Tetris, Pong & more
              </p>
            </div>
          </Link>

          {/* Board Games Card */}
          <Link to="/board-games">
            <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-700 transition cursor-pointer h-full">
              <div className="text-6xl mb-4 text-center">♟️</div>
              <h2 className="text-2xl font-bold text-center mb-2">Board Games</h2>
              <p className="text-gray-400 text-center">
                Checkers, Chess & more
              </p>
            </div>
          </Link>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-12">
          <Link to="/" className="text-blue-400 hover:text-blue-300 text-lg">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Games