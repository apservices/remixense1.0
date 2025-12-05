import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfileForm from '@/features/settings/ProfileForm';

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    loading: false
  })
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValue({ 
            data: { username: 'testuser', avatar_url: null }, 
            error: null 
          })
        })
      }),
      update: () => ({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    }),
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/avatar.jpg' } })
      })
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

describe('SETTINGS Module - ProfileForm', () => {
  it('renders profile form with all fields', async () => {
    render(<ProfileForm />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('Perfil')).toBeInTheDocument();
      expect(screen.getByLabelText('Nome de usuário')).toBeInTheDocument();
      expect(screen.getByLabelText('Nome de exibição')).toBeInTheDocument();
      expect(screen.getByLabelText('Bio')).toBeInTheDocument();
      expect(screen.getByLabelText('Website')).toBeInTheDocument();
    });
  });

  it('shows save button', () => {
    render(<ProfileForm />, { wrapper });
    
    expect(screen.getByRole('button', { name: /Salvar Alterações/i })).toBeInTheDocument();
  });

  it('displays user email', () => {
    render(<ProfileForm />, { wrapper });
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
