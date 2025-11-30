import { MainLayout } from '@/components/MainLayout';
import { AutoDJPanel } from '@/components/dj/AutoDJPanel';

export default function AutoDJ() {
  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-heading-xl mb-2">🤖 Auto DJ</h1>
          <p className="text-muted-foreground">
            Geração automática de sets com IA - mixagem inteligente de BPM e keys
          </p>
        </div>

        <AutoDJPanel />
      </div>
    </MainLayout>
  );
}
