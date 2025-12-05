import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Play, Plus, RefreshCw } from 'lucide-react';
import { useTracks } from '@/hooks/useTracks';
import { usePlayer } from '@/contexts/PlayerContext';
import { getAudioUrl } from '@/utils/storage';

interface Recommendation {
  trackId: string;
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
  reason: string;
  score: number;
}

interface SmartRecommendationsProps {
  currentTrackId?: string;
  maxRecommendations?: number;
}

export function SmartRecommendations({ 
  currentTrackId, 
  maxRecommendations = 5 
}: SmartRecommendationsProps) {
  const { tracks } = useTracks();
  const { playTrack } = usePlayer();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateRecommendations = () => {
    setIsLoading(true);

    // Get current track if specified
    const currentTrack = currentTrackId 
      ? tracks.find(t => t.id === currentTrackId)
      : null;

    // Filter out current track and tracks without analysis
    const availableTracks = tracks.filter(t => 
      t.id !== currentTrackId && 
      t.bpm && 
      t.key_signature
    );

    if (availableTracks.length === 0) {
      setRecommendations([]);
      setIsLoading(false);
      return;
    }

    // Calculate compatibility scores
    const scored = availableTracks.map(track => {
      let score = 50; // Base score
      let reasons: string[] = [];

      if (currentTrack) {
        // BPM compatibility
        if (currentTrack.bpm && track.bpm) {
          const bpmDiff = Math.abs(currentTrack.bpm - track.bpm);
          if (bpmDiff <= 5) {
            score += 30;
            reasons.push('BPM similar');
          } else if (bpmDiff <= 10) {
            score += 20;
            reasons.push('BPM compatível');
          } else if (bpmDiff <= 15) {
            score += 10;
          }
        }

        // Key compatibility (simplified Camelot)
        if (currentTrack.key_signature && track.key_signature) {
          const compatibleKeys = getCompatibleKeys(currentTrack.key_signature);
          if (compatibleKeys.includes(track.key_signature)) {
            score += 25;
            reasons.push('Tom harmônico');
          }
        }

        // Energy compatibility
        if (currentTrack.energy_level && track.energy_level) {
          const energyDiff = Math.abs(currentTrack.energy_level - track.energy_level);
          if (energyDiff <= 2) {
            score += 15;
            reasons.push('Energia similar');
          }
        }
      } else {
        // No current track - recommend based on track quality
        if (track.bpm && track.bpm >= 120 && track.bpm <= 130) {
          score += 15;
          reasons.push('BPM popular');
        }
        if (track.energy_level && track.energy_level >= 7) {
          score += 10;
          reasons.push('Alta energia');
        }
        reasons.push('Bem analisado');
      }

      return {
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        bpm: track.bpm,
        key: track.key_signature,
        reason: reasons.slice(0, 2).join(' • ') || 'Recomendado',
        score: Math.min(100, score)
      };
    });

    // Sort by score and take top N
    const topRecommendations = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations);

    setRecommendations(topRecommendations);
    setIsLoading(false);
  };

  const getCompatibleKeys = (key: string): string[] => {
    // Simplified Camelot wheel compatibility
    const camelotMap: Record<string, string[]> = {
      'C major': ['C major', 'G major', 'F major', 'A minor'],
      'C minor': ['C minor', 'G minor', 'F minor', 'Eb major'],
      'G major': ['G major', 'D major', 'C major', 'E minor'],
      'D major': ['D major', 'A major', 'G major', 'B minor'],
      'A major': ['A major', 'E major', 'D major', 'F# minor'],
      'E major': ['E major', 'B major', 'A major', 'C# minor'],
      'B major': ['B major', 'F# major', 'E major', 'G# minor'],
      'F major': ['F major', 'C major', 'Bb major', 'D minor'],
      'Bb major': ['Bb major', 'F major', 'Eb major', 'G minor'],
      'Eb major': ['Eb major', 'Bb major', 'Ab major', 'C minor'],
      'Ab major': ['Ab major', 'Eb major', 'Db major', 'F minor'],
      'Db major': ['Db major', 'Ab major', 'Gb major', 'Bb minor'],
    };
    return camelotMap[key] || [key];
  };

  useEffect(() => {
    if (tracks.length > 0) {
      generateRecommendations();
    }
  }, [tracks, currentTrackId]);

  const handlePlay = async (rec: Recommendation) => {
    const track = tracks.find(t => t.id === rec.trackId);
    if (!track?.file_path) return;

    try {
      const audioUrl = await getAudioUrl(track.file_path);
      
      const parseDuration = (dur: string) => {
        if (!dur) return 180;
        const parts = dur.split(':').map(Number);
        return parts.length === 2 ? parts[0] * 60 + parts[1] : 180;
      };

      playTrack({
        id: track.id,
        title: track.title,
        artist: track.artist,
        audioUrl,
        duration: parseDuration(track.duration)
      });
    } catch (error) {
      console.error('Error playing recommended track:', error);
    }
  };

  if (tracks.length === 0) {
    return null;
  }

  return (
    <Card className="glass glass-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Recomendações IA</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={generateRecommendations}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Faça upload e analise mais faixas para receber recomendações personalizadas.
        </p>
      ) : (
        <div className="space-y-2">
          {recommendations.map((rec) => (
            <div 
              key={rec.trackId}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{rec.title}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{rec.artist}</span>
                  {rec.bpm && <span>• {rec.bpm} BPM</span>}
                  {rec.key && <span>• {rec.key}</span>}
                </div>
                <div className="mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {rec.reason}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="text-xs text-primary font-medium">{rec.score}%</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handlePlay(rec)}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
