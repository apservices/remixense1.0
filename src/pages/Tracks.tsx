import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/AppLayout';
import { Music, Loader2 } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number | null;
  key_signature: string | null;
  energy_level: number | null;
  genre: string | null;
  duration: string;
  created_at: string;
}

export default function Tracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('id,title,artist,bpm,key_signature,energy_level,genre,duration,created_at')
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (error) {
          console.error('Erro ao carregar faixas:', error.message);
        } else {
          setTracks(data ?? []);
        }
        setLoading(false);
      }
    })();
    return () => { cancelled = true };
  }, []);

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto py-6 px-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold gradient-text">Minhas Faixas</h1>
          <p className="text-muted-foreground">Gerencie e analise suas faixas enviadas.</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tracks.length === 0 ? (
          <Card className="premium-card p-12 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
              <Music className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhuma faixa encontrada</h3>
            <p className="text-muted-foreground">Faça upload de suas primeiras faixas para começar.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tracks.map((track) => (
              <Card key={track.id} className="premium-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                      <Music className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">{track.title || 'Sem título'}</h3>
                      <p className="text-sm text-muted-foreground">{track.artist || 'Artista desconhecido'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {track.bpm && (
                      <Badge variant="secondary">{track.bpm} BPM</Badge>
                    )}
                    {track.key_signature && (
                      <Badge variant="outline">{track.key_signature}</Badge>
                    )}
                    {track.genre && (
                      <Badge className="bg-primary/20 text-primary">{track.genre}</Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
