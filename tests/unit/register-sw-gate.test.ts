import { describe, it, expect } from 'vitest';
import fs from 'fs';

// Ensures SW registration is gated to production and points to /sw.js

describe('register-sw gating', () => {
  const file = 'src/pwa/register-sw.ts';
  const src = fs.readFileSync(file, 'utf-8');

  it('checks for PROD gate', () => {
    expect(src).toMatch(/import\.meta\s*&&\s*import\.meta\.env\s*&&\s*import\.meta\.env\.PROD/);
  });

  it('registers the expected file', () => {
    expect(src).toMatch(/register\('\/sw\.js'\)/);
  });
});
