import { PetState } from '../store/usePetStore';

export interface ProcessedPetImage {
  id: string;
  states: Record<PetState, string>; // Maps PetState to image data URL or file path
}

export interface PetImageProcessor {
  process(image: File): Promise<ProcessedPetImage>;
}

export class MockPetImageProcessor implements PetImageProcessor {
  async process(image: File): Promise<ProcessedPetImage> {
    const id = Date.now().toString();
    
    // Read the file as a data URL
    const imageUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });

    // Mock implementation: just use the same image for all states
    const states = Object.values(PetState).reduce((acc, state) => {
      acc[state as PetState] = imageUrl;
      return acc;
    }, {} as Record<PetState, string>);

    return {
      id,
      states,
    };
  }
}

// Export a singleton instance
export const petImageProcessor = new MockPetImageProcessor();
