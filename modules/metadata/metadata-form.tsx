// modules/metadata/metadata-form.tsx

import React, { useState } from "react";
import { TrackMetadata } from "./track-metadata";

export function MetadataForm({ onSubmit }: { onSubmit: (data: TrackMetadata) => void }) {
  const [form, setForm] = useState<TrackMetadata>({
    title: "",
    artist: "",
    bpm: 0,
    key: "",
    mood: "",
    genre: "",
    tags: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Editar Metadados</h3>
      {["title", "artist", "bpm", "key", "mood", "genre"].map((field) => (
        <div key={field}>
          <input name={field} value={form[field as keyof TrackMetadata] || ""} onChange={handleChange} />
        </div>
      ))}
      <button type="submit">Salvar</button>
    </form>
  );
}