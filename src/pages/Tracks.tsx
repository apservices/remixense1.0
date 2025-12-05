import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/AppLayout';
import { AudioLibraryPicker } from '@/components/audio/AudioLibraryPicker';
import { useAudioLibrary, AudioTrack } from '@/hooks/useAudioLibrary';
import { usePlayer } from '@/contexts/PlayerContext';
import { Music, Loader2, Sparkles, Play, Upload, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

export default function Tracks() {
  const { tracks, aiGenerations, allTracks, isLoading } = useAudioLibrary();
  const { playTrack } = usePlayer();
  const navigate = useNavigate();

  const handlePlay = (track: AudioTrack) => {
    playTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
      audioUrl: track.audioUrl,
      coverUrl: track.coverUrl,
      duration: track.duration,
    }, allTracks.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      audioUrl: t.audioUrl,
      coverUrl: t.coverUrl,
      duration: t.duration,
    })));
  };

  const renderTrackCard = (track: AudioTrack) => (
    <Card key={track.id} className="premium-card p-4 hover:scale-[1.01] transition-transform">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handlePlay(track)}
            className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center hover:scale-105 transition-transform group"
          >
            {track.source === 'suno' ? (
              <Sparkles className="h-5 w-5 text-white group-hover:hidden" />
            ) : (
              <Music className="h-5 w-5 text-white group-hover:hidden" />
            )}
            <Play className="h-5 w-5 text-white hidden group-hover:block" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{track.title}</h3>
              {track.source === 'suno' && (
                <Badge variant="secondary" className="text-[9px] px-1.5">IA</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{track.artist}</p>
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
  );

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto py-6 px-4">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Biblioteca de Áudio</h1>
            <p className="text-muted-foreground">Todas as suas faixas em um só lugar - uploads e gerações IA.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/vault')}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button onClick={() => navigate('/ai-studio')}>
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar com IA
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : allTracks.length === 0 ? (
          <Card className="premium-card p-12 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
              <Library className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Biblioteca vazia</h3>
            <p className="text-muted-foreground mb-4">Faça upload de faixas ou gere músicas com IA para começar.</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => navigate('/vault')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button onClick={() => navigate('/ai-studio')}>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar com IA
              </Button>
            </div>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                Todas ({allTracks.length})
              </TabsTrigger>
              <TabsTrigger value="uploads">
                <Music className="h-3.5 w-3.5 mr-1.5" />
                Uploads ({tracks.length})
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Geradas IA ({aiGenerations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {allTracks.map(renderTrackCard)}
            </TabsContent>

            <TabsContent value="uploads" className="space-y-3">
              {tracks.length === 0 ? (
                <Card className="premium-card p-8 text-center">
                  <p className="text-muted-foreground">Nenhum upload ainda</p>
                </Card>
              ) : (
                tracks.map(renderTrackCard)
              )}
            </TabsContent>

            <TabsContent value="ai" className="space-y-3">
              {aiGenerations.length === 0 ? (
                <Card className="premium-card p-8 text-center">
                  <p className="text-muted-foreground">Nenhuma geração IA ainda</p>
                  <Button className="mt-4" onClick={() => navigate('/ai-studio')}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar com Suno AI
                  </Button>
                </Card>
              ) : (
                aiGenerations.map(renderTrackCard)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
