import { Link } from 'react-router-dom'

function BoardGames() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-8">
          ♟️ Board Games
        </h1>
        <p className="text-center text-gray-400 mb-12">
          Strategic multiplayer board games
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Test Room */}
          <Link to="/test-room">
            <div className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg p-6 hover:from-purple-800 hover:to-purple-600 transition h-full">
              <div className="text-5xl mb-4">🧪</div>
              <h3 className="text-2xl font-bold mb-2">Test Room</h3>
              <p className="text-purple-200 mb-4">
                Practice Socket.IO connections
              </p>
              <div className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded inline-block font-semibold">
                Try Now
              </div>
            </div>
          </Link>

          {/* Checkers - NOW ACTIVE! */}
          <Link to="/checkers">
            <div className="bg-gradient-to-br from-red-900 to-red-700 rounded-lg p-6 hover:from-red-800 hover:to-red-600 transition h-full">
              <div className="text-5xl mb-4">🔴</div>
              <h3 className="text-2xl font-bold mb-2">Checkers</h3>
              <p className="text-red-200 mb-4">
                Classic board game with online multiplayer
              </p>
              <div className="bg-red-600 hover:bg-red-500 px-6 py-2 rounded inline-block font-semibold">
                Play Now
              </div>
            </div>
          </Link>

          {/* Chess - Coming Soon */}
          <div className="bg-gray-800 rounded-lg p-6 opacity-75">
            <div className="text-5xl mb-4">♔</div>
            <h3 className="text-2xl font-bold mb-2">Chess</h3>
            <p className="text-gray-400 mb-4">
              The ultimate strategy game
            </p>
            <button 
              disabled 
              className="bg-gray-600 text-gray-400 px-6 py-2 rounded cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link to="/games" className="text-blue-400 hover:text-blue-300 text-lg">
            ← Back to Games
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BoardGames