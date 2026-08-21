import React, { useEffect, useState } from 'react';
import { Stage } from '@pixi/react';
import { usePetBehavior } from './hooks/usePetBehavior';
import { PetRenderer } from './components/PetRenderer';
import { PetCreator } from './components/PetCreator';

function App() {
  const [showCreator, setShowCreator] = useState(false);

  // Start the behavior loop
  usePetBehavior();

  useEffect(() => {
    // Initially tell main process to ignore mouse events (click-through)
    if (window.electronAPI) {
      window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
    }
  }, []);

  const handleSettingsMouseEnter = () => {
    if (window.electronAPI) {
      window.electronAPI.setIgnoreMouseEvents(false);
    }
  };

  const handleSettingsMouseLeave = () => {
    // Only revert if creator is not open
    if (window.electronAPI && !showCreator) {
      window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <Stage 
        width={window.innerWidth} 
        height={window.innerHeight} 
        options={{ backgroundAlpha: 0, transparent: true }}
      >
        <PetRenderer />
      </Stage>

      {/* Overlay UI for Settings/Creation */}
      {!showCreator && (
        <button
          onMouseEnter={handleSettingsMouseEnter}
          onMouseLeave={handleSettingsMouseLeave}
          onClick={() => setShowCreator(true)}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#2c3e50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.2rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 9999
          }}
          title="Add Pet"
        >
          +
        </button>
      )}

      {showCreator && (
        <PetCreator onClose={() => {
          setShowCreator(false);
          // Restore ignore events when closing
          if (window.electronAPI) {
            window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
          }
        }} />
      )}
    </div>
  );
}

export default App;
