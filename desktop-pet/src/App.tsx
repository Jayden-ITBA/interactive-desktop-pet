import { useState, useEffect } from 'react';
import { usePetBehavior } from './hooks/usePetBehavior';
import { PetRenderer } from './components/PetRenderer';
import { PetCreator } from './components/PetCreator';

export default function App() {
  const [showCreator, setShowCreator] = useState(false);

  usePetBehavior();

  useEffect(() => {
    // Start fully click-through (only the pet catches events)
    window.electronAPI?.setIgnoreMouseEvents(true, { forward: true });
  }, []);

  return (
    <>
      {/* PixiJS pet layer — fills entire screen, transparent */}
      <PetRenderer />

      {/* Overlay UI — only captures mouse when visible */}
      {!showCreator && (
        <button
          id="open-creator-btn"
          onMouseEnter={() => window.electronAPI?.setIgnoreMouseEvents(false)}
          onMouseLeave={() => !showCreator && window.electronAPI?.setIgnoreMouseEvents(true, { forward: true })}
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
          onClose={() => {
            setShowCreator(false);
            window.electronAPI?.setIgnoreMouseEvents(true, { forward: true });
          }}
        />
      )}
      {/* DOM Overlay for reliable hit testing */}
      <div
        style={{
          position: 'fixed',
          left: usePetStore.getState().position.x - 50,
          top: usePetStore.getState().position.y - 50,
          width: 100,
          height: 100,
          // Un-comment background for debugging if needed:
          // background: 'rgba(255,0,0,0.5)',
          cursor: 'pointer',
        }}
        onMouseEnter={() => window.electronAPI?.setIgnoreMouseEvents(false)}
        onMouseLeave={() => window.electronAPI?.setIgnoreMouseEvents(true, { forward: true })}
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
