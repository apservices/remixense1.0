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
    const list = Array.from(files).map((file) => ({
      file,
      id: \\-\\,
      status: 'uploading' as const,
    }));
    setUploads((u) => [...u, ...list]);

    list.forEach((uItem) => {
      addTrack(uItem.file)
        .then((meta) => {
          setUploads((prev) =>
            prev.map((f) =>
              f.id === uItem.id
                ? { ...f, status: 'ready', bpm: meta.bpm }
                : f
            )
          );
        })
        .catch((err) => {
          setUploads((prev) =>
            prev.map((f) =>
              f.id === uItem.id
                ? { ...f, status: 'error', errorMsg: err.message }
                : f
            )
          );
        });
    });
  };

  return (
    <div className="border-2 border-dashed rounded-lg p-6 relative group hover:border-blue-400 transition">
      <input
        type="file"
        multiple
        accept="audio/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="text-center text-gray-500 group-hover:text-blue-400">
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
                {u.status === 'ready' && <em className="text-green-600">Pronto (BPM: {u.bpm})</em>}
                {u.status === 'error' && <em className="text-red-600">Erro: {u.errorMsg}</em>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
