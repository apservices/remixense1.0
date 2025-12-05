import { create } from 'zustand';

export interface CreateState {
  // Current project
  projectId: string | null;
  trackId: string | null;
  
  // AI Generation state
  isGenerating: boolean;
  generationType: 'melody' | 'harmony' | 'mastering' | 'stems' | 'mood' | null;
  generationProgress: number;
  
  // Audio analysis
  bpm: number | null;
  key: string | null;
  energy: number | null;
  
  // Generated outputs
  generatedMelody: string | null;
  generatedHarmony: string[] | null;
  masteringPreview: string | null;
  extractedStems: Record<string, string> | null;
  moodVariations: Array<{ mood: string; url: string }> | null;
  
  // Actions
  setProject: (projectId: string, trackId?: string) => void;
  setAnalysis: (analysis: { bpm?: number; key?: string; energy?: number }) => void;
  startGeneration: (type: CreateState['generationType']) => void;
  updateProgress: (progress: number) => void;
  setGeneratedMelody: (url: string) => void;
  setGeneratedHarmony: (chords: string[]) => void;
  setMasteringPreview: (url: string) => void;
  setExtractedStems: (stems: Record<string, string>) => void;
  setMoodVariations: (variations: Array<{ mood: string; url: string }>) => void;
  finishGeneration: () => void;
  reset: () => void;
}

const initialState = {
  projectId: null,
  trackId: null,
  isGenerating: false,
  generationType: null,
  generationProgress: 0,
  bpm: null,
  key: null,
  energy: null,
  generatedMelody: null,
  generatedHarmony: null,
  masteringPreview: null,
  extractedStems: null,
  moodVariations: null
};

export const useCreateStore = create<CreateState>((set) => ({
  ...initialState,
  
  setProject: (projectId, trackId) => set({ projectId, trackId }),
  
  setAnalysis: (analysis) => set((state) => ({
    bpm: analysis.bpm ?? state.bpm,
    key: analysis.key ?? state.key,
    energy: analysis.energy ?? state.energy
  })),
  
  startGeneration: (type) => set({
    isGenerating: true,
    generationType: type,
    generationProgress: 0
  }),
  
  updateProgress: (progress) => set({ generationProgress: progress }),
  
  setGeneratedMelody: (url) => set({ generatedMelody: url }),
  
  setGeneratedHarmony: (chords) => set({ generatedHarmony: chords }),
  
  setMasteringPreview: (url) => set({ masteringPreview: url }),
  
  setExtractedStems: (stems) => set({ extractedStems: stems }),
  
  setMoodVariations: (variations) => set({ moodVariations: variations }),
  
  finishGeneration: () => set({
    isGenerating: false,
    generationType: null,
    generationProgress: 100
  }),
  
  reset: () => set(initialState)
}));
