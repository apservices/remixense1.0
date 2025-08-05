import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BarChart3, Pause, Play } from "lucide-react";

export default function TrackLibrary({ tracks, addTrack, onSelect }) {
  const fileInput = useRef(null);

  const handleUpload = (e) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      addTrack(files[i]);
    }
    e.target.value = ""; // permite novo upload igual
  };

  return (
    <Card className="glass border-glass-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-heading-sm text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-neon-blue" />
          Biblioteca ({tracks.length})
        </h3>
        <Button
          variant="neon"
          onClick={() => fileInput.current?.click()}
          className="flex gap-2"
        >
          <Plus /> Adicionar Faixas
        </Button>
        <input
          type="file"
          ref={fileInput}
          multiple
          accept="audio/*"
          onChange={handleUpload}
          style={{ display: "none" }}
        />
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {tracks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma faixa na biblioteca ainda.
          </div>
        )}
        {tracks.map((track) => (
          <CardContent
            key={track.id}
            className="bg-glass border border-glass-border rounded-lg p-3 mb-2 flex flex-col gap-1 shadow hover:shadow-lg transition cursor-pointer"
            onClick={() => onSelect?.(track.id)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{track.title}</span>
              {track.status === "processing" && (
                <Badge variant="secondary">Analisando...</Badge>
              )}
              {track.status === "ready" && (
                <Badge variant="outline" className="border-neon-green/40 text-neon-green">
                  Pronta
                </Badge>
              )}
              {track.status === "error" && (
                <Badge variant="destructive">Erro</Badge>
              )}
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>{track.artist}</span>
              {track.bpm && (
                <Badge variant="outline" className="border-neon-green/40">
                  {track.bpm} BPM
                </Badge>
              )}
              {track.duration && (
                <Badge variant="outline" className="border-neon-blue/40">
                  {track.duration}
                </Badge>
              )}
            </div>
          </CardContent>
        ))}
      </div>
    </Card>
  );
}
