import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App';

describe('Login flow', () => {
  it('should login and redirect to dashboard', async () => {
    render(<App />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/senha/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText(/entrar/i));
    expect(await screen.findByText(/bem-vindo/i)).toBeInTheDocument();
  });
});
