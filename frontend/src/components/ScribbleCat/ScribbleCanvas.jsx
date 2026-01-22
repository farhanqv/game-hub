import { useRef, useEffect, useState } from 'react';
import { MAX_STROKES } from './ScribbleCat';

// ==================== CONSTANTS ====================
const POINT_SPACING = 10; // Pixels between normalized points

function ScribbleCanvas({ strokes, erasingStroke, eraseProgress, onStrokeComplete }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
  }, []);

  // Redraw canvas whenever needed
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw completed strokes
    strokes.forEach(stroke => {
      if (erasingStroke && stroke.id === erasingStroke.id) {
        // This stroke is being erased - draw partially
        drawPartialStroke(ctx, stroke, eraseProgress);
      } else {
        // Normal stroke - draw fully
        drawStroke(ctx, stroke);
      }
    });

    // Draw current stroke being drawn
    if (isDrawing && currentStrokeRef.current) {
      drawStroke(ctx, currentStrokeRef.current);
    }
  }, [strokes, forceUpdate, erasingStroke, eraseProgress, isDrawing]);

  // Draw full stroke with smooth curves
  const drawStroke = (ctx, stroke) => {
    if (!stroke || !stroke.points || stroke.points.length < 2) return;

    ctx.strokeStyle = '#FF6B9D';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    // Use quadratic curves for smoothness
    for (let i = 1; i < stroke.points.length - 1; i++) {
      const currentPoint = stroke.points[i];
      const nextPoint = stroke.points[i + 1];
      
      // Control point is the current point, end point is midway to next
      const midX = (currentPoint.x + nextPoint.x) / 2;
      const midY = (currentPoint.y + nextPoint.y) / 2;
      
      ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, midX, midY);
    }
    
    // Draw final segment to last point
    const lastPoint = stroke.points[stroke.points.length - 1];
    ctx.lineTo(lastPoint.x, lastPoint.y);
    
    ctx.stroke();
  };

  // Draw partial stroke (for erasing) with smooth curves
  // Uses raw points for smoothness, with distance-based progress for constant speed
  const drawPartialStroke = (ctx, stroke, progress) => {
    if (!stroke || !stroke.points || stroke.points.length < 2) return;

    const points = stroke.points;
    
    // Calculate total stroke length
    let totalLength = 0;
    const segmentLengths = [];
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const length = Math.hypot(dx, dy);
      segmentLengths.push(length);
      totalLength += length;
    }

    // Calculate how much distance to skip based on progress
    const distanceToSkip = totalLength * progress;

    // Find the starting point index by walking through segments
    let accumulatedDistance = 0;
    let startIndex = 0;
    let startOffset = 0; // How far into the segment we start

    for (let i = 0; i < segmentLengths.length; i++) {
      if (accumulatedDistance + segmentLengths[i] >= distanceToSkip) {
        // We found the segment where erasing starts
        startIndex = i;
        startOffset = distanceToSkip - accumulatedDistance;
        break;
      }
      accumulatedDistance += segmentLengths[i];
    }

    // If we've erased everything, don't draw
    if (startIndex >= points.length - 1) return;

    ctx.strokeStyle = '#FF6B9D';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();

    // Calculate the exact starting point within the segment
    if (startOffset > 0 && startIndex < points.length - 1) {
      const segmentLength = segmentLengths[startIndex];
      const t = startOffset / segmentLength;
      const p1 = points[startIndex];
      const p2 = points[startIndex + 1];
      
      const startX = p1.x + (p2.x - p1.x) * t;
      const startY = p1.y + (p2.y - p1.y) * t;
      
      ctx.moveTo(startX, startY);
      
      // Start drawing from the next point
      startIndex++;
    } else {
      ctx.moveTo(points[startIndex].x, points[startIndex].y);
    }

    // Draw the remaining stroke with smooth curves
    for (let i = startIndex; i < points.length - 1; i++) {
      const currentPoint = points[i];
      const nextPoint = points[i + 1];
      
      const midX = (currentPoint.x + nextPoint.x) / 2;
      const midY = (currentPoint.y + nextPoint.y) / 2;
      
      ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, midX, midY);
    }
    
    // Draw final segment to last point
    if (startIndex < points.length) {
      const lastPoint = points[points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
    }
    
    ctx.stroke();
  };

  // NORMALIZE POINTS: Resample to evenly-spaced points
  const normalizePoints = (rawPoints, targetSpacing = POINT_SPACING) => {
    if (rawPoints.length < 2) return rawPoints;

    const normalized = [rawPoints[0]]; // Always keep first point
    let accumulatedDistance = 0;

    for (let i = 1; i < rawPoints.length; i++) {
      const prev = rawPoints[i - 1];
      const curr = rawPoints[i];
      
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const segmentLength = Math.hypot(dx, dy);
      
      accumulatedDistance += segmentLength;

      // Add point every targetSpacing pixels
      while (accumulatedDistance >= targetSpacing) {
        // Calculate position along segment
        const excessDistance = accumulatedDistance - targetSpacing;
        const t = (segmentLength - excessDistance) / segmentLength;
        
        const newPoint = {
          x: prev.x + dx * t,
          y: prev.y + dy * t
        };
        
        normalized.push(newPoint);
        accumulatedDistance -= targetSpacing;
      }
    }

    // Always include last point
    const lastRaw = rawPoints[rawPoints.length - 1];
    const lastNormalized = normalized[normalized.length - 1];
    
    if (lastRaw.x !== lastNormalized.x || lastRaw.y !== lastNormalized.y) {
      normalized.push(lastRaw);
    }

    return normalized;
  };

  // Mouse event handlers
  useEffect(() => {
    const handleMouseDown = (e) => {
      // Don't draw on clickable elements
      const clickable = e.target.closest('button, a, input, textarea, select, [onclick]');
      if (clickable) return;

      // Max strokes limit
      if (strokes.length >= MAX_STROKES) return;

      // Prevent text selection
      document.body.classList.add('scribbling');
      e.preventDefault();

      // Start new stroke with unique ID
      setIsDrawing(true);
      currentStrokeRef.current = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        points: [{ x: e.clientX, y: e.clientY }]
      };
    };

    const handleMouseMove = (e) => {
      if (!isDrawing || !currentStrokeRef.current) return;

      // Add point
      currentStrokeRef.current.points.push({ 
        x: e.clientX, 
        y: e.clientY 
      });

      // Trigger redraw
      setForceUpdate(n => n + 1);
    };

    const handleMouseUp = () => {
      if (!isDrawing || !currentStrokeRef.current) return;

      const rawPoints = currentStrokeRef.current.points;

      // Normalize points to even spacing (for calculating erase speed/length)
      const normalizedPoints = normalizePoints(rawPoints, POINT_SPACING);

      // Only save if we have enough points
      if (normalizedPoints.length > 1 && rawPoints.length > 1) {
        const finalStroke = {
          id: currentStrokeRef.current.id,
          points: rawPoints,              // Keep raw points for smooth drawing
          normalizedPoints: normalizedPoints, // For erase speed calculation
          createdAt: Date.now()
        };
        onStrokeComplete(finalStroke);
      }

      // Reset
      document.body.classList.remove('scribbling');
      setIsDrawing(false);
      currentStrokeRef.current = null;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDrawing, strokes.length, onStrokeComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    />
  );
}

export default ScribbleCanvas;