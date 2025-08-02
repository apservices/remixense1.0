import { ComprehensiveDashboard } from "@/components/ComprehensiveDashboard";

export default function Explorer() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 glass border-b border-glass-border backdrop-blur-glass">
        <div className="px-4 py-6">
          <h1 className="text-heading-xl text-foreground">
            Dashboard Explorer
          </h1>
          <p className="text-muted-foreground text-sm">
            Análise completa dos seus dados musicais
          </p>
        </div>
      </div>
      
      <div className="px-4 py-6">
        <ComprehensiveDashboard />
      </div>
    </div>
  );
}