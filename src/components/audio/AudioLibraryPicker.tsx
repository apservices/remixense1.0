import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Sparkles, Search, Check, Loader2, Play } from 'lucide-react';
import { useAudioLibrary, AudioTrack } from '@/hooks/useAudioLibrary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface AudioLibraryPickerProps {
  onSelect: (track: AudioTrack) => void;
  selectedId?: string;
  trigger?: React.ReactNode;
  multiple?: boolean;
  selectedIds?: string[];
  onMultiSelect?: (tracks: AudioTrack[]) => void;
}

export function AudioLibraryPicker({ 
  onSelect, 
  selectedId, 
  trigger,
  multiple = false,
  selectedIds = [],
  onMultiSelect
}: AudioLibraryPickerProps) {
  const { tracks, aiGenerations, isLoading } = useAudioLibrary();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds);

  const filterTracks = (trackList: AudioTrack[]) => {
    if (!search.trim()) return trackList;
    const searchLower = search.toLowerCase();
    return trackList.filter(t => 
      t.title.toLowerCase().includes(searchLower) ||
      t.artist.toLowerCase().includes(searchLower) ||
      t.genre?.toLowerCase().includes(searchLower)
    );
  };

  const allTracks = [...tracks, ...aiGenerations];
  const filteredAll = filterTracks(allTracks);
  const filteredUploads = filterTracks(tracks);
  const filteredAI = filterTracks(aiGenerations);

  const handleSelect = (track: AudioTrack) => {
    if (multiple) {
      const isSelected = localSelectedIds.includes(track.id);
      const newIds = isSelected 
        ? localSelectedIds.filter(id => id !== track.id)
        : [...localSelectedIds, track.id];
      setLocalSelectedIds(newIds);
      onMultiSelect?.(allTracks.filter(t => newIds.includes(t.id)));
    } else {
      onSelect(track);
      setOpen(false);
    }
  };

  const renderTrackItem = (track: AudioTrack) => {
    const isSelected = multiple 
      ? localSelectedIds.includes(track.id) 
      : selectedId === track.id;

    return (
      <motion.button
        key={track.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
          'hover:bg-muted/50 active:scale-[0.98]',
          isSelected && 'bg-primary/10 border border-primary/30'
        )}
        onClick={() => handleSelect(track)}
      >
        <div className={cn(
          'h-12 w-12 rounded-lg flex items-center justify-center shrink-0',
          track.source === 'suno' 
            ? 'bg-gradient-to-br from-violet-500/20 to-cyan-500/20' 
            : 'bg-muted'
        )}>
          {track.coverUrl ? (
            <img src={track.coverUrl} alt="" className="h-full w-full object-cover rounded-lg" />
          ) : track.source === 'suno' ? (
            <Sparkles className="h-5 w-5 text-primary" />
          ) : (
            <Music className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{track.title}</p>
            {track.source === 'suno' && (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">IA</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{track.artist}</span>
            {track.bpm && <span>• {track.bpm} BPM</span>}
            {track.key_signature && <span>• {track.key_signature}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSelected && (
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </div>
      </motion.button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Music className="h-4 w-4" />
            Selecionar da Biblioteca
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg glass glass-border backdrop-blur-glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Biblioteca de Áudio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, artista ou gênero..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                Todas ({allTracks.length})
              </TabsTrigger>
              <TabsTrigger value="uploads" className="flex-1">
                Uploads ({tracks.length})
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex-1">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                IA ({aiGenerations.length})
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[350px] mt-3">
                <TabsContent value="all" className="mt-0 space-y-1">
                  <AnimatePresence>
                    {filteredAll.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        Nenhuma faixa encontrada
                      </p>
                    ) : (
                      filteredAll.map(renderTrackItem)
                    )}
                  </AnimatePresence>
                </TabsContent>

                <TabsContent value="uploads" className="mt-0 space-y-1">
                  <AnimatePresence>
                    {filteredUploads.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        Nenhum upload encontrado
                      </p>
                    ) : (
                      filteredUploads.map(renderTrackItem)
                    )}
                  </AnimatePresence>
                </TabsContent>

                <TabsContent value="ai" className="mt-0 space-y-1">
                  <AnimatePresence>
                    {filteredAI.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        Nenhuma geração de IA encontrada
                      </p>
                    ) : (
                      filteredAI.map(renderTrackItem)
                    )}
                  </AnimatePresence>
                </TabsContent>
              </ScrollArea>
            )}
          </Tabs>

          {/* Confirm for multiple selection */}
          {multiple && localSelectedIds.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {localSelectedIds.length} selecionada(s)
              </span>
              <Button size="sm" onClick={() => setOpen(false)}>
                Confirmar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
