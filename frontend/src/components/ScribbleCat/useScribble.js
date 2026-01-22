import { useState, useCallback, useRef } from 'react';

export function useScribble(maxStrokes = 10) {
  const [strokes, setStrokes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef(null);

  // Check if element is clickable
  const isClickableElement = (element) => {
    return element.closest('button, a, input, textarea, select, [onclick], [role="button"]');
  };

  // Start drawing
  const startDrawing = useCallback((e) => {
    // Don't draw on clickable elements
    if (isClickableElement(e.target)) {
      return;
    }

    // Don't create new stroke if at limit
    if (strokes.length >= maxStrokes) {
      return;
    }

    setIsDrawing(true);
    currentStrokeRef.current = {
      id: `stroke-${Date.now()}`,
      points: [{ x: e.clientX, y: e.clientY }],
      createdAt: Date.now(),
      length: 0,
    };
  }, [strokes.length, maxStrokes]);

  // Continue drawing
  const draw = useCallback((e) => {
    if (!isDrawing || !currentStrokeRef.current) return;

    const lastPoint = currentStrokeRef.current.points[currentStrokeRef.current.points.length - 1];
    const newPoint = { x: e.clientX, y: e.clientY };

    // Calculate distance from last point
    const distance = Math.hypot(newPoint.x - lastPoint.x, newPoint.y - lastPoint.y);

    currentStrokeRef.current.points.push(newPoint);
    currentStrokeRef.current.length += distance;
  }, [isDrawing]);

  // End drawing
  const endDrawing = useCallback(() => {
    if (!isDrawing || !currentStrokeRef.current) return;

    // Only add stroke if it has multiple points
    if (currentStrokeRef.current.points.length > 1) {
      setStrokes(prev => [...prev, currentStrokeRef.current]);
    }

    setIsDrawing(false);
    currentStrokeRef.current = null;
  }, [isDrawing]);

  // Remove stroke by id
  const removeStroke = useCallback((strokeId) => {
    setStrokes(prev => prev.filter(s => s.id !== strokeId));
  }, []);

  // Clear all strokes
  const clearAllStrokes = useCallback(() => {
    setStrokes([]);
  }, []);

  return {
    strokes,
    isDrawing,
    currentStroke: currentStrokeRef.current,
    startDrawing,
    draw,
    endDrawing,
    removeStroke,
    clearAllStrokes,
  };
}
