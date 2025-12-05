// V3 Dynamic Theme based on BPM/Energy
import { useEffect, useState, useCallback } from 'react';

interface ThemeConfig {
  gradient: string;
  accentHue: number;
  pulseSpeed: number;
  glowIntensity: number;
}

const energyThemes: Record<'low' | 'medium' | 'high' | 'extreme', ThemeConfig> = {
  low: {
    gradient: 'linear-gradient(135deg, hsl(220, 70%, 50%) 0%, hsl(280, 70%, 50%) 100%)',
    accentHue: 250,
    pulseSpeed: 2,
    glowIntensity: 0.3
  },
  medium: {
    gradient: 'linear-gradient(135deg, hsl(280, 80%, 55%) 0%, hsl(190, 80%, 55%) 100%)',
    accentHue: 280,
    pulseSpeed: 1.5,
    glowIntensity: 0.5
  },
  high: {
    gradient: 'linear-gradient(135deg, hsl(300, 85%, 55%) 0%, hsl(30, 85%, 55%) 100%)',
    accentHue: 300,
    pulseSpeed: 1,
    glowIntensity: 0.7
  },
  extreme: {
    gradient: 'linear-gradient(135deg, hsl(0, 90%, 60%) 0%, hsl(60, 90%, 55%) 100%)',
    accentHue: 0,
    pulseSpeed: 0.5,
    glowIntensity: 1
  }
};

export function useDynamicTheme() {
  const [bpm, setBpm] = useState(120);
  const [energy, setEnergy] = useState<'low' | 'medium' | 'high' | 'extreme'>('medium');
  const [theme, setTheme] = useState<ThemeConfig>(energyThemes.medium);
  const [isActive, setIsActive] = useState(false);

  // Calculate energy level from BPM
  const calculateEnergy = useCallback((currentBpm: number): 'low' | 'medium' | 'high' | 'extreme' => {
    if (currentBpm < 90) return 'low';
    if (currentBpm < 128) return 'medium';
    if (currentBpm < 150) return 'high';
    return 'extreme';
  }, []);

  // Update theme based on BPM
  useEffect(() => {
    const newEnergy = calculateEnergy(bpm);
    setEnergy(newEnergy);
    setTheme(energyThemes[newEnergy]);
  }, [bpm, calculateEnergy]);

  // Apply CSS variables to document
  useEffect(() => {
    if (!isActive) return;

    const root = document.documentElement;
    root.style.setProperty('--dynamic-gradient', theme.gradient);
    root.style.setProperty('--dynamic-accent-hue', theme.accentHue.toString());
    root.style.setProperty('--dynamic-pulse-speed', `${theme.pulseSpeed}s`);
    root.style.setProperty('--dynamic-glow-intensity', theme.glowIntensity.toString());

    // Add pulse animation class
    root.classList.add('dynamic-theme-active');

    return () => {
      root.classList.remove('dynamic-theme-active');
    };
  }, [theme, isActive]);

  // Pulse animation based on BPM
  useEffect(() => {
    if (!isActive) return;

    const beatDuration = 60000 / bpm; // ms per beat
    const root = document.documentElement;
    root.style.setProperty('--beat-duration', `${beatDuration}ms`);

  }, [bpm, isActive]);

  const updateBpm = useCallback((newBpm: number) => {
    setBpm(Math.max(60, Math.min(200, newBpm)));
  }, []);

  const toggleActive = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  return {
    bpm,
    energy,
    theme,
    isActive,
    updateBpm,
    toggleActive,
    setIsActive
  };
}

// CSS to add to index.css for dynamic theme support
export const dynamicThemeCSS = `
  .dynamic-theme-active {
    --primary: var(--dynamic-accent-hue) 80% 55%;
  }

  .dynamic-theme-active .pulse-with-beat {
    animation: beat-pulse var(--beat-duration) ease-in-out infinite;
  }

  @keyframes beat-pulse {
    0%, 100% { 
      transform: scale(1); 
      opacity: 1;
    }
    50% { 
      transform: scale(1.02); 
      opacity: 0.9;
    }
  }

  .dynamic-gradient-bg {
    background: var(--dynamic-gradient);
  }

  .dynamic-glow {
    box-shadow: 0 0 calc(20px * var(--dynamic-glow-intensity)) 
                hsl(var(--dynamic-accent-hue) 80% 50% / 0.5);
  }
`;
