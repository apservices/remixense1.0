import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import ProtectedRoutes from '../../src/routes/ProtectedRoutes';
import Home from '../../src/pages/Home';
import Auth from '../../src/pages/Auth';

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    isAuthenticated: false,
    email: null,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

describe('ProtectedRoutes', () => {
  it('redirects unauthenticated users to /login', async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<Home />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Auth page content
    expect(await screen.findByText(/Entrar/i)).toBeInTheDocument();
  });
});
