import { useState, useCallback } from "react";
import { useTracks } from "@/hooks/useTracks";
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
import { Search, Plus, Grid3X3, List, Upload, Music, RefreshCw } from "lucide-react";

export default function Vault() {
  const { tracks, loading, toggleLike, refetch, deleteTrack } = useTracks();
  const { toast } = useToast();
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "bpm">("newest");
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const filteredTracks = tracks.filter(track => {
    const matchesFilter = activeFilter === "all" || track.type === activeFilter;
    const matchesSearch = searchQuery === "" || 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.genre?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "name":
        return a.title.localeCompare(b.title);
      case "bpm":
        return (b.bpm || 0) - (a.bpm || 0);
      default:
        return 0;
    }
  });

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
      if (!track.file_path) {
        toast({
          title: "Erro ao carregar áudio",
          description: "Arquivo não encontrado.",
          variant: "destructive"
        });
        return;
      }

      const audioUrl = await getAudioUrl(track.file_path);
      console.log('🎵 Playing track:', track.title, audioUrl);

      // Parse duration from string format "MM:SS" to seconds
      const parseDuration = (dur: string) => {
        if (!dur) return 180;
        const parts = dur.split(':').map(Number);
        return parts.length === 2 ? parts[0] * 60 + parts[1] : 180;
      };

      // Build playlist with audio URLs
      const playlistPromises = filteredTracks.map(async t => {
        const url = t.file_path ? await getAudioUrl(t.file_path) : '';
        return {
          id: t.id,
          title: t.title,
          artist: t.artist,
          audioUrl: url,
          duration: parseDuration(t.duration)
        };
      });

      const playlist = await Promise.all(playlistPromises);

      // Play the selected track
      playTrack({
        id: track.id,
        title: track.title,
        artist: track.artist,
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

  const filterTabs = [
    { id: "all", label: "Todos", count: tracks.length },
    { id: "track", label: "Tracks", count: tracks.filter(t => t.type === "track").length },
    { id: "remix", label: "Remixes", count: tracks.filter(t => t.type === "remix").length },
    { id: "sample", label: "Samples", count: tracks.filter(t => t.type === "sample").length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="glass border-glass-border rounded-lg p-8">
          <div className="flex items-center gap-3">
            <Music className="h-6 w-6 text-primary animate-pulse" />
            <p className="text-foreground">Carregando vault...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-glass-border backdrop-blur-glass">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-heading-xl text-foreground">
              Meu Vault 🎵
            </h1>
            <div className="flex gap-2">
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

          {/* Filter Tabs */}
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
      </div>

      {/* Content */}
      <div className="px-4 py-6">
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
              <EnhancedDJCard
                key={track.id}
                id={track.id}
                title={track.title}
                artist={track.artist}
                duration={track.duration}
                type={track.type}
                bpm={track.bpm || undefined}
                genre={track.genre || undefined}
                keySignature={track.key_signature || undefined}
                energy={track.energy_level || undefined}
                isLiked={track.is_liked}
                onLike={() => toggleLike(track.id)}
                onPlay={() => handlePlayTrack(track)}
                onComment={() => console.log("Commenting on track:", track.id)}
                onDelete={async () => {
                  try {
                    await deleteTrack(track.id);
                    toast({
                      title: "Track excluído!",
                      description: `${track.title} foi removido do seu vault.`
                    });
                  } catch (error) {
                    toast({
                      title: "Erro ao excluir",
                      description: "Não foi possível excluir o track. Tente novamente.",
                      variant: "destructive"
                    });
                  }
                }}
              />
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
  );
}
