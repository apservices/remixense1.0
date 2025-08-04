import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  RotateCcw, 
  Gauge,
  Headphones,
  Radio,
  Music2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  bpm: number | null;
  key_signature: string | null;
  genre: string | null;
  energy_level: number | null;
}

interface DualPlayerProps {
  leftTrack?: Track;
  rightTrack?: Track;
  onTrackSelect?: (side: 'left' | 'right') => void;
  className?: string;
}

export const DualPlayer: React.FC<DualPlayerProps> = ({
  leftTrack,
  rightTrack,
  onTrackSelect,
  className
}) => {
  // Player states
  const [leftPlaying, setLeftPlaying] = useState(false);
  const [rightPlaying, setRightPlaying] = useState(false);
  const [leftTime, setLeftTime] = useState(0);
  const [rightTime, setRightTime] = useState(0);
  const [leftVolume, setLeftVolume] = useState(75);
  const [rightVolume, setRightVolume] = useState(75);
  const [crossfader, setCrossfader] = useState(50);
  const [sync, setSync] = useState(false);
  
  // EQ states
  const [leftEQ, setLeftEQ] = useState({ high: 0, mid: 0, low: 0 });
  const [rightEQ, setRightEQ] = useState({ high: 0, mid: 0, low: 0 });

  // Waveform data simulation
  const generateWaveform = (trackId?: string) => {
    if (!trackId) return Array(100).fill(0.1);
    return Array.from({ length: 100 }, (_, i) => {
      const base = Math.sin(i * 0.1) * 0.4 + 0.5;
      const noise = (Math.random() - 0.5) * 0.3;
      return Math.max(0.1, Math.min(1, base + noise));
    });
  };

  const leftWaveform = generateWaveform(leftTrack?.id);
  const rightWaveform = generateWaveform(rightTrack?.id);

  // Duration helpers
  const getDurationInSeconds = (duration: string) => {
    const [min, sec] = duration.split(':').map(Number);
    return min * 60 + sec;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Playback simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (leftPlaying || rightPlaying) {
      interval = setInterval(() => {
        if (leftPlaying && leftTrack) {
          setLeftTime(prev => {
            const maxTime = getDurationInSeconds(leftTrack.duration);
            if (prev >= maxTime) {
              setLeftPlaying(false);
              return 0;
            }
            return prev + 0.1;
          });
        }
        if (rightPlaying && rightTrack) {
          setRightTime(prev => {
            const maxTime = getDurationInSeconds(rightTrack.duration);
            if (prev >= maxTime) {
              setRightPlaying(false);
              return 0;
            }
            return prev + 0.1;
          });
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [leftPlaying, rightPlaying, leftTrack, rightTrack]);

  // BPM Sync functionality
  const calculateBPMDifference = () => {
    if (!leftTrack?.bpm || !rightTrack?.bpm) return null;
    return Math.abs(leftTrack.bpm - rightTrack.bpm);
  };

  const getSyncColor = () => {
    const diff = calculateBPMDifference();
    if (!diff) return 'text-muted-foreground';
    if (diff <= 2) return 'text-neon-green';
    if (diff <= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Deck component
  const Deck: React.FC<{
    side: 'left' | 'right';
    track?: Track;
    isPlaying: boolean;
    setPlaying: (playing: boolean) => void;
    time: number;
    setTime: (time: number) => void;
    volume: number;
    setVolume: (volume: number) => void;
    eq: { high: number; mid: number; low: number };
    setEQ: (eq: { high: number; mid: number; low: number }) => void;
    waveform: number[];
  }> = ({ 
    side, 
    track, 
    isPlaying, 
    setPlaying, 
    time, 
    setTime, 
    volume, 
    setVolume, 
    eq, 
    setEQ, 
    waveform 
  }) => {
    const maxTime = track ? getDurationInSeconds(track.duration) : 180;
    const progress = (time / maxTime) * 100;

    return (
      <Card className="glass border-glass-border p-4 space-y-4">
        {/* Track Info */}
        <div className="text-center space-y-2">
          {track ? (
            <>
              <h4 className="font-medium text-foreground truncate">{track.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
              <div className="flex justify-center gap-2">
                {track.bpm && (
                  <Badge variant="outline" className="text-neon-green border-neon-green/30">
                    {track.bpm} BPM
                  </Badge>
                )}
                {track.key_signature && (
                  <Badge variant="outline" className="text-neon-blue border-neon-blue/30">
                    {track.key_signature}
                  </Badge>
                )}
              </div>
            </>
          ) : (
            <div className="py-8">
              <Button 
                variant="outline" 
                onClick={() => onTrackSelect?.(side)}
                className="h-16 w-full flex-col gap-2"
              >
                <Music2 className="h-6 w-6" />
                Selecionar Track
              </Button>
            </div>
          )}
        </div>

        {track && (
          <>
            {/* Waveform */}
            <div className="relative h-16 glass rounded-lg overflow-hidden">
              <div className="flex items-center justify-center h-full px-2 gap-px">
                {waveform.map((value, index) => {
                  const isPlayed = (index / waveform.length) * 100 <= progress;
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex-1 min-w-[1px] transition-all duration-75 rounded-sm",
                        isPlayed 
                          ? side === 'left' 
                            ? "bg-gradient-to-t from-neon-blue to-neon-teal" 
                            : "bg-gradient-to-t from-neon-violet to-neon-blue"
                          : "bg-muted hover:bg-primary/30"
                      )}
                      style={{ height: `${value * 80}%` }}
                    />
                  );
                })}
              </div>
              
              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                style={{ left: `${progress}%` }}
              />
            </div>

            {/* Transport Controls */}
            <div className="flex items-center justify-between">
              <Button
                variant="glass"
                size="icon"
                onClick={() => setPlaying(!isPlaying)}
                className="neon-glow"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <div className="text-center">
                <div className="text-sm font-mono text-foreground">
                  {formatTime(time)} / {track.duration}
                </div>
              </div>
              
              <Button
                variant="glass"
                size="icon"
                onClick={() => setTime(0)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Volume</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* EQ */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Radio className="h-4 w-4" />
                EQ
              </h5>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center space-y-2">
                  <label className="text-xs text-muted-foreground">HIGH</label>
                  <Slider
                    value={[eq.high]}
                    onValueChange={(value) => setEQ({ ...eq, high: value[0] })}
                    min={-20}
                    max={20}
                    step={1}
                    orientation="vertical"
                    className="h-16 mx-auto"
                  />
                  <span className="text-xs text-foreground">{eq.high}</span>
                </div>
                <div className="text-center space-y-2">
                  <label className="text-xs text-muted-foreground">MID</label>
                  <Slider
                    value={[eq.mid]}
                    onValueChange={(value) => setEQ({ ...eq, mid: value[0] })}
                    min={-20}
                    max={20}
                    step={1}
                    orientation="vertical"
                    className="h-16 mx-auto"
                  />
                  <span className="text-xs text-foreground">{eq.mid}</span>
                </div>
                <div className="text-center space-y-2">
                  <label className="text-xs text-muted-foreground">LOW</label>
                  <Slider
                    value={[eq.low]}
                    onValueChange={(value) => setEQ({ ...eq, low: value[0] })}
                    min={-20}
                    max={20}
                    step={1}
                    orientation="vertical"
                    className="h-16 mx-auto"
                  />
                  <span className="text-xs text-foreground">{eq.low}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-heading-lg text-foreground flex items-center justify-center gap-2">
          <Headphones className="h-5 w-5 text-neon-teal" />
          Dual Player
        </h2>
        <p className="text-muted-foreground">
          Mixe duas faixas simultaneamente com controle completo
        </p>
      </div>

      {/* BPM Sync Info */}
      {leftTrack && rightTrack && (
        <Card className="glass border-glass-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sincronização BPM</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-neon-blue border-neon-blue/30">
                {leftTrack.bpm} BPM
              </Badge>
              <span className={cn("text-sm font-medium", getSyncColor())}>
                Δ{calculateBPMDifference()}
              </span>
              <Badge variant="outline" className="text-neon-violet border-neon-violet/30">
                {rightTrack.bpm} BPM
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Dual Decks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Deck
          side="left"
          track={leftTrack}
          isPlaying={leftPlaying}
          setPlaying={setLeftPlaying}
          time={leftTime}
          setTime={setLeftTime}
          volume={leftVolume}
          setVolume={setLeftVolume}
          eq={leftEQ}
          setEQ={setLeftEQ}
          waveform={leftWaveform}
        />
        
        <Deck
          side="right"
          track={rightTrack}
          isPlaying={rightPlaying}
          setPlaying={setRightPlaying}
          time={rightTime}
          setTime={setRightTime}
          volume={rightVolume}
          setVolume={setRightVolume}
          eq={rightEQ}
          setEQ={setRightEQ}
          waveform={rightWaveform}
        />
      </div>

      {/* Crossfader */}
      <Card className="glass border-glass-border p-6">
        <div className="space-y-4">
          <h4 className="text-heading-sm text-foreground text-center">Crossfader</h4>
          <div className="relative">
            <Slider
              value={[crossfader]}
              onValueChange={(value) => setCrossfader(value[0])}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>A (Left)</span>
              <span>Center</span>
              <span>B (Right)</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              {crossfader < 45 ? 'Favor Left' : crossfader > 55 ? 'Favor Right' : 'Center'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};