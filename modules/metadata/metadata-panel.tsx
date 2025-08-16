// modules/metadata/metadata-panel.tsx

import React from "react";
import { TrackMetadata } from "./track-metadata";

export function MetadataPanel({ data }: { data: TrackMetadata }) {
  return (
    <div>
      <h3>Informações da Faixa</h3>
      <ul>
        {Object.entries(data).map(([key, value]) => (
          <li key={key}><strong>{key}:</strong> {String(value)}</li>
        ))}
      </ul>
    </div>
  );
}