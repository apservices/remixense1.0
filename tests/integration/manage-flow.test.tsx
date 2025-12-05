import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MetadataTable from '@/features/manage/MetadataTable';

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    loading: false
  })
}));

// Mock Supabase
const mockTracks = [
  { id: '1', title: 'Track One', artist: 'Artist A', bpm: 128, key_signature: 'C major', genre: 'Electronic', energy_level: 8 },
  { id: '2', title: 'Track Two', artist: 'Artist B', bpm: 140, key_signature: 'G minor', genre: 'House', energy_level: 7 }
];

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          is: () => ({
            order: vi.fn().mockResolvedValue({ data: mockTracks, error: null })
          })
        })
      }),
      update: () => ({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    })
  }
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

describe('MANAGE Module - MetadataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table headers correctly', async () => {
    render(<MetadataTable />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('Título')).toBeInTheDocument();
      expect(screen.getByText('Artista')).toBeInTheDocument();
      expect(screen.getByText('BPM')).toBeInTheDocument();
      expect(screen.getByText('Key')).toBeInTheDocument();
      expect(screen.getByText('Gênero')).toBeInTheDocument();
      expect(screen.getByText('Energy')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<MetadataTable />, { wrapper });
    
    // Should show loading spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
