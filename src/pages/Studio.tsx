import React from 'react';
import EnhancedDualPlayer from '@/components/EnhancedDualPlayer';

export default function Studio() {
  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <h1 className="text-heading-xl">Estúdio de Mixagem</h1>
      <p className="text-sm text-muted-foreground">Carregue duas faixas, visualize waveforms, ajuste volumes e use o crossfader.</p>
      <EnhancedDualPlayer />
    </div>
  );
}
