import React, { useState } from 'react';
import { useTracks } from '@/hooks/useTracks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedTrackAnalysis } from '@/components/AdvancedTrackAnalysis';
import { DualPlayer } from '@/components/DualPlayer';
import { SmartMixSuggestions } from '@/components/SmartMixSuggestions';
import { 
  Headphones, 
  Brain, 
  BarChart3, 
  Music,
  Zap,
  Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function Studio() {
  const { tracks, loading } = useTracks();
  const [selectedTrackForAnalysis, setSelectedTrackForAnalysis] = useState<string | null>(null);
  const [leftDeckTrack, setLeftDeckTrack] = useState<string | null>(null);
  const [rightDeckTrack, setRightDeckTrack] = useState<string | null>(null);
  const [currentMixTrack, setCurrentMixTrack] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('analysis');

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTrack = tracks.find(t => t.id === selectedTrackForAnalysis);
  const leftTrack = tracks.find(t => t.id === leftDeckTrack);
  const rightTrack = tracks.find(t => t.id === rightDeckTrack);
  const mixTrack = tracks.find(t => t.id === currentMixTrack);

  const handleTrackSelect = (trackId: string, context: 'analysis' | 'left' | 'right' | 'mix') => {
    switch (context) {
      case 'analysis':
        setSelectedTrackForAnalysis(trackId);
        setActiveTab('analysis');
        break;
      case 'left':
        setLeftDeckTrack(trackId);
        setActiveTab('player');
        break;
      case 'right':
        setRightDeckTrack(trackId);
        setActiveTab('player');
        break;
      case 'mix':
        setCurrentMixTrack(trackId);
        setActiveTab('suggestions');
        break;
    }
  };

  const handleDeckSelect = (side: 'left' | 'right') => {
    // For now, just select the first available track
    if (filteredTracks.length > 0) {
      if (side === 'left') {
        setLeftDeckTrack(filteredTracks[0].id);
      } else {
        setRightDeckTrack(filteredTracks[1]?.id || filteredTracks[0].id);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="glass border-glass-border rounded-lg p-8 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full animate-glow" />
            <div className="space-y-2">
              <div className="h-4 bg-primary/20 rounded w-32" />
              <div className="h-3 bg-muted rounded w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-glass-border backdrop-blur-glass">
        <div className="px-4 py-6">
          <h1 className="text-heading-xl text-foreground mb-1 flex items-center gap-2">
            <Zap className="h-6 w-6 text-neon-teal" />
            RemiXense Studio
          </h1>
          <p className="text-muted-foreground text-sm">
            Análise avançada, mixagem inteligente e performance profissional
          </p>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Track Library */}
          <div className="xl:col-span-1">
            <Card className="glass border-glass-border p-4 h-fit sticky top-24">
              <h3 className="text-heading-sm text-foreground mb-4 flex items-center gap-2">
                <Music className="h-4 w-4 text-neon-blue" />
                Biblioteca ({tracks.length})
              </h3>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTracks.length === 0 ? (
                  <div className="text-center py-8">
                    <Music className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'Nenhum track encontrado' : 'Nenhum track na biblioteca'}
                    </p>
                  </div>
                ) : (
                  filteredTracks.map((track) => (
                    <div key={track.id} className="group">
                      <div 
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all hover:bg-primary/5",
                          selectedTrackForAnalysis === track.id 
                            ? "bg-primary/10 border-primary/30"
                            : "bg-background/50 border-glass-border"
                        )}
                      >
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-medium text-foreground text-sm truncate">
                              {track.title}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {track.artist}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 flex-wrap">
                            {track.bpm && (
                              <Badge variant="outline" className="text-xs text-neon-green border-neon-green/30">
                                {track.bpm}
                              </Badge>
                            )}
                            {track.key_signature && (
                              <Badge variant="outline" className="text-xs text-neon-blue border-neon-blue/30">
                                {track.key_signature}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Quick Action Buttons */}
                          <div className="grid grid-cols-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => handleTrackSelect(track.id, 'analysis')}
                            >
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Analisar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => handleTrackSelect(track.id, 'mix')}
                            >
                              <Brain className="h-3 w-3 mr-1" />
                              Sugerir
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Análise Avançada
                </TabsTrigger>
                <TabsTrigger value="player" className="flex items-center gap-2">
                  <Headphones className="h-4 w-4" />
                  Dual Player
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Sugestões IA
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="space-y-6">
                {selectedTrack ? (
                  <AdvancedTrackAnalysis track={selectedTrack} />
                ) : (
                  <Card className="glass border-glass-border p-12 text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-heading-lg text-foreground mb-2">
                      Análise Inteligente de Faixas
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Selecione uma faixa da sua biblioteca para ver análise espectral completa, 
                      características de mixagem e propriedades avançadas.
                    </p>
                    {filteredTracks.length > 0 && (
                      <Button
                        variant="neon"
                        onClick={() => handleTrackSelect(filteredTracks[0].id, 'analysis')}
                      >
                        Analisar Primeira Faixa
                      </Button>
                    )}
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="player" className="space-y-6">
                <DualPlayer
                  leftTrack={leftTrack}
                  rightTrack={rightTrack}
                  onTrackSelect={handleDeckSelect}
                />
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-6">
                <SmartMixSuggestions
                  currentTrack={mixTrack}
                  availableTracks={filteredTracks}
                  onSelectTrack={(track) => handleTrackSelect(track.id, 'analysis')}
                  onAddToMix={(suggestion) => {
                    console.log('Adding to mix:', suggestion);
                    // Here you would handle adding to mix queue
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}