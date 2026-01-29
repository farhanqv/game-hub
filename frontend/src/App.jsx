import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Games from './pages/Games'
import Puzzles from './pages/Puzzles'
import Arcade from './pages/Arcade'
import BoardGames from './pages/BoardGames'
import TestRoom from './pages/TestRoom'
import Checkers from './pages/Checkers'
import Sudoku from './pages/Sudoku'

function App() {
  useEffect(() => {
    document.title = 'Muhammad Farhan';
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/puzzles" element={<Puzzles />} />
        <Route path="/arcade" element={<Arcade />} />
        <Route path="/board-games" element={<BoardGames />} />
        <Route path="/test-room" element={<TestRoom />} />
        <Route path="/checkers" element={<Checkers />} />
        <Route path="/sudoku" element={<Sudoku />} />
      </Routes>
    </Router>
  )
}

export default App