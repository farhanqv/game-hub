import CatHead from './CatHead';
import CatPaw from './CatPaw';

/**
 * Cat character that erases strokes with its paw
 * Props:
 * - currentPawPosition: { x, y, appearProgress?, disappearProgress? } or null
 * - isErasing: boolean
 * - armState: 'hidden' | 'appearing' | 'erasing' | 'disappearing'
 */
function CatCharacter({ currentPawPosition, isErasing, armState }) {
  // Cat head position (bottom-left corner)
  const CAT_HEAD_X = 60;
  const CAT_HEAD_Y = typeof window !== 'undefined' ? window.innerHeight - 40 : 600;
  
  // Cat head SVG is 120px wide, so the center is at CAT_HEAD_X + 60
  // The anchor should be at the right side of the cat head (where the shoulder would be)
  const ANCHOR_X = CAT_HEAD_X + 110; // Right side of cat head (120px width - 10px offset)
  const ANCHOR_Y = CAT_HEAD_Y + 100; // Below screen

  // Calculate paw position based on arm state
  let displayPawPosition = null;
  let showArm = false;

  if (currentPawPosition && isErasing) {
    showArm = true;
    
    if (armState === 'appearing' && currentPawPosition.appearProgress !== undefined) {
      // Interpolate from anchor (below screen) to first point
      const progress = currentPawPosition.appearProgress;
      displayPawPosition = {
        x: ANCHOR_X + (currentPawPosition.x - ANCHOR_X) * progress,
        y: ANCHOR_Y + (currentPawPosition.y - ANCHOR_Y) * progress
      };
    } else if (armState === 'disappearing' && currentPawPosition.disappearProgress !== undefined) {
      // Interpolate from last point back to anchor (below screen)
      const progress = currentPawPosition.disappearProgress;
      displayPawPosition = {
        x: currentPawPosition.x + (ANCHOR_X - currentPawPosition.x) * progress,
        y: currentPawPosition.y + (ANCHOR_Y - currentPawPosition.y) * progress
      };
    } else {
      // Normal erasing - use actual paw position
      displayPawPosition = currentPawPosition;
    }
  }

  // Calculate arm angle
  let armAngle = 0;
  if (displayPawPosition) {
    const dx = displayPawPosition.x - ANCHOR_X;
    const dy = displayPawPosition.y - ANCHOR_Y;
    armAngle = Math.atan2(dy, dx) * (180 / Math.PI);
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      pointerEvents: 'none',
      zIndex: 9997,
    }}>
      {/* Cat Head */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: `${CAT_HEAD_X}px`,
      }}>
        <CatHead />
      </div>

      {/* Speech Bubble */}
      <div style={{
        position: 'absolute',
        bottom: '90px',
        left: `${CAT_HEAD_X - 8}px`,
        background: 'white',
        border: '2px solid #2C3E50',
        borderRadius: '20px',
        padding: '10px 15px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#2C3E50',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        DO NOT SCRIBBLE!
        {/* Speech bubble pointer */}
        <div style={{
          position: 'absolute',
          bottom: '-10px',
          left: '20px',
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: '10px solid white',
        }}/>
        <div style={{
          position: 'absolute',
          bottom: '-13px',
          left: '18px',
          width: 0,
          height: 0,
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderTop: '12px solid #2C3E50',
          zIndex: -1,
        }}/>
      </div>

      {/* Cat Arm (SVG line from anchor to paw) */}
      {showArm && displayPawPosition && (
        <svg
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {/* Arm line */}
          <line
            x1={ANCHOR_X}
            y1={ANCHOR_Y}
            x2={displayPawPosition.x}
            y2={displayPawPosition.y}
            stroke="#FFB347"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Joint circle at anchor */}
          <circle
            cx={ANCHOR_X}
            cy={ANCHOR_Y}
            r="8"
            fill="#FFD700"
          />
        </svg>
      )}

      {/* Cat Paw (follows the stroke) */}
      {showArm && displayPawPosition && (
        <div style={{
          position: 'fixed',
          left: displayPawPosition.x - 20,
          top: displayPawPosition.y - 20,
          transform: `rotate(${armAngle}deg)`,
        }}>
          <CatPaw />
        </div>
      )}
    </div>
  );
}

export default CatCharacter;