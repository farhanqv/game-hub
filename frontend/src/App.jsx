import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Puzzles from './pages/Puzzles'
import Arcades from './pages/Arcades'
import BoardGames from './pages/BoardGames'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/puzzles" element={<Puzzles />} />
        <Route path="/arcades" element={<Arcades />} />
        <Route path="/board-games" element={<BoardGames />} />
      </Routes>
    </Router>
  )
}

export default App