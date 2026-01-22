import { useState, useEffect, useRef, useCallback } from 'react';

// ==================== CONSTANTS ====================
const ERASE_DELAY = 300;      // Wait 0.5 second before erasing starts (ms)
const ERASE_SPEED = 2500;       // Erase speed in pixels per second
const ARM_APPEAR_DURATION = 100;

export function useStrokeEraser(strokes, onStrokeRemove) {
  const [erasingStroke, setErasingStroke] = useState(null);
  const [eraseProgress, setEraseProgress] = useState(0);
  const [currentPawPosition, setCurrentPawPosition] = useState(null);
  const [isErasing, setIsErasing] = useState(false);
  const [armState, setArmState] = useState('hidden'); // 'hidden', 'appearing', 'erasing', 'disappearing'
  
  const queueRef = useRef([]);
  const animationRef = useRef(null);
  const isErasingRef = useRef(false);
  const processedStrokesRef = useRef(new Set()); // Track processed stroke IDs

  // Calculate total length of a stroke in pixels
  // Uses normalizedPoints for consistent speed calculation
  const calculateStrokeLength = useCallback((stroke) => {
    const points = stroke.normalizedPoints || stroke.points;
    
    if (!points || points.length < 2) return 0;
    
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      length += Math.hypot(dx, dy);
    }
    return length;
  }, []);

  // NEW: Calculate current paw position based on erase progress
  const calculatePawPosition = useCallback((stroke, progress) => {
    if (!stroke || !stroke.normalizedPoints || stroke.normalizedPoints.length < 2) {
      return null;
    }

    const points = stroke.normalizedPoints;
    
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

    // Calculate target distance based on progress
    const targetDistance = totalLength * progress;

    // Find the segment and interpolate
    let accumulatedDistance = 0;
    for (let i = 0; i < segmentLengths.length; i++) {
      if (accumulatedDistance + segmentLengths[i] >= targetDistance) {
        const segmentProgress = (targetDistance - accumulatedDistance) / segmentLengths[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        
        return {
          x: p1.x + (p2.x - p1.x) * segmentProgress,
          y: p1.y + (p2.y - p1.y) * segmentProgress
        };
      }
      accumulatedDistance += segmentLengths[i];
    }

    // If we're at the end, return last point
    return points[points.length - 1];
  }, []);

  const startNextErase = useCallback(() => {
    if (queueRef.current.length === 0) {
      // No more strokes - clear erasing state
      setErasingStroke(null);
      setEraseProgress(0);
      setCurrentPawPosition(null);
      setIsErasing(false);
      setArmState('hidden');
      isErasingRef.current = false;
      return;
    }

    if (isErasingRef.current) return;

    const nextStroke = queueRef.current[0];
    
    // Mark as erasing IMMEDIATELY to prevent race conditions
    isErasingRef.current = true;
    setIsErasing(true);
    
    // Wait before erasing
    setTimeout(() => {
      eraseStroke(nextStroke);
    }, ERASE_DELAY);
  }, []);

  const eraseStroke = useCallback((stroke) => {
    // Should already be true, but ensure it
    isErasingRef.current = true;
    setIsErasing(true);
    setErasingStroke(stroke);
    setEraseProgress(0);

    // Get the first point of the stroke (where erasing will start)
    const firstPoint = stroke.normalizedPoints?.[0] || stroke.points?.[0];
    
    // Animate arm appearing from below to first point
    setArmState('appearing');
    const appearStart = Date.now();
    
    const animateAppear = () => {
      const elapsed = Date.now() - appearStart;
      const progress = Math.min(elapsed / ARM_APPEAR_DURATION, 1);
      
      // Set paw position during appear animation
      // It will interpolate from anchor (handled in CatCharacter) to firstPoint
      if (progress < 1) {
        setCurrentPawPosition({ ...firstPoint, appearProgress: progress });
        requestAnimationFrame(animateAppear);
      } else {
        // Appearing complete, start actual erasing
        setArmState('erasing');
        startErasingAnimation(stroke);
      }
    };
    
    animateAppear();
  }, []);

  const startErasingAnimation = useCallback((stroke) => {
    // Calculate duration based on stroke length and erase speed
    const strokeLength = calculateStrokeLength(stroke);
    const duration = (strokeLength / ERASE_SPEED) * 1000; // Convert to milliseconds

    console.log(`🎨 Erasing stroke ${stroke.id}: ${strokeLength.toFixed(0)}px at ${ERASE_SPEED}px/s = ${(duration/1000).toFixed(2)}s`);

    const startTime = Date.now();
    let lastPawPos = null; // Track the last paw position
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setEraseProgress(progress);
      
      // Update paw position
      const pawPos = calculatePawPosition(stroke, progress);
      lastPawPos = pawPos; // Keep track of last position
      setCurrentPawPosition(pawPos);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Pass the last paw position to completeErase
        completeErase(stroke, lastPawPos);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [calculateStrokeLength, calculatePawPosition]);

  const completeErase = useCallback((stroke, lastPawPosition) => {
    // Cancel animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Animate arm disappearing
    setArmState('disappearing');
    const disappearDuration = ARM_APPEAR_DURATION; // 300ms to disappear
    const disappearStart = Date.now();
    
    const animateDisappear = () => {
      const elapsed = Date.now() - disappearStart;
      const progress = Math.min(elapsed / disappearDuration, 1);
      
      // Set paw position during disappear animation
      if (progress < 1) {
        setCurrentPawPosition({ ...lastPawPosition, disappearProgress: progress });
        requestAnimationFrame(animateDisappear);
      } else {
        // Disappearing complete
        finishErasingStroke(stroke);
      }
    };
    
    animateDisappear();
  }, []);

  const finishErasingStroke = useCallback((stroke) => {
    // Remove from queue
    queueRef.current = queueRef.current.filter(s => s.id !== stroke.id);
    
    // Remove from strokes array
    onStrokeRemove(stroke.id);

    // Check if there's a next stroke BEFORE resetting
    if (queueRef.current.length > 0) {
      const nextStroke = queueRef.current[0];
      
      // Set the next stroke immediately (no visual gap)
      setErasingStroke(nextStroke);
      setEraseProgress(0);
      
      // KEEP isErasingRef TRUE during the wait period
      // This prevents race conditions when user draws during transition
      
      // Wait before actually erasing it
      setTimeout(() => {
        eraseStroke(nextStroke);
      }, ERASE_DELAY);
    } else {
      // No more strokes - reset everything
      setErasingStroke(null);
      setEraseProgress(0);
      setCurrentPawPosition(null);
      setIsErasing(false);
      setArmState('hidden');
      isErasingRef.current = false;
    }
  }, [onStrokeRemove, eraseStroke]);

  // Process new strokes
  useEffect(() => {
    let addedNewStroke = false;

    // Only process strokes we haven't seen before
    strokes.forEach(stroke => {
      // Skip if already processed
      if (processedStrokesRef.current.has(stroke.id)) {
        return;
      }

      // Skip if it's currently being erased
      if (erasingStroke?.id === stroke.id) {
        return;
      }

      // Skip if it's already in queue
      const alreadyInQueue = queueRef.current.some(s => s.id === stroke.id);
      if (alreadyInQueue) {
        return;
      }

      // New stroke! Add to queue and mark as processed
      queueRef.current.push(stroke);
      processedStrokesRef.current.add(stroke.id);
      addedNewStroke = true;
      
      console.log('➕ Stroke queued for erasing:', stroke.id);
    });

    // Only start next erase if we actually added a new stroke AND not currently erasing
    if (addedNewStroke && !isErasingRef.current) {
      startNextErase();
    }
  }, [strokes, erasingStroke, startNextErase]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    erasingStroke,
    eraseProgress,
    currentPawPosition,
    isErasing,
    armState
  };
}