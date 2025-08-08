import React from 'react';
import { Track } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart } from 'lucide-react';

export const TrackRow: React.FC<{ track: Track; onLikeToggle?: (id: string) => void }>
  = ({ track, onLikeToggle }) => (
  <Card className="p-3 glass flex items-center justify-between rounded-xl">
    <div className="min-w-0">
      <div className="font-medium truncate">{track.title || track.name}</div>
      <div className="text-xs text-muted-foreground truncate">{track.artist || 'Unknown'}</div>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {track.bpm ? <Badge variant="outline">{track.bpm} BPM</Badge> : <Badge variant="secondary">Analisando…</Badge>}
        {track.key_signature && <Badge variant="outline">Key {track.key_signature}</Badge>}
        {track.genre && <Badge variant="outline">{track.genre}</Badge>}
      </div>
    </div>
    <div className="shrink-0 flex items-center gap-3">
      <div className="flex items-center text-xs text-muted-foreground"><Clock className="h-3 w-3 mr-1"/>{track.duration}</div>
      {onLikeToggle && (
        <button
          aria-label="Curtir"
          onClick={() => onLikeToggle(track.id)}
          className={`p-2 rounded-lg transition-smooth ${track.is_liked ? 'bg-primary/20 text-primary' : 'hover:bg-muted/60'}`}
        >
          <Heart className={`h-4 w-4 ${track.is_liked ? '' : 'text-muted-foreground'}`} />
        </button>
      )}
    </div>
  </Card>
);

