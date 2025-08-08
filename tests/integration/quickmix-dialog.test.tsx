import { render, screen, fireEvent } from '@testing-library/react';
import { QuickMixDialog } from '../../src/components/QuickMixDialog';
import { vi } from 'vitest';

vi.mock('../../src/components/QuickMixEngine', () => ({
  QuickMixEngine: ({ onClose }: { onClose: () => void }) => (
    <div>
      <p>Engine Mock</p>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('QuickMixDialog', () => {
  it('opens and shows Quick Mix Engine title', async () => {
    render(
      <QuickMixDialog>
        <button aria-label="Abrir Quick Mix">Abrir</button>
      </QuickMixDialog>
    );

    fireEvent.click(screen.getByRole('button', { name: /abrir quick mix/i }));

    expect(await screen.findByText(/Quick Mix Engine/i)).toBeInTheDocument();
    expect(await screen.findByText(/Engine Mock/i)).toBeInTheDocument();
  });
});
