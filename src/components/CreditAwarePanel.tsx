import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Loader2, Zap, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCreditAwareServices } from '@/hooks/useCreditAwareServices';

interface CreditAwarePanelProps {
  trackId: string;
  userCredits?: number;
}

export function CreditAwarePanel({ trackId, userCredits = 0 }: CreditAwarePanelProps) {
  const {
    processing,
    results,
    runAutoMaster,
    runStemSwap,
    runMoodAnalysis,
    runMelodyGenerator,
    services
  } = useCreditAwareServices();

  const serviceActions = [
    {
      key: 'autoMaster',
      title: 'Auto-Mastering',
      description: 'Masterização automática com AI',
      icon: <Zap className="h-4 w-4" />,
      action: runAutoMaster,
      cost: services.autoMaster.creditCost
    },
    {
      key: 'stemSwap',
      title: 'Stem-Swap',
      description: 'Separação de instrumentos',
      icon: <RefreshCw className="h-4 w-4" />,
      action: runStemSwap,
      cost: services.stemSwap.creditCost
    },
    {
      key: 'moodAnalysis',
      title: 'Mood Analysis',
      description: 'Análise de sentimento musical',
      icon: <CheckCircle2 className="h-4 w-4" />,
      action: runMoodAnalysis,
      cost: services.moodAnalysis.creditCost
    },
    {
      key: 'melodyGenerator',
      title: 'Melody Generator',
      description: 'Geração de melodias AI',
      icon: <AlertCircle className="h-4 w-4" />,
      action: runMelodyGenerator,
      cost: services.melodyGenerator.creditCost
    }
  ];

  const totalCost = serviceActions.reduce((sum, service) => sum + service.cost, 0);
  const canAffordAll = userCredits >= totalCost;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Serviços AI Credit-Aware</CardTitle>
          <Badge variant={canAffordAll ? "default" : "destructive"}>
            {userCredits} créditos
          </Badge>
        </div>
        <Progress 
          value={(userCredits / Math.max(totalCost, userCredits)) * 100} 
          className="h-2" 
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceActions.map((service) => {
            const result = results[service.key];
            const isProcessing = processing === service.key;
            const hasResult = !!result;
            const canAfford = userCredits >= service.cost;

            return (
              <Card 
                key={service.key} 
                className={`relative transition-all duration-200 ${
                  hasResult ? 'border-primary/50 bg-primary/5' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {service.icon}
                      <h3 className="font-medium">{service.title}</h3>
                    </div>
                    <Badge variant={hasResult ? "default" : "outline"}>
                      {service.cost} créditos
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {service.description}
                  </p>

                  {hasResult && (
                    <div className="mb-3 p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        <span>
                          {result.cached ? 'Cache' : 'Processado'} 
                          {result.cached ? '' : ` (${result.creditsUsed} créditos)`}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => service.action(trackId)}
                      disabled={isProcessing || !canAfford}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Processando...
                        </>
                      ) : hasResult ? (
                        'Reprocessar'
                      ) : (
                        'Processar'
                      )}
                    </Button>
                    
                    {hasResult && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => service.action(trackId, true)}
                        disabled={isProcessing || !canAfford}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {!canAfford && (
                    <p className="text-xs text-destructive mt-2">
                      Créditos insuficientes
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator />

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Total para todos os serviços: {totalCost} créditos
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={!canAffordAll || !!processing}
            onClick={() => {
              serviceActions.forEach(service => service.action(trackId));
            }}
          >
            {processing ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              'Processar Todos'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}