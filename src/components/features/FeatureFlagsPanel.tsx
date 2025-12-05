import { motion } from 'framer-motion';
import { getFeatureStatus, FeatureFlag } from '@/lib/experimentalFeatures';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Sparkles, Zap, Lock } from 'lucide-react';

const tierColors = {
  free: 'bg-green-500/10 text-green-500 border-green-500/20',
  pro: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  expert: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
};

const tierIcons = {
  free: null,
  pro: <Zap className="h-3 w-3" />,
  expert: <Sparkles className="h-3 w-3" />
};

export function FeatureFlagsPanel() {
  const features = getFeatureStatus();

  return (
    <AnimatedCard variant="glass" hoverEffect="none" className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Recursos V3</h3>
        <Badge variant="outline" className="ml-auto text-[10px]">
          {features.filter(f => f.enabled).length}/{features.length} ativos
        </Badge>
      </div>

      <div className="space-y-2">
        {features.map((feature, index) => (
          <motion.div
            key={feature.feature}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2 p-2 rounded-md bg-background/50"
          >
            {feature.enabled ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            
            <span className={`text-xs flex-1 ${!feature.enabled && 'text-muted-foreground'}`}>
              {feature.description}
            </span>

            <Badge 
              variant="outline" 
              className={`text-[9px] gap-0.5 ${tierColors[feature.tier]}`}
            >
              {tierIcons[feature.tier]}
              {feature.tier.toUpperCase()}
            </Badge>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border/30">
        <p className="text-[10px] text-muted-foreground text-center">
          Atualize seu plano para desbloquear mais recursos
        </p>
      </div>
    </AnimatedCard>
  );
}
