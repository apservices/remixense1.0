import { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, X, Music, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  bpm: number | null;
  key_signature: string | null;
  genre: string | null;
  energy_level: number | null;
}

export default function MetadataTable() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TrackMetadata>>({});

  // Fetch tracks with React Query
  const { data: tracks = [], isLoading, error, refetch } = useQuery({
    queryKey: ['tracks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('id, title, artist, bpm, key_signature, genre, energy_level')
        .eq('user_id', user!.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TrackMetadata[];
    },
    enabled: !!user?.id
  });

  // Update mutation with optimistic updates
  const updateMutation = useMutation({
    mutationFn: async (updates: { id: string; data: Partial<TrackMetadata> }) => {
      const { error } = await supabase
        .from('tracks')
        .update({
          title: updates.data.title,
          artist: updates.data.artist,
          bpm: updates.data.bpm,
          key_signature: updates.data.key_signature,
          genre: updates.data.genre,
          energy_level: updates.data.energy_level
        })
        .eq('id', updates.id);

      if (error) throw error;
      return updates;
    },
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tracks', user?.id] });
      
      // Snapshot previous value
      const previousTracks = queryClient.getQueryData(['tracks', user?.id]);
      
      // Optimistically update
      queryClient.setQueryData(['tracks', user?.id], (old: TrackMetadata[] | undefined) => 
        old?.map(t => t.id === updates.id ? { ...t, ...updates.data } : t)
      );
      
      return { previousTracks };
    },
    onError: (err: any, _, context) => {
      // Rollback on error
      queryClient.setQueryData(['tracks', user?.id], context?.previousTracks);
      toast.error(`Erro ao salvar: ${err.message}`);
    },
    onSuccess: () => {
      toast.success('Metadados atualizados');
      setEditingId(null);
      setEditData({});
    }
  });

  const startEdit = useCallback((track: TrackMetadata) => {
    setEditingId(track.id);
    setEditData(track);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditData({});
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId) return;
    updateMutation.mutate({ id: editingId, data: editData });
  }, [editingId, editData, updateMutation]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <AlertCircle className="w-12 h-12 text-destructive/70" />
        <p className="text-muted-foreground">Erro ao carregar tracks</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Título</TableHead>
            <TableHead>Artista</TableHead>
            <TableHead className="text-center">BPM</TableHead>
            <TableHead className="text-center">Key</TableHead>
            <TableHead className="text-center">Gênero</TableHead>
            <TableHead className="text-center">Energy</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tracks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma track encontrada</p>
              </TableCell>
            </TableRow>
          ) : (
            tracks.map((track) => (
              <TableRow key={track.id}>
                <TableCell>
                  {editingId === track.id ? (
                    <Input
                      value={editData.title || ''}
                      onChange={(e) => setEditData(d => ({ ...d, title: e.target.value }))}
                      className="h-8"
                    />
                  ) : (
                    <span className="font-medium">{track.title}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === track.id ? (
                    <Input
                      value={editData.artist || ''}
                      onChange={(e) => setEditData(d => ({ ...d, artist: e.target.value }))}
                      className="h-8"
                    />
                  ) : (
                    track.artist
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {editingId === track.id ? (
                    <Input
                      type="number"
                      value={editData.bpm || ''}
                      onChange={(e) => setEditData(d => ({ ...d, bpm: parseInt(e.target.value) || null }))}
                      className="h-8 w-20 mx-auto"
                    />
                  ) : (
                    <Badge variant="outline">{track.bpm || '-'}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {editingId === track.id ? (
                    <Input
                      value={editData.key_signature || ''}
                      onChange={(e) => setEditData(d => ({ ...d, key_signature: e.target.value }))}
                      className="h-8 w-24 mx-auto"
                    />
                  ) : (
                    <Badge variant="secondary">{track.key_signature || '-'}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {editingId === track.id ? (
                    <Input
                      value={editData.genre || ''}
                      onChange={(e) => setEditData(d => ({ ...d, genre: e.target.value }))}
                      className="h-8 w-28 mx-auto"
                    />
                  ) : (
                    track.genre || '-'
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {editingId === track.id ? (
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={editData.energy_level || ''}
                      onChange={(e) => setEditData(d => ({ ...d, energy_level: parseInt(e.target.value) || null }))}
                      className="h-8 w-16 mx-auto"
                    />
                  ) : (
                    track.energy_level ? `${track.energy_level}/10` : '-'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === track.id ? (
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={saveEdit}>
                        <Save className="w-4 h-4 text-emerald-500" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancelEdit}>
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="icon" variant="ghost" onClick={() => startEdit(track)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
