import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  List
} from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl: string;
  duration: number;
}

interface GlobalStreamingPlayerProps {
  currentTrack?: Track;
  playlist?: Track[];
  onTrackChange?: (track: Track) => void;
}

export function GlobalStreamingPlayer({
  currentTrack,
  playlist = [],
  onTrackChange
}: GlobalStreamingPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // Load new track and play automatically
    audio.src = currentTrack.audioUrl;
    audio.load();
    
    if (isPlaying) {
      audio.play().catch(err => console.error('Play error:', err));
    }
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error('Play error:', err));
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleNext = () => {
    if (!playlist.length || !currentTrack) return;
    
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    onTrackChange?.(playlist[nextIndex]);
  };

  const handlePrevious = () => {
    if (!playlist.length || !currentTrack) return;
    
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    onTrackChange?.(playlist[prevIndex]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      
      <Card
        className={`
          fixed bottom-0 left-0 right-0 z-50
          glass glass-border border-t
          transition-all duration-300
          ${isExpanded ? 'h-screen' : 'h-24'}
        `}
      >
        {isExpanded ? (
          // Full player view
          <div className="h-full flex flex-col items-center justify-center p-8">
            <div className="max-w-md w-full space-y-6">
              {/* Cover art */}
              <div className="aspect-square rounded-lg bg-muted/20 overflow-hidden">
                {currentTrack.coverUrl ? (
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🎵
                  </div>
                )}
              </div>

              {/* Track info */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-1">{currentTrack.title}</h3>
                <p className="text-muted-foreground">{currentTrack.artist}</p>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={isShuffle ? 'text-primary' : ''}
                >
                  <Shuffle className="h-5 w-5" />
                </Button>

                <Button variant="ghost" size="icon" onClick={handlePrevious}>
                  <SkipBack className="h-6 w-6" />
                </Button>

                <Button
                  size="icon"
                  className="h-14 w-14 rounded-full neon-glow"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-7 w-7" />
                  ) : (
                    <Play className="h-7 w-7 ml-1" />
                  )}
                </Button>

                <Button variant="ghost" size="icon" onClick={handleNext}>
                  <SkipForward className="h-6 w-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={isRepeat ? 'text-primary' : ''}
                >
                  <Repeat className="h-5 w-5" />
                </Button>
              </div>

              {/* Volume & actions */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLiked(!isLiked)}
                  className={isLiked ? 'text-red-500' : ''}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="w-24"
                  />
                </div>

                <Button variant="ghost" size="icon">
                  <List className="h-5 w-5" />
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setIsExpanded(false)}
                className="w-full"
              >
                Minimizar
              </Button>
            </div>
          </div>
        ) : (
          // Mini player view
          <div className="h-full flex items-center justify-between px-4 gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="h-14 w-14 rounded bg-muted/20 flex-shrink-0 cursor-pointer"
                onClick={() => setIsExpanded(true)}
              >
                {currentTrack.coverUrl ? (
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    🎵
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{currentTrack.title}</div>
                <div className="text-sm text-muted-foreground truncate">
                  {currentTrack.artist}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrevious}>
                <SkipBack className="h-5 w-5" />
              </Button>
              
              <Button size="icon" onClick={togglePlay} className="neon-glow">
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>

              <Button variant="ghost" size="icon" onClick={handleNext}>
                <SkipForward className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? 'text-red-500' : ''}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
