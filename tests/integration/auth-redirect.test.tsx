import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import Auth from '../../src/pages/Auth';

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '123', email: 'user@example.com' },
    session: null,
    loading: false,
    isAuthenticated: true,
    email: 'user@example.com',
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

describe('Auth redirect behavior', () => {
  it('redirects to /dashboard when already authenticated', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });
});
