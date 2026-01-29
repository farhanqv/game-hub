import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Sudoku() {
  const navigate = useNavigate();
  const [grid, setGrid] = useState([]);
  const [initialGrid, setInitialGrid] = useState([]); // To know which cells are pre-filled
  const [selectedCell, setSelectedCell] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Timer
  useEffect(() => {
    let interval;
    if (isRunning && !isComplete) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isComplete]);

  // Generate new game on mount or difficulty change
  useEffect(() => {
    generateNewGame();
  }, [difficulty]);

  // Generate a new Sudoku puzzle
  const generateNewGame = () => {
    const { puzzle, solution } = generateSudoku(difficulty);
    setGrid(puzzle.map(row => [...row]));
    setInitialGrid(puzzle.map(row => [...row]));
    setSelectedCell(null);
    setMistakes(0);
    setIsComplete(false);
    setTimer(0);
    setIsRunning(true);
  };

  // Handle cell click
  const handleCellClick = (row, col) => {
    // Can't select pre-filled cells
    if (initialGrid[row][col] !== 0) return;
    setSelectedCell({ row, col });
  };

  // Handle number input
  const handleNumberInput = (num) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    // Can't change pre-filled cells
    if (initialGrid[row][col] !== 0) return;

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = num;
    setGrid(newGrid);

    // Check if complete and correct
    if (isGridFilled(newGrid)) {
      if (isValidSolution(newGrid)) {
        setIsComplete(true);
        setIsRunning(false);
      } else {
        setMistakes(prev => prev + 1);
      }
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedCell) return;
      
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        handleNumberInput(num);
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleNumberInput(0);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedCell, grid]);

  // Format timer (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🧩 Sudoku</h1>
          <button
            onClick={() => navigate('/puzzles')}
            className="text-blue-400 hover:text-blue-300"
          >
            ← Back to Puzzles
          </button>
        </div>

        {/* Game Info */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
            <div>
              <span className="text-gray-400">Time: </span>
              <span className="text-2xl font-mono">{formatTime(timer)}</span>
            </div>
            <div>
              <span className="text-gray-400">Mistakes: </span>
              <span className="text-2xl font-bold text-red-400">{mistakes}</span>
            </div>
            <div>
              <span className="text-gray-400">Difficulty: </span>
              <span className="text-lg font-bold capitalize">{difficulty}</span>
            </div>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex gap-4 justify-center">
            {['easy', 'medium', 'hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-6 py-2 rounded capitalize transition ${
                  difficulty === diff
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Sudoku Grid */}
        <div className="max-w-2xl mx-auto mb-6 flex justify-center">
          <div className="bg-gray-600 p-2 rounded-lg inline-block">
            {/* Create 3x3 grid of boxes */}
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((boxRow) => (
                [0, 1, 2].map((boxCol) => (
                  <div 
                    key={`box-${boxRow}-${boxCol}`}
                    className="bg-gray-700 p-1"
                  >
                    {/* Each 3x3 box */}
                    <div className="grid grid-cols-3 gap-0">
                      {[0, 1, 2].map((cellRow) => (
                        [0, 1, 2].map((cellCol) => {
                          const rowIndex = boxRow * 3 + cellRow;
                          const colIndex = boxCol * 3 + cellCol;
                          const cell = grid[rowIndex]?.[colIndex];
                          const isPreFilled = initialGrid[rowIndex]?.[colIndex] !== 0;
                          const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                          const isInSameRow = selectedCell?.row === rowIndex;
                          const isInSameCol = selectedCell?.col === colIndex;
                          const isInSameBox = selectedCell && 
                            Math.floor(selectedCell.row / 3) === boxRow &&
                            Math.floor(selectedCell.col / 3) === boxCol;

                          return (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              onClick={() => handleCellClick(rowIndex, colIndex)}
                              className={`
                                w-14 h-14 flex items-center justify-center text-2xl font-bold cursor-pointer
                                transition-all duration-150 border border-gray-600
                                ${isPreFilled 
                                  ? 'bg-gray-800 text-blue-300' 
                                  : 'bg-gray-900 text-white hover:bg-gray-800'
                                }
                                ${isSelected ? 'bg-blue-600 ring-2 ring-blue-400 scale-105 shadow-lg' : ''}
                                ${!isSelected && (isInSameRow || isInSameCol || isInSameBox) 
                                  ? 'bg-gray-750' 
                                  : ''
                                }
                              `}
                            >
                              {cell !== 0 ? cell : ''}
                            </div>
                          );
                        })
                      ))}
                    </div>
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>

        {/* Number Pad */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="grid grid-cols-10 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold text-2xl py-4 rounded transition"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleNumberInput(0)}
              className="bg-red-700 hover:bg-red-600 text-white font-bold text-xl py-4 rounded transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="max-w-2xl mx-auto flex gap-4 justify-center">
          <button
            onClick={generateNewGame}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded transition"
          >
            New Game
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded transition"
          >
            {isRunning ? 'Pause' : 'Resume'}
          </button>
        </div>

        {/* Win Message */}
        {isComplete && (
          <div className="max-w-2xl mx-auto mt-6 bg-green-600 rounded-lg p-6 text-center animate-bounce">
            <h2 className="text-3xl font-bold mb-2">🎉 Congratulations!</h2>
            <p className="text-xl">
              You solved the puzzle in {formatTime(timer)} with {mistakes} mistakes!
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="max-w-2xl mx-auto mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-3">How to Play:</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Click a cell to select it</li>
            <li>• Type a number (1-9) or click number pad</li>
            <li>• Press Backspace/Delete to clear a cell</li>
            <li>• Fill all cells with numbers 1-9</li>
            <li>• Each row, column, and 3x3 box must contain 1-9 exactly once</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUDOKU GENERATION LOGIC
// ============================================

// Generate a complete valid Sudoku grid
function generateCompleteGrid() {
  const grid = Array(9).fill(null).map(() => Array(9).fill(0));
  fillGrid(grid);
  return grid;
}

// Fill grid recursively with backtracking
function fillGrid(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (const num of numbers) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            
            if (fillGrid(grid)) {
              return true;
            }
            
            grid[row][col] = 0;
          }
        }
        
        return false;
      }
    }
  }
  return true;
}

// Check if number placement is valid
function isValidPlacement(grid, row, col, num) {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }
  
  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[boxRow + i][boxCol + j] === num) return false;
    }
  }
  
  return true;
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Generate Sudoku puzzle by removing numbers
function generateSudoku(difficulty) {
  const solution = generateCompleteGrid();
  const puzzle = solution.map(row => [...row]);
  
  // Determine how many cells to remove based on difficulty
  const cellsToRemove = {
    easy: 30,
    medium: 40,
    hard: 50
  }[difficulty];
  
  let removed = 0;
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }
  
  return { puzzle, solution };
}

// Check if grid is completely filled
function isGridFilled(grid) {
  return grid.every(row => row.every(cell => cell !== 0));
}

// Validate if the solution is correct
function isValidSolution(grid) {
  // Check all rows
  for (let row = 0; row < 9; row++) {
    const numbers = new Set();
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0 || numbers.has(grid[row][col])) {
        return false;
      }
      numbers.add(grid[row][col]);
    }
  }
  
  // Check all columns
  for (let col = 0; col < 9; col++) {
    const numbers = new Set();
    for (let row = 0; row < 9; row++) {
      if (grid[row][col] === 0 || numbers.has(grid[row][col])) {
        return false;
      }
      numbers.add(grid[row][col]);
    }
  }
  
  // Check all 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const numbers = new Set();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const row = boxRow * 3 + i;
          const col = boxCol * 3 + j;
          if (grid[row][col] === 0 || numbers.has(grid[row][col])) {
            return false;
          }
          numbers.add(grid[row][col]);
        }
      }
    }
  }
  
  return true;
}

export default Sudoku;