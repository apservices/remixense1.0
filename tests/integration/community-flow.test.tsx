import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChallengeList from '@/features/community/ChallengeList';

// Mock Supabase
const mockChallenges = [
  { 
    id: '1', 
    title: 'Remix Challenge', 
    description: 'Create the best remix', 
    prize: '$500', 
    start_date: new Date().toISOString(), 
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), 
    status: 'open',
    created_by: 'user-1'
  }
];

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => ({
          eq: vi.fn().mockResolvedValue({ data: mockChallenges, error: null })
        })
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

describe('COMMUNITY Module - ChallengeList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders challenge list header', () => {
    render(<ChallengeList />, { wrapper });
    
    expect(screen.getByText('Desafios')).toBeInTheDocument();
  });

  it('shows tabs for different challenge statuses', () => {
    render(<ChallengeList />, { wrapper });
    
    expect(screen.getByRole('tab', { name: 'Abertos' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Em Votação' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Encerrados' })).toBeInTheDocument();
  });

  it('has create challenge button', () => {
    render(<ChallengeList />, { wrapper });
    
    expect(screen.getByRole('button', { name: /Criar Desafio/i })).toBeInTheDocument();
  });
});
