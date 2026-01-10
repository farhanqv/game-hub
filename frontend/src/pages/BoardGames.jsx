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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-2">Checkers</h3>
            <p className="text-gray-400 mb-4">Play online with room codes</p>
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded">
              Coming Soon
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-2">Chess</h3>
            <p className="text-gray-400 mb-4">Classic strategy game</p>
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded">
              Coming Soon
            </button>
          </div>
        </div>

        <div className="text-center mt-12">
            <Link to="/" className="text-blue-400 hover:text-blue-300">
                ← Back to Home
            </Link>
        </div>
      </div>
    </div>
  )
}

export default BoardGames