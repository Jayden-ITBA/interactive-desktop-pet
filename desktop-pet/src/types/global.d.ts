declare global {
  interface Window {
    electronAPI?: {
      setIgnoreMouseEvents: (ignore: boolean, options?: { forward: boolean }) => void;
      savePetAssets?: (petId: string, states: Record<string, string>) => Promise<void>;
      updateHitAreas?: (areas: { x: number, y: number, width: number, height: number }[]) => void;
    };
  }
}

export {};
