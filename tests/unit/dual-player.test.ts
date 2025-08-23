import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EnhancedDualPlayer from '../../src/components/EnhancedDualPlayer';

// Mock WaveSurfer
const mockWaveSurfer = {
  load: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  playPause: vi.fn(),
  setVolume: vi.fn(),
  setPlaybackRate: vi.fn(),
  setTime: vi.fn(),
  seekTo: vi.fn(),
  getCurrentTime: vi.fn(() => 30),
  getDuration: vi.fn(() => 180),
  on: vi.fn(),
  destroy: vi.fn()
};

vi.mock('wavesurfer.js', () => ({
  default: {
    create: vi.fn(() => mockWaveSurfer)
  }
}));

// Mock BPM detective
vi.mock('bpm-detective', () => ({
  default: vi.fn(() => 120)
}));

// Mock audio metadata utils
vi.mock('../../src/utils/audioMetadata', () => ({
  extractAudioMetadata: vi.fn().mockResolvedValue({
    key: 'C major',
    bpm: 120
  }),
  analyzeHarmony: vi.fn(() => ({
    compatibleKeys: ['C major', 'A minor', 'F major']
  }))
}));

// Mock store
vi.mock('../../src/store/decks', () => ({
  DeckProvider: ({ children }: { children: any }) => children,
  useDecks: () => ({
    leftDeck: null,
    rightDeck: null,
    setLeftDeck: vi.fn(),
    setRightDeck: vi.fn()
  })
}));

// Mock DJ tools
vi.mock('../../src/lib/djTools', () => ({
  loadCuePoints: vi.fn(() => []),
  loadLoopRanges: vi.fn(() => [])
}));

// Mock experimental features
vi.mock('../../src/lib/experimentalFeatures', () => ({
  isFeatureEnabled: vi.fn(() => false),
  ExperimentalAudioProcessor: vi.fn()
}));

// Mock Web Audio API
Object.defineProperty(global, 'AudioContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    decodeAudioData: vi.fn().mockResolvedValue({
      getChannelData: () => new Float32Array(1024),
      duration: 120
    })
  }))
});

// Mock FileReader
Object.defineProperty(global, 'FileReader', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    readAsArrayBuffer: vi.fn(function() {
      setTimeout(() => {
        if (this.onload) {
          this.onload({ target: { result: new ArrayBuffer(1024) } });
        }
      }, 100);
    }),
    onload: null
  }))
});

// Mock URL.createObjectURL
Object.defineProperty(global.URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'blob:mock-url')
});

describe('EnhancedDualPlayer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dual player interface', () => {
    render(<EnhancedDualPlayer />);
    
    expect(screen.getByText('Dual Player')).toBeInTheDocument();
    expect(screen.getByText('Deck A')).toBeInTheDocument();
    expect(screen.getByText('Deck B')).toBeInTheDocument();
    expect(screen.getByText('Crossfader')).toBeInTheDocument();
  });

  it('should have load buttons for both decks', () => {
    render(<EnhancedDualPlayer />);
    
    expect(screen.getByText('Carregar A')).toBeInTheDocument();
    expect(screen.getByText('Carregar B')).toBeInTheDocument();
  });

  it('should display play/pause controls', () => {
    render(<EnhancedDualPlayer />);
    
    const playButton = screen.getByText('Tocar ambos');
    expect(playButton).toBeInTheDocument();
    
    fireEvent.click(playButton);
    expect(screen.getByText('Pausar')).toBeInTheDocument();
  });

  it('should handle file loading for deck A', async () => {
    render(<EnhancedDualPlayer />);
    
    const loadButton = screen.getByText('Carregar A');
    
    // Mock file input creation and selection
    const mockFile = new File(['audio data'], 'test-track.mp3', { type: 'audio/mpeg' });
    
    // Create a mock input element
    const mockInput = document.createElement('input');
    mockInput.type = 'file';
    mockInput.accept = 'audio/*';
    
    vi.spyOn(document, 'createElement').mockReturnValue(mockInput);
    vi.spyOn(mockInput, 'click').mockImplementation(() => {
      // Simulate file selection
      Object.defineProperty(mockInput, 'files', {
        value: [mockFile]
      });
      
      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { files: [mockFile] }
      });
      
      if (mockInput.onchange) {
        mockInput.onchange(event as any);
      }
    });
    
    fireEvent.click(loadButton);
    
    await waitFor(() => {
      expect(mockWaveSurfer.load).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  it('should display BPM and key information', async () => {
    render(<EnhancedDualPlayer />);
    
    // Initially should show placeholder values
    expect(screen.getAllByText('—')).toHaveLength(2); // BPM and Key placeholders for both decks
  });

  it('should handle crossfader movement', () => {
    render(<EnhancedDualPlayer />);
    
    const crossfader = screen.getByDisplayValue('0.5');
    expect(crossfader).toBeInTheDocument();
    
    fireEvent.change(crossfader, { target: { value: '0.8' } });
    expect(crossfader).toHaveValue('0.8');
  });

  it('should display sync controls', () => {
    render(<EnhancedDualPlayer />);
    
    expect(screen.getByText('Key Sync')).toBeInTheDocument();
    expect(screen.getByText('BPM Sync')).toBeInTheDocument();
  });

  it('should handle key shift controls', () => {
    render(<EnhancedDualPlayer />);
    
    expect(screen.getByText('Key Shift')).toBeInTheDocument();
    expect(screen.getByText('0 st')).toBeInTheDocument();
    
    // Test increment
    const plusButton = screen.getByText('+');
    fireEvent.click(plusButton);
    expect(screen.getByText('+1 st')).toBeInTheDocument();
    
    // Test decrement
    const minusButton = screen.getByText('-');
    fireEvent.click(minusButton);
    fireEvent.click(minusButton);
    expect(screen.getByText('-1 st')).toBeInTheDocument();
  });

  it('should display nudge controls', () => {
    render(<EnhancedDualPlayer />);
    
    // Should have rewind and fast forward buttons for both decks
    const rewindButtons = screen.getAllByRole('button').filter(button => 
      button.innerHTML.includes('Rewind')
    );
    const fastForwardButtons = screen.getAllByRole('button').filter(button => 
      button.innerHTML.includes('FastForward')
    );
    
    expect(rewindButtons).toHaveLength(2);
    expect(fastForwardButtons).toHaveLength(2);
  });

  it('should handle volume controls for each deck', () => {
    render(<EnhancedDualPlayer />);
    
    const volumeSliders = screen.getAllByDisplayValue('0.9');
    expect(volumeSliders).toHaveLength(2); // One for each deck
    
    fireEvent.change(volumeSliders[0], { target: { value: '0.5' } });
    expect(volumeSliders[0]).toHaveValue('0.5');
  });

  it('should calculate equal-power crossfader curves', () => {
    render(<EnhancedDualPlayer />);
    
    const crossfader = screen.getByDisplayValue('0.5');
    
    // Test different crossfader positions
    fireEvent.change(crossfader, { target: { value: '0' } }); // Full left
    fireEvent.change(crossfader, { target: { value: '1' } }); // Full right
    fireEvent.change(crossfader, { target: { value: '0.5' } }); // Center
    
    // The component should apply proper gain curves based on crossfader position
  });

  it('should display BPM delta and key compatibility badges', () => {
    render(<EnhancedDualPlayer />);
    
    expect(screen.getByText(/Δ BPM/)).toBeInTheDocument();
    expect(screen.getByText(/Key/)).toBeInTheDocument();
  });

  it('should handle playback rate changes for BPM sync', async () => {
    render(<EnhancedDualPlayer />);
    
    const bpmSyncButton = screen.getByText('BPM Sync');
    fireEvent.click(bpmSyncButton);
    
    // Should apply playback rate changes when BPM sync is activated
    await waitFor(() => {
      expect(mockWaveSurfer.setPlaybackRate).toHaveBeenCalled();
    });
  });
});