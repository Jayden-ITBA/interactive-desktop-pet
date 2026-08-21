import { useEffect, useRef } from 'react';
import { usePetStore, PetState } from '../store/usePetStore';

export const usePetBehavior = () => {
  const { currentState, setPetState, position, setPosition, direction, setDirection } = usePetStore();
  const stateTimerRef = useRef<number | null>(null);
  const moveTimerRef = useRef<number | null>(null);

  // Helper to clear timers
  const clearTimers = () => {
    if (stateTimerRef.current) window.clearTimeout(stateTimerRef.current);
    if (moveTimerRef.current) window.clearInterval(moveTimerRef.current);
  };

  useEffect(() => {
    // If the pet is being interacted with, we pause automatic behaviors.
    if ([PetState.DRAGGED, PetState.HAPPY, PetState.JUMP, PetState.PLAY].includes(currentState)) {
      clearTimers();
      
      // Auto-revert some interaction states back to IDLE after a delay
      if (currentState === PetState.HAPPY || currentState === PetState.JUMP) {
        stateTimerRef.current = window.setTimeout(() => {
          setPetState(PetState.IDLE);
        }, 2000);
      }
      return;
    }

    // Determine next state
    const setNextState = () => {
      clearTimers();
      
      let nextStateDelay = 2000;
      
      if (currentState === PetState.IDLE) {
        // Idle for 2-6 seconds, then decide what to do
        nextStateDelay = 2000 + Math.random() * 4000;
        
        const r = Math.random();
        if (r < 0.6) {
          // 60% chance to walk
          setPetState(PetState.WALK);
          setDirection(Math.random() > 0.5 ? 'left' : 'right');
        } else if (r < 0.8) {
          // 20% chance to jump
          setPetState(PetState.JUMP);
        } else if (r < 0.95) {
          // 15% chance to stay idle
          setPetState(PetState.IDLE); // triggers re-run of effect
        } else {
          // 5% chance to sleep
          setPetState(PetState.SLEEP);
        }
      } else if (currentState === PetState.WALK) {
        // Walk for 2-5 seconds
        nextStateDelay = 2000 + Math.random() * 3000;
        
        // Continuous movement
        moveTimerRef.current = window.setInterval(() => {
          setPosition(
            position.x + (direction === 'right' ? 2 : -2),
            position.y
          );
        }, 32); // ~30fps

        // After walking, go back to IDLE
        stateTimerRef.current = window.setTimeout(() => {
          clearTimers();
          setPetState(PetState.IDLE);
        }, nextStateDelay);
        return; // Early return to avoid setting timeout below
      } else if (currentState === PetState.SLEEP) {
        // Sleep for 10-20 seconds
        nextStateDelay = 10000 + Math.random() * 10000;
        stateTimerRef.current = window.setTimeout(() => {
          setPetState(PetState.IDLE);
        }, nextStateDelay);
        return;
      }
      
      stateTimerRef.current = window.setTimeout(setNextState, nextStateDelay);
    };

    // Kickoff the behavior loop
    if (currentState === PetState.IDLE) {
      setNextState();
    }

    return clearTimers;
  }, [currentState, direction, position.x, position.y, setPetState, setPosition, setDirection]);
};
