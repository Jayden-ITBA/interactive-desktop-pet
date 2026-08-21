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
    </>
  );
}
