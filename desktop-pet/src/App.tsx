import { useState, useEffect } from 'react';
import { usePetBehavior } from './hooks/usePetBehavior';
import { PetRenderer } from './components/PetRenderer';
import { PetCreator } from './components/PetCreator';
import { usePetStore } from './store/usePetStore';

export default function App() {
  const [showCreator, setShowCreator] = useState(false);
  const { position, setPetState, setPosition } = usePetStore();

  usePetBehavior();

  useEffect(() => {
    // We send the current hit areas to the main process for rock-solid OS polling
    const btnSize = 60; // Approximate button size + padding
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    
    let areas = [];
    if (showCreator) {
      // If creator is open, capture the center modal area
      areas.push({ x: screenW / 2 - 300, y: screenH / 2 - 300, width: 600, height: 600 });
    } else {
      // Capture Pet bounding box
      areas.push({ x: position.x - 60, y: position.y - 60, width: 120, height: 120 });
      // Capture bottom-right button
      areas.push({ x: screenW - btnSize - 20, y: screenH - btnSize - 20, width: btnSize, height: btnSize });
    }
    
    window.electronAPI?.updateHitAreas?.(areas);
  }, [position.x, position.y, showCreator]);

  return (
    <>
      {/* PixiJS pet layer — fills entire screen, transparent */}
      <PetRenderer />

      {/* Overlay UI */}
      {!showCreator && (
        <button
          id="open-creator-btn"
          onClick={() => setShowCreator(true)}
          title="Add / Change Pet"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: '#fff',
            border: 'none',
            fontSize: '1.6rem',
            lineHeight: 1,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            zIndex: 10000,
          }}
        >
          🐾
        </button>
      )}

      {showCreator && (
        <PetCreator
          onClose={() => setShowCreator(false)}
        />
      )}
      {/* DOM Overlay for reliable hit testing */}
      <div
        style={{
          position: 'fixed',
          left: position.x - 50,
          top: position.y - 50,
          width: 100,
          height: 100,
          cursor: 'pointer',
        }}
        onClick={(e) => {
          if (e.detail === 2) {
            usePetStore.getState().setPetState('JUMP');
            setTimeout(() => usePetStore.getState().setPetState('HAPPY'), 600);
            setTimeout(() => usePetStore.getState().setPetState('IDLE'), 2600);
          } else {
            usePetStore.getState().setPetState('HAPPY');
            setTimeout(() => usePetStore.getState().setPetState('IDLE'), 2000);
          }
        }}
        // Simple drag via DOM for MVP reliability
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startY = e.clientY;
          const startPosX = usePetStore.getState().position.x;
          const startPosY = usePetStore.getState().position.y;
          usePetStore.getState().setPetState('DRAGGED');

          const onMouseMove = (moveEvent: MouseEvent) => {
            usePetStore.getState().setPosition(
              startPosX + (moveEvent.clientX - startX),
              startPosY + (moveEvent.clientY - startY)
            );
          };

          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            usePetStore.getState().setPetState('HAPPY');
            setTimeout(() => usePetStore.getState().setPetState('IDLE'), 2000);
          };

          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        }}
      />
    </>
  );
}
