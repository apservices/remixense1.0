import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, X, Music, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
  const [tracks, setTracks] = useState<TrackMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TrackMetadata>>({});

  useEffect(() => {
    if (user?.id) {
      loadTracks();
    }
  }, [user?.id]);

  const loadTracks = async () => {
    const { data, error } = await supabase
      .from('tracks')
      .select('id, title, artist, bpm, key_signature, genre, energy_level')
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (data) {
      setTracks(data);
    }
    setIsLoading(false);
  };

  const startEdit = (track: TrackMetadata) => {
    setEditingId(track.id);
    setEditData(track);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from('tracks')
        .update({
          title: editData.title,
          artist: editData.artist,
          bpm: editData.bpm,
          key_signature: editData.key_signature,
          genre: editData.genre,
          energy_level: editData.energy_level
        })
        .eq('id', editingId);

      if (error) throw error;

      setTracks(prev => prev.map(t => 
        t.id === editingId ? { ...t, ...editData } : t
      ));
      
      toast.success('Metadados atualizados');
      cancelEdit();
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
