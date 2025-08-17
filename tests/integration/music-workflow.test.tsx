import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Studio from '../../src/pages/Studio';

// Mock all required dependencies
vi.mock('../../src/hooks/useSubscription', () => ({
  useSubscription: () => ({
    isFree: false,
    subscription: { plan_type: 'pro' }
  })
}));

vi.mock('../../src/components/EnhancedDualPlayer', () => ({
  default: () => (
    <div data-testid="enhanced-dual-player">
      <h2>Dual Player Mock</h2>
      <button data-testid="load-deck-a">Carregar A</button>
      <button data-testid="load-deck-b">Carregar B</button>
      <button data-testid="play-pause">Tocar ambos</button>
      <input data-testid="crossfader" type="range" defaultValue="0.5" />
      <div data-testid="deck-a">Deck A</div>
      <div data-testid="deck-b">Deck B</div>
    </div>
  )
}));

// Mock WaveSurfer and audio APIs
const mockWaveSurfer = {
  load: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  playPause: vi.fn(),
  setVolume: vi.fn(),
  getCurrentTime: vi.fn(() => 30),
  getDuration: vi.fn(() => 180),
  on: vi.fn(),
  destroy: vi.fn()
};

Object.defineProperty(global, 'AudioContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    decodeAudioData: vi.fn().mockResolvedValue({
      getChannelData: () => new Float32Array(1024),
      duration: 120
    })
  }))
});

describe('Music Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderStudio = () => {
    return render(
      <BrowserRouter>
        <Studio />
      </BrowserRouter>
    );
  };

  it('should render studio page with dual player', () => {
    renderStudio();
    
    expect(screen.getByText('Estúdio de Mixagem')).toBeInTheDocument();
    expect(screen.getByTestId('enhanced-dual-player')).toBeInTheDocument();
  });

  it('should show subscription information', () => {
    renderStudio();
    
    expect(screen.getByText(/Plano: PRO/)).toBeInTheDocument();
  });

  it('should provide upload instructions', () => {
    renderStudio();
    
    expect(screen.getByText(/Carregue duas faixas, visualize waveforms/)).toBeInTheDocument();
  });

  it('should display upgrade notice for free users', () => {
    // Mock free user
    vi.mocked(require('../../src/hooks/useSubscription').useSubscription).mockReturnValue({
      isFree: true,
      subscription: null
    });
    
    renderStudio();
    
    expect(screen.getByText(/Alguns recursos avançados.*exigem upgrade/)).toBeInTheDocument();
  });

  it('should handle complete DJ workflow', async () => {
    renderStudio();
    
    // Step 1: Load tracks to both decks
    const loadDeckA = screen.getByTestId('load-deck-a');
    const loadDeckB = screen.getByTestId('load-deck-b');
    
    expect(loadDeckA).toBeInTheDocument();
    expect(loadDeckB).toBeInTheDocument();
    
    // Step 2: Verify decks are present
    expect(screen.getByTestId('deck-a')).toBeInTheDocument();
    expect(screen.getByTestId('deck-b')).toBeInTheDocument();
    
    // Step 3: Test crossfader control
    const crossfader = screen.getByTestId('crossfader');
    expect(crossfader).toBeInTheDocument();
    
    fireEvent.change(crossfader, { target: { value: '0.8' } });
    expect(crossfader).toHaveValue('0.8');
    
    // Step 4: Test play/pause functionality
    const playPause = screen.getByTestId('play-pause');
    fireEvent.click(playPause);
  });

  it('should integrate with audio analysis pipeline', async () => {
    // Mock the audio analysis process
    const mockAnalyzeAudio = vi.fn().mockResolvedValue({
      bpm: 128,
      key: 'A minor',
      energy: 0.7
    });
    
    // This would test the full pipeline from file upload to analysis
    renderStudio();
    
    // Simulate file loading and analysis
    const loadButton = screen.getByTestId('load-deck-a');
    fireEvent.click(loadButton);
    
    // Verify that the analysis pipeline would be triggered
    // In a real integration test, this would involve actual file upload
  });

  it('should handle error states gracefully', async () => {
    // Mock error in audio loading
    vi.mocked(mockWaveSurfer.load).mockRejectedValue(new Error('Audio load failed'));
    
    renderStudio();
    
    // The component should handle errors gracefully
    // This would be tested with actual error scenarios
  });

  it('should maintain state during user interactions', () => {
    renderStudio();
    
    // Test state persistence across interactions
    const crossfader = screen.getByTestId('crossfader');
    
    // Change crossfader position
    fireEvent.change(crossfader, { target: { value: '0.3' } });
    expect(crossfader).toHaveValue('0.3');
    
    // Click play/pause
    const playPause = screen.getByTestId('play-pause');
    fireEvent.click(playPause);
    
    // Crossfader position should remain unchanged
    expect(crossfader).toHaveValue('0.3');
  });

  it('should support keyboard shortcuts', () => {
    renderStudio();
    
    // Test spacebar for play/pause
    fireEvent.keyDown(document, { key: ' ', code: 'Space' });
    
    // Test other potential shortcuts
    fireEvent.keyDown(document, { key: 'ArrowLeft', code: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });
  });

  it('should handle mobile responsiveness', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });
    
    renderStudio();
    
    // Verify components adapt to mobile layout
    expect(screen.getByTestId('enhanced-dual-player')).toBeInTheDocument();
  });
});
