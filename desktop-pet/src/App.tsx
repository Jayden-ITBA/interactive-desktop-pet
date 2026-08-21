import React, { useEffect } from 'react';
import { Stage } from '@pixi/react';
import { usePetBehavior } from './hooks/usePetBehavior';
import { PetRenderer } from './components/PetRenderer';

function App() {
  // Start the behavior loop
  usePetBehavior();

  useEffect(() => {
    // Initially tell main process to ignore mouse events (click-through)
    if (window.electronAPI) {
      window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
    }
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <Stage 
        width={window.innerWidth} 
        height={window.innerHeight} 
        options={{ backgroundAlpha: 0, transparent: true }}
      >
        <PetRenderer />
      </Stage>
    </div>
  );
}

export default App;
