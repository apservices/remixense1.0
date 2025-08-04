import React, { useState } from 'react';
import { TrackMetadata } from './track-metadata';

interface MetadataFormProps {
  initialMetadata?: TrackMetadata;
  onSubmit: (metadata: TrackMetadata) => void;
}

const MetadataForm: React.FC<MetadataFormProps> = ({ initialMetadata, onSubmit }) => {
  const [name, setName] = useState(initialMetadata?.name || '');
  const [genre, setGenre] = useState(initialMetadata?.genre || '');
  const [bpm, setBpm] = useState(initialMetadata?.bpm || '');
  const [key, setKey] = useState(initialMetadata?.key || '');
  const [mood, setMood] = useState(initialMetadata?.mood || '');
  const [tags, setTags] = useState(initialMetadata?.tags.join(', ') || '');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const metadata: TrackMetadata = {
      name,
      genre,
      bpm: Number(bpm),
      key,
      mood,
      tags: tags.split(',').map(tag => tag.trim()),
    };
    onSubmit(metadata);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label>Genre:</label>
        <input type="text" value={genre} onChange={e => setGenre(e.target.value)} required />
      </div>
      <div>
        <label>BPM:</label>
        <input type="number" value={bpm} onChange={e => setBpm(e.target.value)} required />
      </div>
      <div>
        <label>Key:</label>
        <input type="text" value={key} onChange={e => setKey(e.target.value)} required />
      </div>
      <div>
        <label>Mood:</label>
        <input type="text" value={mood} onChange={e => setMood(e.target.value)} required />
      </div>
      <div>
        <label>Tags:</label>
        <input type="text" value={tags} onChange={e => setTags(e.target.value)} />
      </div>
      <button type="submit">Save Metadata</button>
    </form>
  );
};

export default MetadataForm;