
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Music, Upload as UploadIcon, Settings, Users } from 'lucide-react';
import { AudioUploader } from './AudioUploader';
import { AudioPlayer } from './AudioPlayer';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { supabase } from '@/integrations/supabase/client';
import { Track } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function AudioManagementDashboard() {
  const { profile, isAdmin, loading } = useRoleAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [tracksLoading, setTracksLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      loadTracks();
    }
  }, [profile]);

  useEffect(() => {
    // Filter tracks based on search query
    if (searchQuery.trim()) {
      const filtered = tracks.filter(track =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTracks(filtered);
    } else {
      setFilteredTracks(tracks);
    }
  }, [tracks, searchQuery]);

  const loadTracks = async () => {
    if (!profile) return;

    setTracksLoading(true);
    try {
      let query = supabase
        .from('tracks')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // If admin, load all tracks; otherwise, load only user's tracks
      if (!isAdmin) {
        query = query.eq('user_id', profile.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error('Error loading tracks:', error);
      toast({
        title: "Erro ao carregar faixas",
        description: "Não foi possível carregar as faixas de áudio.",
        variant: "destructive"
      });
    } finally {
      setTracksLoading(false);
    }
  };

  const handleUploadComplete = (trackId: string) => {
    // Reload tracks to show the new upload
    loadTracks();
    toast({
      title: "Upload concluído!",
      description: "Sua faixa foi adicionada com sucesso."
    });
  };

  const handleDeleteTrack = async (trackId: string) => {
    try {
      const { error } = await supabase
        .from('tracks')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', trackId);

      if (error) throw error;

      // Remove from local state
      setTracks(prev => prev.filter(t => t.id !== trackId));
      if (selectedTrack?.id === trackId) {
        setSelectedTrack(null);
      }

      toast({
        title: "Faixa removida",
        description: "A faixa foi movida para a lixeira."
      });
    } catch (error) {
      console.error('Error deleting track:', error);
      toast({
        title: "Erro ao remover faixa",
        description: "Não foi possível remover a faixa.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
        <p className="text-muted-foreground">
          Você precisa estar logado para acessar o dashboard de áudio.
        </p>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Áudio</h1>
          <p className="text-muted-foreground">
            Gerencie suas faixas de áudio e faça uploads
            {isAdmin && ' • Painel Administrativo'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {profile.credits_remaining} créditos
          </Badge>
          {isAdmin && (
            <Badge variant="default">
              <Users className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <Tabs defaultValue="library" className="space-y-6">
        <TabsList>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Biblioteca
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <UploadIcon className="w-4 h-4" />
            Upload
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Admin
            </TabsTrigger>
          )}
        </TabsList>

        {/* Library Tab */}
        <TabsContent value="library" className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, artista ou gênero..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Track List */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Music className="w-4 h-4" />
                Faixas ({filteredTracks.length})
              </h3>
              
              {tracksLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredTracks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'Nenhuma faixa encontrada' : 'Nenhuma faixa ainda'}
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredTracks.map((track) => (
                    <div
                      key={track.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-colors
                        ${selectedTrack?.id === track.id 
                          ? 'bg-primary/10 border-primary' 
                          : 'bg-muted/50 hover:bg-muted'
                        }
                      `}
                      onClick={() => setSelectedTrack(track)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.title}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{track.artist}</span>
                            {track.duration && <span>• {track.duration}</span>}
                            {track.bpm && <span>• {track.bpm} BPM</span>}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {track.upload_status && (
                            <Badge 
                              variant={track.upload_status === 'completed' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {track.upload_status === 'completed' ? 'OK' : track.upload_status}
                            </Badge>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTrack(track.id);
                            }}
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Player */}
            <div>
              {selectedTrack ? (
                <AudioPlayer track={selectedTrack} showAnalysis />
              ) : (
                <Card className="p-8 text-center">
                  <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Selecione uma faixa</h3>
                  <p className="text-muted-foreground">
                    Clique em uma faixa para reproduzir e ver detalhes
                  </p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <AudioUploader onUploadComplete={handleUploadComplete} />
        </TabsContent>

        {/* Admin Tab */}
        {isAdmin && (
          <TabsContent value="admin">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Painel Administrativo
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <h4 className="font-medium">Total de Faixas</h4>
                  <p className="text-2xl font-bold text-primary">{tracks.length}</p>
                </Card>
                
                <Card className="p-4 text-center">
                  <h4 className="font-medium">Usuários Ativos</h4>
                  <p className="text-2xl font-bold text-primary">--</p>
                </Card>
                
                <Card className="p-4 text-center">
                  <h4 className="font-medium">Storage Usado</h4>
                  <p className="text-2xl font-bold text-primary">--</p>
                </Card>
              </div>
              
              <div className="mt-6">
                <p className="text-muted-foreground">
                  Ferramentas administrativas em desenvolvimento...
                </p>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
