import { Card } from '@/components/ui/card';
import { 
  Upload, 
  BarChart3, 
  Lightbulb, 
  Wand2,
  Check,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface JourneyStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  active: boolean;
}

interface JourneyProgressProps {
  hasTrack: boolean;
  hasAnalysis: boolean;
  hasExploredRecommendations: boolean;
  hasCreated: boolean;
  onStepClick?: (stepId: string) => void;
}

export function JourneyProgress({ 
  hasTrack, 
  hasAnalysis, 
  hasExploredRecommendations, 
  hasCreated,
  onStepClick 
}: JourneyProgressProps) {
  const steps: JourneyStep[] = [
    {
      id: 'upload',
      label: 'Adicionar Música',
      description: 'Envie sua primeira faixa',
      icon: Upload,
      completed: hasTrack,
      active: !hasTrack
    },
    {
      id: 'analyze',
      label: 'Ver Análise',
      description: 'BPM, tom, energia detectados',
      icon: BarChart3,
      completed: hasAnalysis,
      active: hasTrack && !hasAnalysis
    },
    {
      id: 'explore',
      label: 'Explorar',
      description: 'Descubra recomendações',
      icon: Lightbulb,
      completed: hasExploredRecommendations,
      active: hasAnalysis && !hasExploredRecommendations
    },
    {
      id: 'create',
      label: 'Criar',
      description: 'Gere melodias, remixes...',
      icon: Wand2,
      completed: hasCreated,
      active: hasExploredRecommendations && !hasCreated
    }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  return (
    <Card className="premium-card">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Sua Jornada</h3>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{steps.length} etapas
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-muted/30 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <div 
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer",
                  step.completed && "bg-emerald-500/10",
                  step.active && "bg-primary/10 ring-1 ring-primary/30",
                  !step.completed && !step.active && "bg-muted/20 opacity-60"
                )}
                onClick={() => onStepClick?.(step.id)}
              >
                {/* Step Number/Check */}
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                  step.completed && "bg-emerald-500",
                  step.active && "bg-primary",
                  !step.completed && !step.active && "bg-muted"
                )}>
                  {step.completed ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <Icon className={cn(
                      "h-5 w-5",
                      step.active ? "text-white" : "text-muted-foreground"
                    )} />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-medium text-sm",
                    step.completed && "text-emerald-500",
                    step.active && "text-primary"
                  )}>
                    {step.label}
                  </h4>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>

                {/* Arrow */}
                {step.active && (
                  <ChevronRight className="h-5 w-5 text-primary animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
