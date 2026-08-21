import { create } from 'zustand';

export const PetState = {
  IDLE: 'IDLE',
  WALK: 'WALK',
  RUN: 'RUN',
  JUMP: 'JUMP',
  HAPPY: 'HAPPY',
  ANGRY: 'ANGRY',
  SLEEP: 'SLEEP',
  PLAY: 'PLAY',
  DRAGGED: 'DRAGGED',
} as const;

export type PetState = typeof PetState[keyof typeof PetState];

export type Personality = 'playful' | 'lazy' | 'friendly' | 'mischievous';

export interface PetProfile {
  id: string;
  name: string;
  image: string; // The base URL or ID used to fetch its assets
  personality: Personality;
  createdAt: number;
}

interface PetStateStore {
  currentState: PetState;
  position: { x: number; y: number };
  direction: 'left' | 'right';
  profiles: PetProfile[];
  activePetId: string | null;
  setPetState: (state: PetState) => void;
  setPosition: (x: number, y: number) => void;
  setDirection: (dir: 'left' | 'right') => void;
  addProfile: (profile: PetProfile) => void;
  setActivePet: (id: string) => void;
}

export const usePetStore = create<PetStateStore>((set) => ({
  currentState: PetState.IDLE,
  // Start near the center of a typical screen
  position: { x: 500, y: 500 },
  direction: 'right',
  profiles: [],
  activePetId: null,
  setPetState: (state) => set({ currentState: state }),
  setPosition: (x, y) => set({ position: { x, y } }),
  setDirection: (dir) => set({ direction: dir }),
  addProfile: (profile) => set((state) => ({ profiles: [...state.profiles, profile] })),
  setActivePet: (id) => set({ activePetId: id }),
}));
