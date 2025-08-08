import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { useTracks } from '../../src/hooks/useTracks';

function TestComponent() {
  const { tracks, toggleLike } = useTracks();
  return (
    <div>
      <button onClick={() => toggleLike(tracks[0]?.id || '')}>Toggle</button>
      <span data-testid="liked">{String(tracks[0]?.is_liked)}</span>
    </div>
  );
}

describe('useTracks toggleLike', () => {
  beforeEach(() => {
    localStorage.clear();
    const seed = [
      {
        id: 't1',
        name: 'Track 1',
        title: 'Track 1',
        artist: 'Unknown',
        duration: '00:00',
        bpm: null,
        key_signature: null,
        genre: null,
        energy_level: null,
        type: 'track',
        is_liked: false,
        created_at: new Date().toISOString(),
        status: 'ready',
      },
    ];
    localStorage.setItem('remixense_tracks', JSON.stringify(seed));
  });

  it('toggles like state for the first track', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('liked').textContent).toBe('false');
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('liked').textContent).toBe('true');
  });
});
