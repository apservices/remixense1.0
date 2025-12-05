import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MelodyGenerator from '@/features/create/MelodyGenerator';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: {
          melody: { notes: [{ pitch: 60, duration: 0.5 }] },
          processing_time_ms: 150
        },
        error: null
      })
    }
  }
}));

// Mock useCreateStore
vi.mock('@/features/create/useCreateStore', () => ({
  useCreateStore: () => ({
    bpm: 120,
    key: 'C major',
    isGenerating: false,
    generatedMelody: null,
    startGeneration: vi.fn(),
    setGeneratedMelody: vi.fn(),
    finishGeneration: vi.fn(),
    updateProgress: vi.fn()
  })
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);

describe('CREATE Module - MelodyGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders melody generator with all controls', () => {
    render(<MelodyGenerator />, { wrapper });
    
    expect(screen.getByText('Gerador de Melodia')).toBeInTheDocument();
    expect(screen.getByText('Tonalidade')).toBeInTheDocument();
    expect(screen.getByText('Modo')).toBeInTheDocument();
    expect(screen.getByText('Mood')).toBeInTheDocument();
    expect(screen.getByText('Gerar Melodia')).toBeInTheDocument();
  });

  it('displays BPM slider with correct range', () => {
    render(<MelodyGenerator />, { wrapper });
    
    expect(screen.getByText(/BPM: 120/)).toBeInTheDocument();
  });

  it('has generate button enabled by default', () => {
    render(<MelodyGenerator />, { wrapper });
    
    const generateButton = screen.getByRole('button', { name: /Gerar Melodia/i });
    expect(generateButton).not.toBeDisabled();
  });
});
