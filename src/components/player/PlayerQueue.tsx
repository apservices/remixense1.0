import React from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Play, 
  Clock, 
  ListMusic, 
  History,
  Trash2 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PlayerQueueProps {
  onClose?: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function PlayerQueue({ onClose }: PlayerQueueProps) {
  const { 
    queue, 
    history, 
    currentTrack, 
    playTrack, 
    removeFromQueue, 
    clearQueue 
  } = usePlayer();

  return (
    <div className="w-full max-w-sm bg-card rounded-lg border border-border shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <ListMusic className="h-4 w-4" />
          Fila de reprodução
        </h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="w-full justify-start px-4 py-2 bg-transparent border-b border-border rounded-none">
          <TabsTrigger value="queue" className="gap-1">
            <ListMusic className="h-3 w-3" />
            Próximas ({queue.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1">
            <History className="h-3 w-3" />
            Histórico ({history.length})
          </TabsTrigger>
        </TabsList>

        {/* Current Track */}
        {currentTrack && (
          <div className="p-4 border-b border-border bg-primary/5">
            <p className="text-xs text-muted-foreground mb-2">Tocando agora</p>
            <div className="flex items-center gap-3">
              {currentTrack.coverUrl ? (
                <img 
                  src={currentTrack.coverUrl} 
                  alt={currentTrack.title}
                  className="w-10 h-10 rounded object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                  <Play className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{currentTrack.title}</p>
                <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDuration(currentTrack.duration)}
              </span>
            </div>
          </div>
        )}

        <TabsContent value="queue" className="m-0">
          {queue.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-xs text-muted-foreground">
                  {queue.length} {queue.length === 1 ? 'música' : 'músicas'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearQueue}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              </div>
              <ScrollArea className="h-64">
                <div className="p-2 space-y-1">
                  {queue.map((track, index) => (
                    <div 
                      key={`${track.id}-${index}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group"
                    >
                      <span className="w-5 text-xs text-muted-foreground text-center">
                        {index + 1}
                      </span>
                      {track.coverUrl ? (
                        <img 
                          src={track.coverUrl} 
                          alt={track.title}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                          <Play className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={() => removeFromQueue(track.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="p-8 text-center">
              <ListMusic className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Fila vazia
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Adicione músicas à fila para tocar em sequência
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="m-0">
          {history.length > 0 ? (
            <ScrollArea className="h-72">
              <div className="p-2 space-y-1">
                {history.map((track, index) => (
                  <div 
                    key={`${track.id}-${index}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group cursor-pointer"
                    onClick={() => playTrack(track)}
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {track.coverUrl ? (
                      <img 
                        src={track.coverUrl} 
                        alt={track.title}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                        <Play className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                    <Play className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-8 text-center">
              <History className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Histórico vazio
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                As músicas que você ouvir aparecerão aqui
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
