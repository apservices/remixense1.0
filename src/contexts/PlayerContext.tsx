import { createContext, useContext, useState, ReactNode } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl: string;
  duration: number;
}

interface PlayerContextType {
  currentTrack: Track | undefined;
  playlist: Track[];
  setCurrentTrack: (track: Track) => void;
  setPlaylist: (tracks: Track[]) => void;
  playTrack: (track: Track, playlist?: Track[]) => void;
  onTrackChange: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track>();
  const [playlist, setPlaylist] = useState<Track[]>([]);

  const playTrack = (track: Track, newPlaylist?: Track[]) => {
    setCurrentTrack(track);
    if (newPlaylist) {
      setPlaylist(newPlaylist);
    }
  };

  const onTrackChange = (track: Track) => {
    setCurrentTrack(track);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        playlist,
        setCurrentTrack,
        setPlaylist,
        playTrack,
        onTrackChange
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
