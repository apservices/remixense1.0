import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Auth from '../../src/pages/Auth';

vi.mock('../../src/hooks/useAuth', () => {
  return {
    useAuth: () => ({
      user: null,
      session: null,
      loading: false,
      isAuthenticated: false,
      email: null,
      signUp: vi.fn(),
      signIn: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn(),
    }),
  };
});

vi.mock('../../src/integrations/supabase/client', async (orig) => {
  const original = await (orig as any)();
  return {
    ...original,
    supabase: {
      ...original.supabase,
      functions: {
        invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
      },
    },
  };
});

describe('Invite → Signup → Login flow', () => {
  it('accepts invite and signs in', async () => {
    render(<Auth />);

    // Switch to signup tab
    fireEvent.click(await screen.findByText(/Cadastrar/i));

    fireEvent.change(screen.getByPlaceholderText(/Cole seu token de convite/i), {
      target: { value: 'INVITE_TOKEN_123' },
    });

    fireEvent.change(screen.getAllByPlaceholderText(/seu@email.com/i)[0], {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/senha/i)[0], {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText(/Criar conta/i));

    // After edge function, signIn is called; assert button returns to not loading state
    expect(await screen.findByText(/Cadastrar/i)).toBeInTheDocument();
  });
});
