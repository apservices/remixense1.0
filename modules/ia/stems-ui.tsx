// modules/ia/stems-ui.tsx

import React, { useState } from "react";
import { separateStems } from "./stem-extractor";

export function StemsUI() {
  const [stems, setStems] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const results = separateStems(e.target.files[0]);
      setStems(results);
    }
  };

  return (
    <div>
      <h3>Separador de Stems</h3>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <ul>
        {stems.map((stem, index) => (
          <li key={index}>{stem}</li>
        ))}
      </ul>
    </div>
  );
}