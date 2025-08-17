import { describe, it, expect } from 'vitest';
import fs from 'fs';

// Validate SPA fallback for offline navigation in hosting config

describe('SPA fallback (Netlify)', () => {
  it('has /* -> /index.html 200 redirect', () => {
    const conf = fs.readFileSync('netlify.toml', 'utf-8');
    expect(conf).toContain('[[redirects]]');
    expect(conf).toContain('from = "/*"');
    expect(conf).toContain('to = "/index.html"');
    expect(conf).toContain('status = 200');
  });
});
