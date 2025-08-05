import React from 'react';
import { Link } from 'react-router-dom';

export default function Tracks() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Histórico de Mixagens</h1>
      <p>Aqui você verá uma lista de faixas processadas.</p>
      <Link to="/studio" className="text-blue-500 underline block mt-4">Voltar para Studio</Link>
    </div>
  );
}
