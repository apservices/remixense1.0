import React from 'react';

export default function Studio() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Estúdio de Mixagem</h1>
      <p className="mb-4">Arraste ou selecione faixas para mixar.</p>
      <div className="bg-slate-200 p-6 rounded-lg shadow-inner h-64 flex items-center justify-center">
        <span className="text-slate-500">Interface de mixagem em construção</span>
      </div>
    </div>
  );
}
