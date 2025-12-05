import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Music, 
  Sparkles, 
  Wand2, 
  Users, 
  ChevronRight, 
  ChevronLeft,
  Library,
  Sliders,
  Bot,
  MessageSquare
} from 'lucide-react';

interface GuidedOnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const steps = [
  {
    id: 'vault',
    title: '🎵 Vault - Sua Biblioteca',
    subtitle: 'Onde suas músicas moram',
    icon: Library,
    description: 'O Vault é o coração do RemiXense. Aqui você faz upload das suas músicas e a IA analisa automaticamente BPM, tonalidade e energia.',
    features: [
      { icon: Music, text: 'Upload de MP3, WAV, AAC' },
      { icon: Sparkles, text: 'Análise automática por IA' },
      { icon: Sliders, text: 'Metadados detectados' },
    ],
    tip: 'Dica: Arraste arquivos diretamente para upload rápido!',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'studio',
    title: '🎛️ Studio - Crie e Remixe',
    subtitle: 'Ferramentas profissionais de DJ',
    icon: Sliders,
    description: 'No Studio você tem acesso ao Stems Studio para separar vocais, bateria e instrumentos, além do Auto-DJ para mixagens inteligentes.',
    features: [
      { icon: Wand2, text: 'Separação de stems com IA' },
      { icon: Music, text: 'Auto-DJ com sync de BPM' },
      { icon: Sliders, text: 'Crossfader e efeitos' },
    ],
    tip: 'Dica: Use o Auto-DJ para descobrir músicas compatíveis!',
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 'ai-studio',
    title: '🤖 AI Studio - IA Generativa',
    subtitle: 'Crie música do zero com Suno',
    icon: Bot,
    description: 'O AI Studio conecta você à IA Suno para gerar músicas originais a partir de prompts de texto. Crie melodias, harmonias e faixas completas.',
    features: [
      { icon: Sparkles, text: 'Geração com Suno AI' },
      { icon: Music, text: 'Melodias e harmonias' },
      { icon: Wand2, text: 'Auto-mastering' },
    ],
    tip: 'Dica: Seja específico nos prompts para melhores resultados!',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'feed',
    title: '📱 Feed - Comunidade',
    subtitle: 'Conecte-se com outros DJs',
    icon: MessageSquare,
    description: 'O Feed é onde você compartilha suas criações, descobre novos artistas e interage com a comunidade RemiXense.',
    features: [
      { icon: Users, text: 'Siga artistas' },
      { icon: MessageSquare, text: 'Comente e curta' },
      { icon: Music, text: 'Descubra novos sons' },
    ],
    tip: 'Dica: Poste regularmente para crescer sua audiência!',
    color: 'from-pink-500 to-rose-500',
  },
];

export function GuidedOnboarding({ onComplete, onSkip }: GuidedOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} de {steps.length}
            </span>
            {onSkip && (
              <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
                Pular tutorial
              </Button>
            )}
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {steps.map((s, i) => (
              <div 
                key={s.id}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  i <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  i < currentStep ? 'bg-primary' : 
                  i === currentStep ? 'bg-primary animate-pulse' : 
                  'bg-muted'
                }`} />
                <span className="hidden sm:inline">{s.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <Card className="glass border-glass-border overflow-hidden">
          {/* Gradient Header */}
          <div className={`bg-gradient-to-r ${step.color} p-6 text-white`}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <step.icon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{step.title}</h1>
                <p className="text-white/80">{step.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <p className="text-foreground text-lg leading-relaxed">
              {step.description}
            </p>

            {/* Features */}
            <div className="space-y-3">
              {step.features.map((feature, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Tip */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-primary flex items-start gap-2">
                <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {step.tip}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-6 pt-0 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-muted-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <Button onClick={handleNext} className="gap-2">
              {isLastStep ? 'Começar a usar' : 'Próximo'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Quick access hint */}
        {isLastStep && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Você pode acessar este tutorial novamente em Configurações
          </p>
        )}
      </div>
    </div>
  );
}
