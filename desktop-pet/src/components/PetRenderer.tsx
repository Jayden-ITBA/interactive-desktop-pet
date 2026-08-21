import { Application, extend, useTick } from '@pixi/react';
import { Graphics, Sprite, Texture } from 'pixi.js';
import { useCallback, useRef, useState, useEffect } from 'react';
import { usePetStore } from '../store/usePetStore';
import type { PetState } from '../store/usePetStore';

// Register PixiJS components for use in JSX
extend({ Graphics, Sprite });

// --- Pet color/shape config per state ---
const STATE_CONFIG: Record<PetState, { color: number; scaleY?: number; yOffset?: number }> = {
  IDLE:    { color: 0x3498db },
  WALK:    { color: 0x2ecc71 },
  RUN:     { color: 0x27ae60 },
  JUMP:    { color: 0xe74c3c, yOffset: -30 },
  HAPPY:   { color: 0xf1c40f },
  ANGRY:   { color: 0xff4444 },
  SLEEP:   { color: 0x95a5a6, scaleY: 0.6, yOffset: 20 },
  PLAY:    { color: 0xe67e22 },
  DRAGGED: { color: 0x9b59b6 },
};

// Inner PixiJS pet drawing component (must live inside <Application>)
function PetGraphics() {
  const { currentState, position, setPosition, setPetState, activePetId } = usePetStore();
  const graphicsRef = useRef<Graphics | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const petStartPos = useRef({ x: 0, y: 0 });

  // Redraw whenever state changes
  const drawPet = useCallback((g: Graphics) => {
    g.clear();
    const cfg = STATE_CONFIG[currentState] ?? STATE_CONFIG.IDLE;
    const w = 100;
    const h = 100 * (cfg.scaleY ?? 1);
    const yo = cfg.yOffset ?? 0;

    // Body
    g.roundRect(-w / 2, -h / 2 + yo, w, h, 18);
    g.fill(cfg.color);

    // Eyes (closed/squint when sleeping)
    if (currentState === 'SLEEP') {
      g.moveTo(-22, -8 + yo);
      g.lineTo(-14, -8 + yo);
      g.stroke({ color: 0x000000, width: 3 });
      g.moveTo(14, -8 + yo);
      g.lineTo(22, -8 + yo);
      g.stroke({ color: 0x000000, width: 3 });
    } else {
      g.circle(-20, -10 + yo, 10);
      g.fill(0xffffff);
      g.circle(20, -10 + yo, 10);
      g.fill(0xffffff);
      // Pupils
      const pupilX = currentState === 'HAPPY' ? 2 : 0;
      g.circle(-20 + pupilX, -10 + yo, 5);
      g.fill(0x111111);
      g.circle(20 + pupilX, -10 + yo, 5);
      g.fill(0x111111);
    }

    // Smile when happy
    if (currentState === 'HAPPY') {
      g.arc(0, 5 + yo, 15, 0, Math.PI);
      g.stroke({ color: 0x333333, width: 3 });
    }

    // Zzz when sleeping
    if (currentState === 'SLEEP') {
      g.fill(0x888888);
    }
  }, [currentState]);

  // Use useTick for per-frame draw update
  useTick(() => {
    if (graphicsRef.current) {
      graphicsRef.current.clear();
      drawPet(graphicsRef.current);
    }
  });

  const handlePointerDown = (e: { detail: number; globalX: number; globalY: number }) => {
    if (e.detail === 2) {
      // Double click
      setPetState('JUMP');
      setTimeout(() => setPetState('HAPPY'), 600);
      setTimeout(() => setPetState('IDLE'), 2600);
      return;
    }
    // Single click — start potential drag
    setIsDragging(true);
    dragStartPos.current = { x: e.globalX, y: e.globalY };
    petStartPos.current = { x: position.x, y: position.y };
    setPetState('DRAGGED');
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setPetState('HAPPY');
      setTimeout(() => setPetState('IDLE'), 2000);
    }
    // Single click reaction (no significant movement)
    else {
      setPetState('HAPPY');
      setTimeout(() => setPetState('IDLE'), 2000);
    }
  };

  const handlePointerMove = (e: { globalX: number; globalY: number }) => {
    if (isDragging) {
      setPosition(
        petStartPos.current.x + (e.globalX - dragStartPos.current.x),
        petStartPos.current.y + (e.globalY - dragStartPos.current.y),
      );
    }
  };

  const handlePointerOver = () => {
    if (window.electronAPI) window.electronAPI.setIgnoreMouseEvents(false);
  };

  const handlePointerOut = () => {
    if (window.electronAPI && !isDragging) {
      window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
    }
  };

  // Get custom pet image if available
  const customImageUrl = activePetId
    ? ((window as Record<string, unknown>)[`pet_assets_${activePetId}`] as Record<string, string> | undefined)?.[currentState]
      ?? ((window as Record<string, unknown>)[`pet_assets_${activePetId}`] as Record<string, string> | undefined)?.['IDLE']
    : null;

  if (customImageUrl) {
    return (
      <pixiSprite
        texture={Texture.from(customImageUrl)}
        x={position.x}
        y={position.y}
        anchor={0.5}
        scale={0.4}
        eventMode="static"
        onpointerdown={handlePointerDown}
        onpointerup={handlePointerUp}
        onpointermove={handlePointerMove}
        onpointerover={handlePointerOver}
        onpointerout={handlePointerOut}
        cursor="pointer"
      />
    );
  }

  return (
    <pixiGraphics
      ref={graphicsRef}
      x={position.x}
      y={position.y}
      draw={drawPet}
      eventMode="static"
      onpointerdown={handlePointerDown}
      onpointerup={handlePointerUp}
      onpointermove={handlePointerMove}
      onpointerover={handlePointerOver}
      onpointerout={handlePointerOut}
      cursor="pointer"
    />
  );
}

// Outer wrapper — renders the PixiJS Application canvas
export function PetRenderer() {
  return (
    <Application
      backgroundAlpha={0}
      resizeTo={window}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' } as React.CSSProperties}
    >
      <PetGraphics />
    </Application>
  );
}
