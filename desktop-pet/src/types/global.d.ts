declare global {
  interface Window {
    electronAPI?: {
      setIgnoreMouseEvents: (ignore: boolean, options?: { forward: boolean }) => void;
      savePetAssets?: (petId: string, states: Record<string, string>) => Promise<void>;
    };
  }
}

export {};
