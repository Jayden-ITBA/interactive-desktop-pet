import { useEffect, useRef } from 'react';
import { usePetStore } from '../store/usePetStore';

const WALK_SPEED = 2; // px per frame tick (~30fps)
const BOUNDARY_PADDING = 80;

export function usePetBehavior() {
  const { currentState, setPetState, position, setPosition, direction, setDirection } = usePetStore();

  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = () => {
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    stateTimerRef.current = null;
    moveIntervalRef.current = null;
  };

  useEffect(() => {
    // --- Interaction states: auto-revert to IDLE ---
    if (currentState === 'HAPPY' || currentState === 'JUMP') {
      clearAll();
      stateTimerRef.current = setTimeout(() => setPetState('IDLE'), 2000);
      return clearAll;
    }

    if (currentState === 'DRAGGED') {
      clearAll();
      return clearAll;
    }

    // --- Autonomous behavior ---
    if (currentState === 'IDLE') {
      clearAll();
      const idleDelay = 2000 + Math.random() * 4000;
      stateTimerRef.current = setTimeout(() => {
        const r = Math.random();
        if (r < 0.55) {
          setDirection(Math.random() > 0.5 ? 'right' : 'left');
          setPetState('WALK');
        } else if (r < 0.75) {
          setPetState('JUMP');
        } else if (r < 0.92) {
          setPetState('IDLE'); // Stay idle — resets the timer
        } else {
          setPetState('SLEEP');
        }
      }, idleDelay);
      return clearAll;
    }

    if (currentState === 'WALK') {
      clearAll();
      const walkDuration = 2000 + Math.random() * 3000;

      // Movement tick
      moveIntervalRef.current = setInterval(() => {
        const screenW = window.screen.width;
        setPosition(
          // Read latest position from state via the store snapshot
          Math.max(
            BOUNDARY_PADDING,
            Math.min(
              screenW - BOUNDARY_PADDING,
              usePetStore.getState().position.x + (usePetStore.getState().direction === 'right' ? WALK_SPEED : -WALK_SPEED),
            ),
          ),
          usePetStore.getState().position.y,
        );
      }, 32);

      stateTimerRef.current = setTimeout(() => {
        clearAll();
        setPetState('IDLE');
      }, walkDuration);

      return clearAll;
    }

    if (currentState === 'SLEEP') {
      clearAll();
      const sleepDuration = 8000 + Math.random() * 10000;
      stateTimerRef.current = setTimeout(() => {
        setPetState('IDLE');
      }, sleepDuration);
      return clearAll;
    }

    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentState]);

  // Sync direction changes to movement without re-mounting the walk interval
  useEffect(() => {
    // Direction is handled inside the walk interval via store.getState(), so nothing extra needed
  }, [direction]);

  // Boundaries check — if pet walks off screen, flip direction
  useEffect(() => {
    const screenW = window.screen.width;
    if (currentState === 'WALK') {
      if (position.x <= BOUNDARY_PADDING && direction === 'left') {
        setDirection('right');
      } else if (position.x >= screenW - BOUNDARY_PADDING && direction === 'right') {
        setDirection('left');
      }
    }
  }, [position.x, currentState, direction, setDirection]);
}
