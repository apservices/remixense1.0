import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DistributionForm from '@/features/distribute/DistributionForm';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/cover.jpg' } })
      })
    },
    from: () => ({
      insert: () => ({
        select: () => ({
          single: vi.fn().mockResolvedValue({ data: { id: 'release-1' }, error: null })
        })
      })
    }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null })
    }
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

describe('DISTRIBUTE Module - DistributionForm', () => {
  it('renders all form fields', () => {
    render(<DistributionForm projectId="test-project" />, { wrapper });
    
    expect(screen.getByText('Informações do Lançamento')).toBeInTheDocument();
    expect(screen.getByText('Título *')).toBeInTheDocument();
    expect(screen.getByText('Nome do Artista *')).toBeInTheDocument();
    expect(screen.getByText('Gênero *')).toBeInTheDocument();
    expect(screen.getByText('Data de Lançamento *')).toBeInTheDocument();
  });

  it('shows submit button', () => {
    render(<DistributionForm projectId="test-project" />, { wrapper });
    
    expect(screen.getByRole('button', { name: /Agendar Lançamento/i })).toBeInTheDocument();
  });

  it('has explicit content toggle', () => {
    render(<DistributionForm projectId="test-project" />, { wrapper });
    
    expect(screen.getByText('Conteúdo Explícito')).toBeInTheDocument();
  });
});
