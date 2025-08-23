import { test, expect } from '@playwright/test';

test.describe('Music Playback Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        user: { id: 'test-user', email: 'test@example.com' }
      }));
    });

    // Mock Web Audio API
    await page.addInitScript(() => {
      class MockAudioContext {
        currentTime = 0;
        state = 'running';
        
        createGain() {
          return {
            gain: { value: 1 },
            connect: () => ({}),
            disconnect: () => ({})
          };
        }
        
        createBufferSource() {
          return {
            buffer: null,
            connect: () => ({}),
            start: () => ({}),
            stop: () => ({}),
            playbackRate: { value: 1 }
          };
        }
        
        decodeAudioData(buffer: ArrayBuffer) {
          return Promise.resolve({
            length: 44100,
            duration: 1,
            sampleRate: 44100,
            getChannelData: () => new Float32Array(44100)
          });
        }
        
        createMediaStreamDestination() {
          return {
            stream: new Blob()
          };
        }
      }
      
      window.AudioContext = MockAudioContext as any;
      window.webkitAudioContext = MockAudioContext as any;
    });

    // Mock WaveSurfer
    await page.addInitScript(() => {
      const mockWaveSurfer = {
        load: () => Promise.resolve(),
        play: () => Promise.resolve(),
        pause: () => Promise.resolve(),
        playPause: () => Promise.resolve(),
        setVolume: () => ({}),
        setPlaybackRate: () => ({}),
        setTime: () => ({}),
        seekTo: () => ({}),
        getCurrentTime: () => 30,
        getDuration: () => 180,
        on: () => ({}),
        destroy: () => ({})
      };
      
      window.WaveSurfer = {
        create: () => mockWaveSurfer
      };
    });

    // Mock BPM detection
    await page.addInitScript(() => {
      window.bpmDetective = () => 120;
    });

    // Mock File reading
    await page.addInitScript(() => {
      window.FileReader = class MockFileReader {
        readAsArrayBuffer() {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: { result: new ArrayBuffer(1024) } } as any);
            }
          }, 100);
        }
        
        onload: ((event: any) => void) | null = null;
      } as any;
    });
  });

  test('should load and display dual player interface', async ({ page }) => {
    await page.goto('/studio');
    
    // Verify dual player interface elements
    await expect(page.locator('h1')).toContainText('Estúdio de Mixagem');
    await expect(page.locator('text=Deck A')).toBeVisible();
    await expect(page.locator('text=Deck B')).toBeVisible();
    await expect(page.locator('text=Crossfader')).toBeVisible();
    
    // Verify control buttons
    await expect(page.locator('button:has-text("Carregar A")')).toBeVisible();
    await expect(page.locator('button:has-text("Carregar B")')).toBeVisible();
    await expect(page.locator('button:has-text("Tocar ambos")')).toBeVisible();
  });

  test('should load audio files to decks', async ({ page }) => {
    await page.goto('/studio');
    
    // Load file to Deck A
    await test.step('Load file to Deck A', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.click('button:has-text("Carregar A")')
      ]);
      
      // Mock file selection
      await page.evaluate(() => {
        const mockFile = new File(['mock audio data'], 'track-a.mp3', { type: 'audio/mpeg' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(mockFile);
          input.files = dataTransfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      // Verify track info is displayed
      await expect(page.locator('text=track-a.mp3')).toBeVisible();
      await expect(page.locator('text=120 BPM')).toBeVisible();
    });

    // Load file to Deck B
    await test.step('Load file to Deck B', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.click('button:has-text("Carregar B")')
      ]);
      
      await page.evaluate(() => {
        const mockFile = new File(['mock audio data'], 'track-b.mp3', { type: 'audio/mpeg' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(mockFile);
          input.files = dataTransfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      await expect(page.locator('text=track-b.mp3')).toBeVisible();
    });
  });

  test('should control playback (play/pause)', async ({ page }) => {
    await page.goto('/studio');
    
    // Load a track first
    await page.evaluate(() => {
      const mockFile = new File(['mock audio data'], 'test-track.mp3', { type: 'audio/mpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Wait for track to load
    await expect(page.locator('text=test-track.mp3')).toBeVisible();
    
    // Test play button
    const playButton = page.locator('button:has-text("Tocar ambos")');
    await playButton.click();
    await expect(page.locator('button:has-text("Pausar")')).toBeVisible();
    
    // Test pause button
    const pauseButton = page.locator('button:has-text("Pausar")');
    await pauseButton.click();
    await expect(page.locator('button:has-text("Tocar ambos")')).toBeVisible();
  });

  test('should display and interact with waveforms', async ({ page }) => {
    await page.goto('/studio');
    
    // Load track
    await page.evaluate(() => {
      const mockFile = new File(['mock audio data'], 'waveform-test.mp3', { type: 'audio/mpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Verify waveform containers exist
    await expect(page.locator('.h-24.rounded-lg.glass')).toHaveCount(2); // Left and right deck waveforms
    
    // Test waveform interaction (clicking to seek)
    const waveformContainer = page.locator('.h-24.rounded-lg.glass').first();
    await waveformContainer.click({ position: { x: 100, y: 40 } });
    
    // Verify that seeking works (this would depend on your implementation)
    // The actual assertion would depend on how you expose the current time
  });

  test('should control volume sliders', async ({ page }) => {
    await page.goto('/studio');
    
    // Load tracks to both decks
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      inputs.forEach((input, index) => {
        const mockFile = new File(['mock audio data'], `track-${index}.mp3`, { type: 'audio/mpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    
    // Test deck volume controls
    const volumeSliders = page.locator('input[type="range"]').filter({ hasNotText: 'Crossfader' });
    await expect(volumeSliders).toHaveCount(2); // One for each deck
    
    // Test changing volume on first deck
    await volumeSliders.first().fill('0.5');
    expect(await volumeSliders.first().inputValue()).toBe('0.5');
    
    // Test changing volume on second deck
    await volumeSliders.last().fill('0.8');
    expect(await volumeSliders.last().inputValue()).toBe('0.8');
  });

  test('should control crossfader', async ({ page }) => {
    await page.goto('/studio');
    
    // Verify crossfader exists
    const crossfader = page.locator('input[type="range"]').last(); // Crossfader should be the last range input
    await expect(crossfader).toBeVisible();
    
    // Test crossfader movement
    await crossfader.fill('0.2'); // Move towards Deck A
    expect(await crossfader.inputValue()).toBe('0.2');
    
    await crossfader.fill('0.8'); // Move towards Deck B
    expect(await crossfader.inputValue()).toBe('0.8');
    
    await crossfader.fill('0.5'); // Center position
    expect(await crossfader.inputValue()).toBe('0.5');
  });

  test('should use DJ tools (cue points, loops, nudge)', async ({ page }) => {
    await page.goto('/studio');
    
    // Load track
    await page.evaluate(() => {
      const mockFile = new File(['mock audio data'], 'dj-tools-test.mp3', { type: 'audio/mpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    await expect(page.locator('text=dj-tools-test.mp3')).toBeVisible();
    
    // Test nudge controls
    const nudgeButtons = page.locator('button').filter({ hasText: /Rewind|FastForward/ });
    await expect(nudgeButtons).toHaveCount(4); // 2 for each deck
    
    // Test clicking nudge buttons
    await nudgeButtons.first().click(); // Rewind left deck
    await nudgeButtons.nth(1).click(); // Fast forward left deck
    
    // Test cue controls (if visible)
    const cueButtons = page.locator('button').filter({ hasText: /Cue|Set/ });
    if (await cueButtons.count() > 0) {
      await cueButtons.first().click();
    }
  });

  test('should show BPM and key sync features', async ({ page }) => {
    await page.goto('/studio');
    
    // Load tracks with different BPM/keys
    await page.evaluate(() => {
      // Mock different BPM values
      window.bpmDetective = () => Math.random() > 0.5 ? 120 : 128;
      
      const inputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      inputs.forEach((input, index) => {
        const mockFile = new File(['mock audio data'], `sync-track-${index}.mp3`, { type: 'audio/mpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    
    // Wait for tracks to load
    await expect(page.locator('text=sync-track-0.mp3')).toBeVisible();
    
    // Verify sync buttons exist
    await expect(page.locator('button:has-text("Key Sync")')).toBeVisible();
    await expect(page.locator('button:has-text("BPM Sync")')).toBeVisible();
    
    // Test sync functionality
    await page.click('button:has-text("BPM Sync")');
    await page.click('button:has-text("Key Sync")');
    
    // Verify BPM/Key status badges
    await expect(page.locator('text*="BPM"')).toBeVisible();
    await expect(page.locator('text*="Key"')).toBeVisible();
  });

  test('should handle key shift controls', async ({ page }) => {
    await page.goto('/studio');
    
    // Load track
    await page.evaluate(() => {
      const mockFile = new File(['mock audio data'], 'keyshift-test.mp3', { type: 'audio/mpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    await expect(page.locator('text=keyshift-test.mp3')).toBeVisible();
    
    // Find key shift controls
    const keyShiftMinus = page.locator('button').filter({ hasText: '-' }).first();
    const keyShiftPlus = page.locator('button').filter({ hasText: '+' }).first();
    
    // Test key shift controls
    await keyShiftPlus.click();
    await expect(page.locator('text=+1 st')).toBeVisible();
    
    await keyShiftMinus.click();
    await keyShiftMinus.click();
    await expect(page.locator('text=-1 st')).toBeVisible();
  });
});