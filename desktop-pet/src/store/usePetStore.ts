import { create } from 'zustand';

export enum PetState {
  IDLE = 'IDLE',
  WALK = 'WALK',
  RUN = 'RUN',
  JUMP = 'JUMP',
  HAPPY = 'HAPPY',
  ANGRY = 'ANGRY',
  SLEEP = 'SLEEP',
  PLAY = 'PLAY',
  DRAGGED = 'DRAGGED',
}

interface PetStateStore {
  currentState: PetState;
  position: { x: number; y: number };
  direction: 'left' | 'right';
  setPetState: (state: PetState) => void;
  setPosition: (x: number, y: number) => void;
  setDirection: (dir: 'left' | 'right') => void;
}

export const usePetStore = create<PetStateStore>((set) => ({
  currentState: PetState.IDLE,
  // Start near the center of a typical screen
  position: { x: 500, y: 500 },
  direction: 'right',
  setPetState: (state) => set({ currentState: state }),
  setPosition: (x, y) => set({ position: { x, y } }),
  setDirection: (dir) => set({ direction: dir }),
}));
