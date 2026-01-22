import { useState } from 'react';
import ScribbleCanvas from './ScribbleCanvas';
import { useStrokeEraser } from './useStrokeEraser';
import CatCharacter from './CatCharacter';

// ==================== CONSTANTS ====================
export const MAX_STROKES = 10;

/**
 * Main component - orchestrates drawing and erasing with cat character
 * 
 * Usage: Just add <ScribbleCat /> to your page!
 */
function ScribbleCat() {
  // STATE: Array of all strokes
  const [strokes, setStrokes] = useState([]);

  // FUNCTION: Remove a stroke from the array
  const removeStroke = (strokeId) => {
    setStrokes(prev => prev.filter(s => s.id !== strokeId));
    console.log('🗑️  Stroke removed from array:', strokeId);
  };

  // HOOK: Handle erasing logic and get paw position
  const { erasingStroke, eraseProgress, currentPawPosition, isErasing, armState } = useStrokeEraser(
    strokes,
    removeStroke // Callback to remove stroke
  );

  // FUNCTION: Add a completed stroke to the array
  const addStroke = (stroke) => {
    setStrokes(prev => [...prev, stroke]);
    console.log('💾 Stroke saved in ScribbleCat:', stroke.id);
  };

  return (
    <>
      {/* Canvas for drawing */}
      <ScribbleCanvas 
        strokes={strokes}
        erasingStroke={erasingStroke}
        eraseProgress={eraseProgress}
        onStrokeComplete={addStroke}
      />

      {/* Cat character that erases strokes */}
      <CatCharacter 
        currentPawPosition={currentPawPosition}
        isErasing={isErasing}
        armState={armState}
      />
    </>
  );
}

export default ScribbleCat;