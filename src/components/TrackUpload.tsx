import React, { useState } from 'react';
import { useTracks } from '../hooks/useTracks';

interface UploadFile {
  file: File;
  id: string;
  status: 'uploading' | 'analyzing' | 'ready' | 'error';
  bpm?: number;
  errorMsg?: string;
}

export const TrackUpload: React.FC = () => {
  const { addTrack } = useTracks();
  const [uploads, setUploads] = useState<UploadFile[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const list: UploadFile[] = Array.from(files).map((file) => ({
      file,
      id: (window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
      status: 'uploading',
    }));
    setUploads((u) => [...u, ...list]);

    list.forEach((uItem) => {
      addTrack(uItem.file)
        .then((meta) => {
          setUploads((prev) =>
            prev.map((f) =>
              f.id === uItem.id ? { ...f, status: 'ready', bpm: (meta as any).bpm } : f
            )
          );
        })
        .catch((err: any) => {
          setUploads((prev) =>
            prev.map((f) =>
              f.id === uItem.id ? { ...f, status: 'error', errorMsg: err.message } : f
            )
          );
        });
    });
  };

  return (
    <div className="border-2 border-dashed rounded-lg p-6 relative group hover:border-primary transition-smooth">
      <input
        type="file"
        multiple
        accept="audio/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="text-center text-muted-foreground group-hover:text-foreground">
        Arraste arquivos aqui ou clique para selecionar
      </div>

      {uploads.length > 0 && (
        <ul className="mt-4 space-y-2">
          {uploads.map((u) => (
            <li key={u.id} className="flex justify-between items-center">
              <span className="truncate">{u.file.name}</span>
              <span>
                {u.status === 'uploading' && <em>Carregando…</em>}
                {u.status === 'analyzing' && <em>Analisando…</em>}
                {u.status === 'ready' && (
                  <em className="text-green-600">Pronto (BPM: {u.bpm})</em>
                )}
                {u.status === 'error' && (
                  <em className="text-destructive">Erro: {u.errorMsg}</em>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrackUpload;
