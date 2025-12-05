import { useState, useCallback, useMemo } from "react";
import { useTracks } from "@/hooks/useTracks";
import { useAudioLibrary } from "@/hooks/useAudioLibrary";
import { useToast } from "@/hooks/use-toast";
import { usePlayer } from "@/contexts/PlayerContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedDJCard } from "@/components/EnhancedDJCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedAudioUploadDialog } from "@/components/EnhancedAudioUploadDialog";
import { reanalyzeAllTracks } from "@/utils/reanalysis";
import { getAudioUrl } from "@/utils/storage";
import { Search, Plus, Grid3X3, List, Upload, Music, RefreshCw, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useNavigate } from "react-router-dom";

export default function Vault() {
  const { tracks, loading, toggleLike, refetch, deleteTrack } = useTracks();
  const { aiGenerations } = useAudioLibrary();
  const { toast } = useToast();
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "uploads" | "ai">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "bpm">("newest");
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Combine tracks with AI generations
  const allItems = useMemo(() => {
    const uploadTracks = tracks.map(t => ({ ...t, source: 'upload' as const }));
    const aiTracks = aiGenerations.map(gen => ({
      id: gen.id,
      title: gen.title,
      artist: gen.artist,
      duration: gen.duration ? `${Math.floor(gen.duration / 60)}:${String(gen.duration % 60).padStart(2, '0')}` : '0:00',
      type: 'track' as const,
      bpm: gen.bpm,
      key_signature: gen.key_signature,
      genre: gen.genre,
      energy_level: null,
      is_liked: false,
      file_path: gen.audioUrl,
      created_at: gen.created_at || new Date().toISOString(),
      source: 'ai' as const
    }));
    return [...uploadTracks, ...aiTracks];
  }, [tracks, aiGenerations]);

  const filteredTracks = useMemo(() => {
    return allItems.filter(track => {
      // Source filter
      if (sourceFilter === 'uploads' && track.source !== 'upload') return false;
      if (sourceFilter === 'ai' && track.source !== 'ai') return false;
      
      // Type filter (only for uploads)
      const matchesFilter = activeFilter === "all" || track.type === activeFilter;
      
      // Search
      const matchesSearch = searchQuery === "" || 
        track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.genre?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    }).sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name":
          return (a.title || '').localeCompare(b.title || '');
        case "bpm":
          return (b.bpm || 0) - (a.bpm || 0);
        default:
          return 0;
      }
    });
  }, [allItems, activeFilter, sourceFilter, searchQuery, sortBy]);

  const handleReanalyzeAll = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }

    setIsReanalyzing(true);
    
    toast({
      title: "Re-análise iniciada",
      description: "Analisando todas as faixas. Isso pode levar alguns minutos..."
    });

    try {
      const result = await reanalyzeAllTracks(user.id);
      
      if (result.success) {
        toast({
          title: "Re-análise concluída!",
          description: `${result.processed} faixas analisadas com sucesso.`
        });
        refetch();
      } else {
        toast({
          title: "Re-análise parcialmente concluída",
          description: `${result.processed} faixas OK, ${result.failed} falharam.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na re-análise",
        description: "Não foi possível re-analisar as faixas.",
        variant: "destructive"
      });
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handlePlayTrack = useCallback(async (track: any) => {
    try {
      let audioUrl = track.file_path;
      
      // For uploaded tracks, get the storage URL
      if (track.source === 'upload' && track.file_path) {
        audioUrl = await getAudioUrl(track.file_path);
      }
      
      if (!audioUrl) {
        toast({
          title: "Erro ao carregar áudio",
          description: "Arquivo não encontrado.",
          variant: "destructive"
        });
        return;
      }

      console.log('🎵 Playing track:', track.title, audioUrl);

      // Parse duration from string format "MM:SS" to seconds
      const parseDuration = (dur: string) => {
        if (!dur) return 180;
        const parts = dur.split(':').map(Number);
        return parts.length === 2 ? parts[0] * 60 + parts[1] : 180;
      };

      // Build playlist with audio URLs
      const playlistPromises = filteredTracks.map(async t => {
        let url = t.file_path;
        if (t.source === 'upload' && t.file_path) {
          url = await getAudioUrl(t.file_path);
        }
        return {
          id: t.id,
          title: t.title || 'Sem título',
          artist: t.artist || 'Artista desconhecido',
          audioUrl: url || '',
          duration: parseDuration(t.duration)
        };
      });

      const playlist = await Promise.all(playlistPromises);

      // Play the selected track
      playTrack({
        id: track.id,
        title: track.title || 'Sem título',
        artist: track.artist || 'Artista desconhecido',
        audioUrl,
        duration: parseDuration(track.duration)
      }, playlist);
      
    } catch (error) {
      console.error('Error playing track:', error);
      toast({
        title: "Erro ao reproduzir",
        description: "Não foi possível iniciar a reprodução.",
        variant: "destructive"
      });
    }
  }, [filteredTracks, playTrack, toast]);

  // Source tabs
  const sourceTabs = [
    { id: "all", label: "Todas", icon: Music, count: allItems.length },
    { id: "uploads", label: "Uploads", icon: Upload, count: tracks.length },
    { id: "ai", label: "Geradas IA", icon: Sparkles, count: aiGenerations.length }
  ];

  // Type filters (only for uploads)
  const filterTabs = [
    { id: "all", label: "Todos", count: filteredTracks.length },
    { id: "track", label: "Tracks", count: filteredTracks.filter(t => t.type === "track").length },
    { id: "remix", label: "Remixes", count: filteredTracks.filter(t => t.type === "remix").length },
    { id: "sample", label: "Samples", count: filteredTracks.filter(t => t.type === "sample").length }
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="glass border-glass-border rounded-lg p-8">
            <div className="flex items-center gap-3">
              <Music className="h-6 w-6 text-primary animate-pulse" />
              <p className="text-foreground">Carregando vault...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="glass border-b border-glass-border backdrop-blur-glass rounded-xl mb-6 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-heading-xl text-foreground gradient-text">
              Minha Biblioteca 🎵
            </h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/ai-studio')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar com IA
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReanalyzeAll}
                disabled={isReanalyzing || tracks.length === 0}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isReanalyzing ? 'animate-spin' : ''}`} />
                Re-analisar
              </Button>
              <EnhancedAudioUploadDialog onSuccess={refetch}>
                <Button variant="neon" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </EnhancedAudioUploadDialog>
            </div>
          </div>

          {/* Search & Controls */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar na sua biblioteca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-smooth text-sm"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 bg-muted border border-border rounded-lg text-foreground text-sm"
            >
              <option value="newest">Mais recente</option>
              <option value="oldest">Mais antigo</option>
              <option value="name">Nome</option>
              <option value="bpm">BPM</option>
            </select>
            
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="rounded-none border-0 px-3"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-none border-0 px-3"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Source Filter */}
          <div className="flex gap-2 mb-4">
            {sourceTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={sourceFilter === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSourceFilter(tab.id as any)}
                className="flex items-center gap-2"
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                <Badge variant="secondary" className="text-xs px-1.5 py-0 ml-1">
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Type Filter Tabs (only show for uploads) */}
          {sourceFilter !== 'ai' && (
            <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-4 glass">
                {filterTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 text-xs"
                  >
                    {tab.label}
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {tab.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {/* Info sobre análise necessária para Auto-DJ */}
          {tracks.length > 0 && tracks.some(t => !t.bpm || !t.key_signature) && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-sm text-warning mt-4 flex items-start gap-2">
              <span>⚠️</span>
              <div>
                <div className="font-medium">Análise necessária para Auto-DJ</div>
                <div className="text-xs">
                  {tracks.filter(t => !t.bpm || !t.key_signature).length} faixas sem BPM/Key detectado. 
                  Clique em "Re-analisar" para detectar automaticamente.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-6">
        {filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "Nenhum resultado encontrado" : "Nenhum arquivo encontrado"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {searchQuery 
                ? "Tente ajustar sua busca ou filtros."
                : "Comece fazendo upload dos seus primeiros tracks, remixes ou samples."
              }
            </p>
            {!searchQuery && (
              <EnhancedAudioUploadDialog onSuccess={refetch}>
                <Button variant="neon">
                  <Plus className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
              </EnhancedAudioUploadDialog>
            )}
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 gap-4" 
              : "space-y-2"
          }>
            {filteredTracks.map((track) => (
              <div key={track.id} className="relative">
                {track.source === 'ai' && (
                  <Badge className="absolute top-2 right-2 z-10 bg-primary/80 text-primary-foreground text-[10px]">
                    <Sparkles className="h-3 w-3 mr-1" />
                    IA
                  </Badge>
                )}
                <EnhancedDJCard
                  id={track.id}
                  title={track.title || 'Sem título'}
                  artist={track.artist || 'Artista desconhecido'}
                  duration={track.duration}
                  type={track.type}
                  bpm={track.bpm || undefined}
                  genre={track.genre || undefined}
                  keySignature={track.key_signature || undefined}
                  energy={track.energy_level || undefined}
                  isLiked={track.is_liked}
                  onLike={() => track.source === 'upload' && toggleLike(track.id)}
                  onPlay={() => handlePlayTrack(track)}
                  onComment={() => console.log("Commenting on track:", track.id)}
                  onDelete={track.source === 'upload' ? async () => {
                    try {
                      await deleteTrack(track.id);
                      toast({
                        title: "Track excluído!",
                        description: `${track.title} foi removido da sua biblioteca.`
                      });
                    } catch (error) {
                      toast({
                        title: "Erro ao excluir",
                        description: "Não foi possível excluir o track. Tente novamente.",
                        variant: "destructive"
                    });
                    }
                  } : undefined}
                />
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Stats Summary */}
        {filteredTracks.length > 0 && (
          <div className="mt-8 glass border-glass-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3">
              Estatísticas da Coleção
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-neon-blue font-heading">
                    {filteredTracks.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Arquivos</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-neon-violet font-heading">
                    {Math.round(filteredTracks.reduce((acc, track) => {
                      const parts = track.duration?.split(':').map(Number) || [0, 0];
                      return acc + (parts[0] || 0) + (parts[1] || 0) / 60;
                    }, 0))}m
                  </p>
                  <p className="text-xs text-muted-foreground">Duração</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-neon-teal font-heading">
                    {Math.round(filteredTracks.reduce((acc, track) => acc + (track.bpm || 0), 0) / filteredTracks.length) || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">BPM Médio</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-neon-green font-heading">
                    {Math.round(filteredTracks.reduce((acc, track) => acc + (track.energy_level || 0), 0) / filteredTracks.length) || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Energia Média</p>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </AppLayout>
  );
}
