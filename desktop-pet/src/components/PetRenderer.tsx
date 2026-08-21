import React, { useCallback, useRef, useState, useMemo } from 'react';
import { Graphics, Sprite } from '@pixi/react';
import { usePetStore, PetState } from '../store/usePetStore';
import * as PIXI from 'pixi.js';

export const PetRenderer: React.FC = () => {
  const { currentState, position, setPosition, setPetState, activePetId } = usePetStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const petStartPos = useRef({ x: 0, y: 0 });

  const drawPet = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      
      // Different colors/shapes based on state
      let color = 0x3498db; // IDLE - Blue
      let width = 100;
      let height = 100;
      let yOffset = 0;

      switch (currentState) {
        case PetState.WALK:
          color = 0x2ecc71; // Green
          break;
        case PetState.JUMP:
          color = 0xe74c3c; // Red
          yOffset = -50;
          break;
        case PetState.HAPPY:
          color = 0xf1c40f; // Yellow
          break;
        case PetState.SLEEP:
          color = 0x95a5a6; // Gray
          height = 50;
          yOffset = 50;
          break;
        case PetState.DRAGGED:
          color = 0x9b59b6; // Purple
          break;
        default:
          break;
      }

      g.beginFill(color);
      g.drawRoundedRect(-width / 2, -height / 2 + yOffset, width, height, 20);
      g.endFill();

      // Draw eyes
      g.beginFill(0xffffff);
      g.drawCircle(-20, -10 + yOffset, 10);
      g.drawCircle(20, -10 + yOffset, 10);
      g.endFill();

      // Pupils
      g.beginFill(0x000000);
      g.drawCircle(-20, -10 + yOffset, 5);
      g.drawCircle(20, -10 + yOffset, 5);
      g.endFill();
    },
    [currentState]
  );

  const handlePointerDown = (e: PIXI.FederatedPointerEvent) => {
    // Determine if it's a double click
    if (e.detail === 2) {
      setPetState(PetState.JUMP);
      setTimeout(() => {
        setPetState(PetState.HAPPY);
      }, 500); // jump then happy
      return;
    }

    setIsDragging(true);
    dragStartPos.current = { x: e.client.x, y: e.client.y };
    petStartPos.current = { x: position.x, y: position.y };
    setPetState(PetState.DRAGGED);
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setPetState(PetState.HAPPY); // Return to happy after drag
    }
  };

  const handlePointerMove = (e: PIXI.FederatedPointerEvent) => {
    if (isDragging) {
      const dx = e.client.x - dragStartPos.current.x;
      const dy = e.client.y - dragStartPos.current.y;
      setPosition(petStartPos.current.x + dx, petStartPos.current.y + dy);
    }
  };

  // Set ignore mouse events based on hover
  const handlePointerOver = () => {
    if (window.electronAPI) {
      window.electronAPI.setIgnoreMouseEvents(false);
    }
  };

  const handlePointerOut = () => {
    if (window.electronAPI && !isDragging) {
      window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
    }
  };

  // Determine image URL if custom pet
  const customPetImageUrl = useMemo(() => {
    if (!activePetId) return null;
    const states = (window as any)[`pet_assets_${activePetId}`];
    if (states && states[currentState]) {
      return states[currentState];
    }
    // Fallback to IDLE if specific state not found
    if (states && states[PetState.IDLE]) {
      return states[PetState.IDLE];
    }
    return null;
  }, [activePetId, currentState]);

  const eventHandlers = {
    interactive: true,
    pointerdown: handlePointerDown,
    pointerup: handlePointerUp,
    pointerupoutside: handlePointerUp,
    pointermove: handlePointerMove,
    pointerover: handlePointerOver,
    pointerout: handlePointerOut,
    cursor: "pointer"
  };

  if (customPetImageUrl) {
    return (
      <Sprite
        image={customPetImageUrl}
        x={position.x}
        y={position.y}
        anchor={0.5} // Center the image
        scale={0.5} // Scale down the uploaded image to fit as a pet
        {...eventHandlers}
      />
    );
  }

  return (
    <Graphics
      draw={drawPet}
      x={position.x}
      y={position.y}
      {...eventHandlers}
    />
  );
};

declare global {
  interface Window {
    electronAPI?: {
      setIgnoreMouseEvents: (ignore: boolean, options?: { forward: boolean }) => void;
    };
  }
}
