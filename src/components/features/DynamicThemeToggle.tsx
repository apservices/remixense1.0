import { motion } from 'framer-motion';
import { Palette, Zap, ZapOff } from 'lucide-react';
import { useDynamicTheme } from '@/hooks/useDynamicTheme';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DynamicThemeToggleProps {
  className?: string;
  compact?: boolean;
}

const energyColors = {
  low: 'bg-blue-500',
  medium: 'bg-purple-500',
  high: 'bg-orange-500',
  extreme: 'bg-red-500'
};

const energyLabels = {
  low: 'Relaxante',
  medium: 'Moderado',
  high: 'Energético',
  extreme: 'Extremo'
};

export function DynamicThemeToggle({ className, compact = false }: DynamicThemeToggleProps) {
  const { bpm, energy, isActive, updateBpm, toggleActive } = useDynamicTheme();

  if (compact) {
    return (
      <motion.button
        onClick={toggleActive}
        className={cn(
          'p-2 rounded-lg transition-colors touch-manipulation',
          isActive 
            ? 'bg-primary/20 text-primary' 
            : 'bg-muted hover:bg-accent',
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isActive ? 'Tema dinâmico ativo' : 'Ativar tema dinâmico'}
      >
        {isActive ? (
          <Zap className="h-4 w-4" />
        ) : (
          <ZapOff className="h-4 w-4 text-muted-foreground" />
        )}
      </motion.button>
    );
  }

  return (
    <AnimatedCard variant="glass" hoverEffect="none" className={cn('p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Tema Dinâmico</span>
        </div>
        <Switch checked={isActive} onCheckedChange={toggleActive} />
      </div>

      <motion.div
        initial={false}
        animate={{ opacity: isActive ? 1 : 0.5, height: isActive ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="space-y-4">
          {/* Energy Level */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Nível de Energia</span>
            <Badge 
              variant="outline" 
              className={cn(
                'text-[10px] text-white border-0',
                energyColors[energy]
              )}
            >
              {energyLabels[energy]}
            </Badge>
          </div>

          {/* BPM Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">BPM</span>
              <span className="text-xs font-mono">{bpm}</span>
            </div>
            <Slider
              value={[bpm]}
              onValueChange={([value]) => updateBpm(value)}
              min={60}
              max={200}
              step={1}
              disabled={!isActive}
            />
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>60</span>
              <span>130</span>
              <span>200</span>
            </div>
          </div>

          {/* Gradient Preview */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Preview</span>
            <motion.div
              className="h-8 rounded-lg dynamic-gradient-bg"
              style={{ background: `var(--dynamic-gradient)` }}
              animate={isActive ? { 
                scale: [1, 1.01, 1],
              } : {}}
              transition={{ 
                duration: 60 / bpm, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </div>
        </div>
      </motion.div>

      {!isActive && (
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Ative para cores sincronizadas com o BPM
        </p>
      )}
    </AnimatedCard>
  );
}
