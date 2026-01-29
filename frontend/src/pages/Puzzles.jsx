import { Link } from 'react-router-dom'

function Puzzles() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-8">
          🧩 Puzzle Games
        </h1>
        <p className="text-center text-gray-400 mb-12">
          Challenge your mind with these brain teasers
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Sudoku - NOW ACTIVE! */}
          <Link to="/sudoku">
            <div className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg p-6 hover:from-purple-800 hover:to-purple-600 transition h-full">
              <div className="text-5xl mb-4">🔢</div>
              <h3 className="text-2xl font-bold mb-2">Sudoku</h3>
              <p className="text-purple-200 mb-4">Classic number puzzle game</p>
              <div className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded inline-block font-semibold">
                Play Now
              </div>
            </div>
          </Link>

          {/* Minesweeper - Coming Soon */}
          <div className="bg-gray-800 rounded-lg p-6 opacity-75">
            <div className="text-5xl mb-4">💣</div>
            <h3 className="text-2xl font-bold mb-2">Minesweeper</h3>
            <p className="text-gray-400 mb-4">Clear the minefield</p>
            <button 
              disabled 
              className="bg-gray-600 text-gray-400 px-6 py-2 rounded cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/games" className="text-blue-400 hover:text-blue-300">
            ← Back to Games
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Puzzles