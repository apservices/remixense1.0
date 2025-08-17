import { render, screen } from '@testing-library/react';
import { PWAInstallPrompt } from '../../src/components/PWAInstallPrompt';
import { vi } from 'vitest';

describe('PWAInstallPrompt', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('shows install CTA after beforeinstallprompt event', async () => {
    render(<PWAInstallPrompt />);

    const event = new Event('beforeinstallprompt');
    // @ts-ignore
    event.preventDefault = () => {};
    window.dispatchEvent(event);

    vi.advanceTimersByTime(10000);

    expect(await screen.findByText(/Instalar RemiXense/i)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Instalar App/i })).toBeInTheDocument();
  });
});
