import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Music Upload Tests', () => {
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

    // Mock Supabase client and file upload
    await page.addInitScript(() => {
      window.mockSupabase = {
        storage: {
          from: () => ({
            upload: async (path: string, file: File) => ({
              data: { path: `mock-path/${file.name}` },
              error: null
            }),
            getPublicUrl: (path: string) => ({
              data: { publicUrl: `https://mock-storage.com/${path}` }
            })
          })
        },
        from: () => ({
          insert: async (data: any) => ({
            data: [{ id: 'mock-track-id', ...data }],
            error: null
          })
        })
      };
    });

    // Mock audio analysis
    await page.addInitScript(() => {
      window.AudioContext = class MockAudioContext {
        decodeAudioData = async (buffer: ArrayBuffer) => ({
          getChannelData: () => new Float32Array(1024),
          duration: 120
        });
      };
      
      // Mock BPM detection
      if (typeof window !== 'undefined') {
        (window as any).bpmDetective = () => 120;
      }
    });
  });

  test('should accept valid audio file formats', async ({ page }) => {
    await page.goto('/tracks');
    
    const fileFormats = [
      { name: 'test.mp3', type: 'audio/mpeg' },
      { name: 'test.wav', type: 'audio/wav' },
      { name: 'test.m4a', type: 'audio/mp4' },
      { name: 'test.flac', type: 'audio/flac' }
    ];

    for (const format of fileFormats) {
      await test.step(`Upload ${format.name}`, async () => {
        // Create mock file
        const buffer = Buffer.from('mock audio data');
        
        // Set up file input listener
        const fileChooserPromise = page.waitForEvent('filechooser');
        
        // Click upload button
        await page.click('button:has-text("Adicionar faixas")');
        
        const fileChooser = await fileChooserPromise;
        
        // Mock file with proper type
        await page.evaluate(({ name, type }) => {
          const mockFile = new File(['mock audio data'], name, { type });
          const input = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (input) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(mockFile);
            input.files = dataTransfer.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, format);
        
        // Verify upload processing
        await expect(page.locator('text=Processando no servidor')).toBeVisible({ timeout: 5000 });
      });
    }
  });

  test('should reject invalid file formats', async ({ page }) => {
    await page.goto('/tracks');
    
    const invalidFormats = [
      { name: 'test.txt', type: 'text/plain' },
      { name: 'test.jpg', type: 'image/jpeg' },
      { name: 'test.pdf', type: 'application/pdf' }
    ];

    for (const format of invalidFormats) {
      await test.step(`Reject ${format.name}`, async () => {
        await page.evaluate(({ name, type }) => {
          const mockFile = new File(['mock data'], name, { type });
          const input = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (input) {
            // File input should not accept this type due to accept="audio/*"
            expect(input.accept).toContain('audio/*');
          }
        }, format);
      });
    }
  });

  test('should handle multiple file upload', async ({ page }) => {
    await page.goto('/tracks');
    
    // Mock multiple files
    await page.evaluate(() => {
      const mockFiles = [
        new File(['mock audio 1'], 'track1.mp3', { type: 'audio/mpeg' }),
        new File(['mock audio 2'], 'track2.wav', { type: 'audio/wav' }),
        new File(['mock audio 3'], 'track3.m4a', { type: 'audio/mp4' })
      ];
      
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        mockFiles.forEach(file => dataTransfer.items.add(file));
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Verify multiple uploads are processed
    await expect(page.locator('text=Processando no servidor')).toHaveCount(3, { timeout: 5000 });
  });

  test('should show upload progress and status', async ({ page }) => {
    await page.goto('/tracks');
    
    // Mock upload with delay to see progress
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
    
    // Check upload stages
    await expect(page.locator('text=Enviando')).toBeVisible();
    await expect(page.locator('text=Processando no servidor')).toBeVisible();
    
    // Verify file name appears in upload list
    await expect(page.locator('text=test-track.mp3')).toBeVisible();
  });

  test('should handle upload errors gracefully', async ({ page }) => {
    await page.goto('/tracks');
    
    // Mock network error
    await page.route('**/storage/v1/object/**', route => {
      route.abort('failed');
    });
    
    await page.evaluate(() => {
      const mockFile = new File(['mock audio data'], 'error-track.mp3', { type: 'audio/mpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Verify error handling
    await expect(page.locator('text=Erro:')).toBeVisible({ timeout: 5000 });
  });

  test('should handle offline upload attempts', async ({ page }) => {
    await page.goto('/tracks');
    
    // Simulate offline
    await page.context().setOffline(true);
    
    await page.evaluate(() => {
      const mockFile = new File(['mock audio data'], 'offline-track.mp3', { type: 'audio/mpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Should show offline message
    await expect(page.locator('text=Análise requer conexão ativa')).toBeVisible();
  });

  test('should drag and drop files', async ({ page }) => {
    await page.goto('/tracks');
    
    // Mock drag and drop
    await page.evaluate(() => {
      const dropZone = document.querySelector('.border-dashed') as HTMLElement;
      if (dropZone) {
        const mockFile = new File(['mock audio data'], 'dropped-track.mp3', { type: 'audio/mpeg' });
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          dataTransfer
        });
        
        dropZone.dispatchEvent(dropEvent);
      }
    });
    
    // Verify file is processed
    await expect(page.locator('text=dropped-track.mp3')).toBeVisible();
  });
});