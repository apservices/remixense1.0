import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Track {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl: string;
  duration: number;
}

interface PlayerState {
  currentTrack: Track | undefined;
  playlist: Track[];
  queue: Track[];
  history: Track[];
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  repeatMode: 'none' | 'one' | 'all';
  isShuffled: boolean;
}

interface PlayerContextType extends PlayerState {
  setCurrentTrack: (track: Track) => void;
  setPlaylist: (tracks: Track[]) => void;
  playTrack: (track: Track, playlist?: Track[]) => void;
  onTrackChange: (track: Track) => void;
  // Queue management
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  // Playback control
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  // Play registration
  registerPlay: (trackId: string) => Promise<void>;
}

const STORAGE_KEY = 'remixense_player_state';
const MAX_HISTORY = 50;

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

function loadPersistedState(): Partial<PlayerState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        volume: parsed.volume ?? 0.8,
        repeatMode: parsed.repeatMode ?? 'none',
        isShuffled: parsed.isShuffled ?? false,
        currentTrack: parsed.currentTrack,
        currentTime: parsed.currentTime ?? 0,
      };
    }
  } catch (e) {
    console.error('Failed to load player state:', e);
  }
  return {};
}

function savePersistedState(state: Partial<PlayerState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      volume: state.volume,
      repeatMode: state.repeatMode,
      isShuffled: state.isShuffled,
      currentTrack: state.currentTrack,
      currentTime: state.currentTime,
    }));
  } catch (e) {
    console.error('Failed to save player state:', e);
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const persisted = loadPersistedState();
  
  const [currentTrack, setCurrentTrackState] = useState<Track | undefined>(persisted.currentTrack);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(persisted.volume ?? 0.8);
  const [currentTime, setCurrentTimeState] = useState(persisted.currentTime ?? 0);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>(persisted.repeatMode ?? 'none');
  const [isShuffled, setIsShuffled] = useState(persisted.isShuffled ?? false);

  // Persist state changes
  useEffect(() => {
    savePersistedState({ volume, repeatMode, isShuffled, currentTrack, currentTime });
  }, [volume, repeatMode, isShuffled, currentTrack, currentTime]);

  const setCurrentTrack = useCallback((track: Track) => {
    // Add current track to history before changing
    if (currentTrack) {
      setHistory(prev => {
        const filtered = prev.filter(t => t.id !== currentTrack.id);
        return [currentTrack, ...filtered].slice(0, MAX_HISTORY);
      });
    }
    setCurrentTrackState(track);
    setCurrentTimeState(0);
  }, [currentTrack]);

  const playTrack = useCallback((track: Track, newPlaylist?: Track[]) => {
    setCurrentTrack(track);
    if (newPlaylist) {
      setPlaylist(newPlaylist);
    }
    setIsPlaying(true);
  }, [setCurrentTrack]);

  const onTrackChange = useCallback((track: Track) => {
    setCurrentTrackState(track);
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((trackId: string) => {
    setQueue(prev => prev.filter(t => t.id !== trackId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const playNext = useCallback(() => {
    // First check queue
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(prev => prev.slice(1));
      setCurrentTrack(nextTrack);
      return;
    }

    // Then check playlist
    if (playlist.length === 0 || !currentTrack) return;

    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    
    if (isShuffled) {
      // Random next track (excluding current)
      const availableTracks = playlist.filter(t => t.id !== currentTrack.id);
      if (availableTracks.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableTracks.length);
        setCurrentTrack(availableTracks[randomIndex]);
      }
      return;
    }

    let nextIndex = currentIndex + 1;
    
    if (nextIndex >= playlist.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setCurrentTrack(playlist[nextIndex]);
  }, [queue, playlist, currentTrack, isShuffled, repeatMode, setCurrentTrack]);

  const playPrevious = useCallback(() => {
    // If we're more than 3 seconds into the track, restart it
    if (currentTime > 3) {
      setCurrentTimeState(0);
      return;
    }

    // Check history
    if (history.length > 0) {
      const prevTrack = history[0];
      setHistory(prev => prev.slice(1));
      // Don't add to history when going back
      setCurrentTrackState(prevTrack);
      return;
    }

    // Fallback to playlist
    if (playlist.length === 0 || !currentTrack) return;

    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    let prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = playlist.length - 1;
      } else {
        return;
      }
    }

    setCurrentTrackState(playlist[prevIndex]);
  }, [currentTime, history, playlist, currentTrack, repeatMode]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.max(0, Math.min(1, v)));
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    setCurrentTimeState(time);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => !prev);
  }, []);

  // Register play in database (call after 30s of playback)
  const registerPlay = useCallback(async (trackId: string) => {
    if (!user) return;
    
    try {
      await supabase.from('plays').insert({
        user_id: user.id,
        content_id: trackId,
        content_type: 'track',
        played_at: new Date().toISOString(),
        duration_listened: 30,
      });
    } catch (error) {
      console.error('Failed to register play:', error);
    }
  }, [user]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        playlist,
        queue,
        history,
        isPlaying,
        volume,
        currentTime,
        repeatMode,
        isShuffled,
        setCurrentTrack,
        setPlaylist,
        playTrack,
        onTrackChange,
        addToQueue,
        removeFromQueue,
        clearQueue,
        playNext,
        playPrevious,
        setIsPlaying,
        setVolume,
        setCurrentTime,
        toggleRepeat,
        toggleShuffle,
        registerPlay,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
}
