import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TrackUpload } from '../../src/components/TrackUpload';

// Mock the hooks
vi.mock('../../src/hooks/useTracks', () => ({
  useTracks: () => ({
    addTrack: vi.fn().mockResolvedValue({ id: 'mock-track-id' })
  })
}));

// Mock Web APIs
Object.defineProperty(global, 'AudioContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    decodeAudioData: vi.fn().mockResolvedValue({
      getChannelData: () => new Float32Array(1024),
      duration: 120
    })
  }))
});

Object.defineProperty(global, 'FileReader', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    readAsArrayBuffer: vi.fn(),
    onload: null,
    result: new ArrayBuffer(1024)
  }))
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

// Mock crypto.randomUUID
Object.defineProperty(global.crypto, 'randomUUID', {
  writable: true,
  value: vi.fn(() => 'mock-uuid-123')
});

describe('TrackUpload Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render upload area correctly', () => {
    render(<TrackUpload />);
    
    expect(screen.getByText('Arraste arquivos aqui ou clique para selecionar')).toBeInTheDocument();
  });

  it('should show offline message when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false });
    
    render(<TrackUpload />);
    
    expect(screen.getByText('Análise requer conexão ativa')).toBeInTheDocument();
  });

  it('should handle file selection', async () => {
    render(<TrackUpload />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    
    const mockFile = new File(['mock audio data'], 'test.mp3', { type: 'audio/mpeg' });
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    });
    
    await waitFor(() => {
      expect(screen.getByText('test.mp3')).toBeInTheDocument();
    });
  });

  it('should show upload progress states', async () => {
    render(<TrackUpload />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['mock audio data'], 'progress-test.mp3', { type: 'audio/mpeg' });
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    });
    
    // Should show uploading state
    await waitFor(() => {
      expect(screen.getByText('Enviando…')).toBeInTheDocument();
    });
    
    // Should transition to analyzing state
    await waitFor(() => {
      expect(screen.getByText('Processando no servidor…')).toBeInTheDocument();
    });
  });

  it('should handle multiple files', async () => {
    render(<TrackUpload />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFiles = [
      new File(['audio 1'], 'track1.mp3', { type: 'audio/mpeg' }),
      new File(['audio 2'], 'track2.wav', { type: 'audio/wav' }),
      new File(['audio 3'], 'track3.m4a', { type: 'audio/mp4' })
    ];
    
    fireEvent.change(fileInput, {
      target: { files: mockFiles }
    });
    
    await waitFor(() => {
      expect(screen.getByText('track1.mp3')).toBeInTheDocument();
      expect(screen.getByText('track2.wav')).toBeInTheDocument();
      expect(screen.getByText('track3.m4a')).toBeInTheDocument();
    });
  });

  it('should handle upload errors', async () => {
    const { useTracks } = await import('../../src/hooks/useTracks');
    vi.mocked(useTracks).mockReturnValue({
      addTrack: vi.fn().mockRejectedValue(new Error('Upload failed'))
    } as any);
    
    render(<TrackUpload />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['audio data'], 'error-test.mp3', { type: 'audio/mpeg' });
    
    fireEvent.change(fileInput, {
      target: { files: [mockFile] }
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Erro: Upload failed/)).toBeInTheDocument();
    });
  });

  it('should respect file type restrictions', () => {
    render(<TrackUpload />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput?.accept).toBe('audio/*');
    expect(fileInput?.multiple).toBe(true);
  });

  it('should handle drag and drop events', () => {
    render(<TrackUpload />);
    
    const dropZone = document.querySelector('.border-dashed') as HTMLElement;
    expect(dropZone).toBeInTheDocument();
    
    // Test drag over
    fireEvent.dragOver(dropZone);
    
    // Test drag leave
    fireEvent.dragLeave(dropZone);
    
    // Test drop
    const mockFile = new File(['audio data'], 'dropped.mp3', { type: 'audio/mpeg' });
    const dropEvent = new Event('drop') as any;
    dropEvent.dataTransfer = {
      files: [mockFile]
    };
    
    fireEvent(dropZone, dropEvent);
  });
});