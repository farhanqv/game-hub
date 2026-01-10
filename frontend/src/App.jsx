import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Puzzles from './pages/Puzzles'
import Arcade from './pages/Arcade'
import BoardGames from './pages/BoardGames'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/puzzles" element={<Puzzles />} />
        <Route path="/arcade" element={<Arcade />} />
        <Route path="/board-games" element={<BoardGames />} />
      </Routes>
    </Router>
  )
}

export default App