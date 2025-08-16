import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Play, Shuffle, Filter, Zap } from 'lucide-react';
import { useTracks } from '@/hooks/useTracks';
import { getMixCompatibility } from '@/lib/audio/compat';
import type { Track } from '@/types';

interface EnhancedTrackLibraryProps {
  selectedTrack?: Track;
  onTrackSelect?: (track: Track) => void;
  onQuickMix?: (trackA: Track, trackB: Track) => void;
  showCompatibility?: boolean;
}

export const EnhancedTrackLibrary: React.FC<EnhancedTrackLibraryProps> = ({
  selectedTrack,
  onTrackSelect,
  onQuickMix,
  showCompatibility = true
}) => {
  const { tracks, loading } = useTracks();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'compatibility' | 'bpm' | 'name'>('compatibility');

  // Filter and sort tracks
  const filteredTracks = useMemo(() => {
    let filtered = tracks.filter(track => 
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.genre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedTrack && showCompatibility && sortBy === 'compatibility') {
      // Sort by compatibility with selected track
      filtered = filtered
        .map(track => ({
          ...track,
          compatibility: track.id === selectedTrack.id ? 0 : getMixCompatibility(selectedTrack, track)
        }))
        .sort((a, b) => (b.compatibility?.score || 0) - (a.compatibility?.score || 0));
    } else if (sortBy === 'bpm') {
      filtered.sort((a, b) => (a.bpm || 0) - (b.bpm || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [tracks, searchTerm, selectedTrack, showCompatibility, sortBy]);

  const getCompatibilityColor = (score: number) => {
    if (score >= 85) return 'hsl(var(--primary))';
    if (score >= 70) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const handleQuickMix = (track: Track) => {
    if (selectedTrack && onQuickMix) {
      onQuickMix(selectedTrack, track);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Biblioteca de Faixas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shuffle className="h-5 w-5" />
          Biblioteca de Faixas
          {selectedTrack && (
            <Badge variant="secondary" className="text-xs">
              Mixando com: {selectedTrack.title}
            </Badge>
          )}
        </CardTitle>
        
        <div className="flex gap-2">
          <Input
            placeholder="Buscar faixas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSortBy(sortBy === 'compatibility' ? 'bpm' : 'compatibility')}
            disabled={!selectedTrack}
          >
            <Filter className="h-4 w-4 mr-1" />
            {sortBy === 'compatibility' ? 'Compatibilidade' : 'BPM'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="max-h-96 overflow-y-auto space-y-2">
        {filteredTracks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shuffle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma faixa encontrada</p>
          </div>
        ) : (
          filteredTracks.map((track: any) => {
            const compatibility = track.compatibility;
            const isSelected = selectedTrack?.id === track.id;
            
            return (
              <div
                key={track.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                  ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}
                `}
                onClick={() => onTrackSelect?.(track)}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <Play className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{track.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.artist} • {track.duration}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {track.bpm && (
                      <Badge variant="outline" className="text-xs">
                        {track.bpm} BPM
                      </Badge>
                    )}
                    {track.key_signature && (
                      <Badge variant="outline" className="text-xs">
                        {track.key_signature}
                      </Badge>
                    )}
                    {track.genre && (
                      <Badge variant="secondary" className="text-xs">
                        {track.genre}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {compatibility && !isSelected && (
                  <div className="flex items-center gap-2">
                    <Badge 
                      style={{ 
                        backgroundColor: getCompatibilityColor(compatibility.score),
                        color: 'white'
                      }}
                      className="text-xs font-bold"
                    >
                      {compatibility.score}%
                    </Badge>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-8 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickMix(track);
                      }}
                    >
                      <Zap className="h-3 w-3" />
                      Mix
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};