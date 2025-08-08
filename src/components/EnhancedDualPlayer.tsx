import React, { useEffect, useMemo, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Play, Pause, Upload, Volume2, Rewind, FastForward, ChevronLeft, ChevronRight, Wand2, Music2 } from "lucide-react";
import bpmDetective from "bpm-detective";

interface DeckState {
  file?: File;
  url?: string;
  title?: string;
  bpm?: number | null;
  key?: string | null;
  ws?: WaveSurfer | null;
  volume: number; // 0..1
  isReady: boolean;
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function EnhancedDualPlayer() {
  const leftContainer = useRef<HTMLDivElement>(null);
  const rightContainer = useRef<HTMLDivElement>(null);

  const [left, setLeft] = useState<DeckState>({ volume: 0.9, isReady: false });
  const [right, setRight] = useState<DeckState>({ volume: 0.9, isReady: false });
  const [crossfader, setCrossfader] = useState(0.5); // 0 left .. 1 right
  const [isPlaying, setIsPlaying] = useState(false);

  // Compute equal-power volumes from crossfader
  const { leftGain, rightGain } = useMemo(() => {
    // equal-power curve
    const l = Math.cos(crossfader * Math.PI / 2) ** 2;
    const r = Math.sin(crossfader * Math.PI / 2) ** 2;
    return { leftGain: l, rightGain: r };
  }, [crossfader]);

  useEffect(() => {
    left.ws?.setVolume((left.volume ?? 1) * leftGain);
    right.ws?.setVolume((right.volume ?? 1) * rightGain);
  }, [leftGain, rightGain, left.volume, right.volume, left.ws, right.ws]);

  const loadFileToDeck = async (side: "left" | "right") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = async (e: any) => {
      const file = e.target.files[0] as File;
      if (!file) return;
      const url = URL.createObjectURL(file);

      // Build wavesurfer instance
      const container = side === "left" ? leftContainer.current : rightContainer.current;
      if (!container) return;

      const root = getComputedStyle(document.documentElement);
      const waveColor = `hsl(${root.getPropertyValue('--muted').trim()})`;
      const progressColor = `hsl(${root.getPropertyValue('--primary').trim()})`;
      const cursorColor = `hsl(${root.getPropertyValue('--neon-teal').trim()})`;

      const ws = WaveSurfer.create({
        container,
        height: 80,
        waveColor,
        progressColor,
        cursorColor,
        normalize: true,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
      });

      ws.on('ready', () => {
        if (side === 'left') {
          setLeft((prev) => ({ ...prev, isReady: true }));
        } else {
          setRight((prev) => ({ ...prev, isReady: true }));
        }
      });

      ws.load(url);

      // Analyze BPM quickly in background
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const bpm = Math.round(bpmDetective(audioBuffer.getChannelData(0)));

      const deckUpdate: Partial<DeckState> = { file, url, title: file.name, bpm, ws };
      if (side === "left") setLeft((p) => ({ ...p, ...deckUpdate } as DeckState));
      else setRight((p) => ({ ...p, ...deckUpdate } as DeckState));
    };
    input.click();
  };

  const togglePlay = () => {
    if (left.ws) left.ws.playPause();
    if (right.ws) right.ws.playPause();
    setIsPlaying((p) => !p);
  };

  const nudge = (side: 'left' | 'right', seconds: number) => {
    const ws = side === 'left' ? left.ws : right.ws;
    if (!ws) return;
    const dur = ws.getDuration();
    const pos = ws.getCurrentTime();
    const next = Math.max(0, Math.min(dur, pos + seconds));
    ws.setTime(next);
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-heading-xl">Dual Player</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => loadFileToDeck('left')} className="gap-2"><Upload className="h-4 w-4"/> Carregar A</Button>
          <Button variant="secondary" onClick={() => loadFileToDeck('right')} className="gap-2"><Upload className="h-4 w-4"/> Carregar B</Button>
        </div>
      </header>

      <Card className="glass">
        <CardContent className="pt-6 space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="default" onClick={togglePlay} className="gap-2">
              {isPlaying ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
              {isPlaying ? 'Pausar' : 'Tocar ambos'}
            </Button>
            <Button variant="outline" size="sm" className="gap-2"><Wand2 className="h-4 w-4"/>Key Sync</Button>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Music2 className="h-4 w-4"/>
              Key Shift
              <div className="flex items-center ml-1">
                <Button variant="outline" size="sm" className="px-2">-</Button>
                <Button variant="outline" size="sm" className="px-2 ml-1">+</Button>
              </div>
            </div>
          </div>

          {/* Decks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Deck */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{left.title || 'Deck A'}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <Badge variant="outline">{left.bpm ? `${left.bpm} BPM` : '—'}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => nudge('left', -2)}><Rewind className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" onClick={() => nudge('left', 2)}><FastForward className="h-4 w-4"/></Button>
                </div>
              </div>
              <div ref={leftContainer} className="h-24 rounded-lg glass"/>
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground"/>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={left.volume}
                  onChange={(e) => setLeft((p) => ({ ...p, volume: Number(e.target.value) }))}
                  className="w-40 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Right Deck */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{right.title || 'Deck B'}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <Badge variant="outline">{right.bpm ? `${right.bpm} BPM` : '—'}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => nudge('right', -2)}><Rewind className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" onClick={() => nudge('right', 2)}><FastForward className="h-4 w-4"/></Button>
                </div>
              </div>
              <div ref={rightContainer} className="h-24 rounded-lg glass"/>
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground"/>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={right.volume}
                  onChange={(e) => setRight((p) => ({ ...p, volume: Number(e.target.value) }))}
                  className="w-40 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Crossfader */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>A</span>
              <span>Crossfader</span>
              <span>B</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={crossfader}
              onChange={(e) => setCrossfader(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
