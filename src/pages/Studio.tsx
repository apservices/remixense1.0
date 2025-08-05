import React, { useState } from 'react';
import { useTracks } from '@/hooks/useTracks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedTrackAnalysis } from '@/components/AdvancedTrackAnalysis';
import DualPlayer from '@/components/DualPlayer';
import { SmartMixSuggestions } from '@/components/SmartMixSuggestions';
import TrackLibrary from '@/components/TrackLibrary';
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
  const { tracks, addTrack } = useTracks();
  const [selectedTrackForAnalysis, setSelectedTrackForAnalysis] = useState<string | null>(null);
  const [leftDeckTrack, setLeftDeckTrack] = useState<string | null>(null);
  const [rightDeckTrack, setRightDeckTrack] = useState<string | null>(null);
  const [currentMixTrack, setCurrentMixTrack] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('analysis');

  // Filtros seguem normais
  const filteredTracks = Array.isArray(tracks) ? tracks.filter(track =>
    (track?.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track?.artist || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track?.genre || "").toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const selectedTrack = Array.isArray(tracks) ? tracks.find(t => t.id === selectedTrackForAnalysis) : null;
  const leftTrack = Array.isArray(tracks) ? tracks.find(t => t.id === leftDeckTrack) : null;
  const rightTrack = Array.isArray(tracks) ? tracks.find(t => t.id === rightDeckTrack) : null;
  const mixTrack = Array.isArray(tracks) ? tracks.find(t => t.id === currentMixTrack) : null;

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
    if (filteredTracks.length > 0) {
      if (side === 'left') {
        setLeftDeckTrack(filteredTracks[0].id);
      } else {
        setRightDeckTrack(filteredTracks[1]?.id || filteredTracks[0].id);
      }
    }
  };

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
              
              {/* Campo de busca */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* TrackLibrary centralizado */}
              <TrackLibrary
                tracks={filteredTracks}
                addTrack={addTrack}
                onSelect={(id) => handleTrackSelect(id, "analysis")}
              />
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
