import { Badge } from "@/components/ui/badge";
import { Crown, Zap, User } from "lucide-react";

interface PlanBadgeProps {
  plan: 'free' | 'premium' | 'pro';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function PlanBadge({ plan, size = 'md', showIcon = true }: PlanBadgeProps) {
  const config = {
    free: {
      label: 'Free',
      icon: User,
      className: 'bg-muted text-muted-foreground border-muted-foreground/20'
    },
    premium: {
      label: 'Premium',
      icon: Crown,
      className: 'bg-amber-500/10 text-amber-500 border-amber-500/30'
    },
    pro: {
      label: 'Pro',
      icon: Zap,
      className: 'bg-gradient-to-r from-primary/20 to-cyan-500/20 text-primary border-primary/30'
    }
  };

  const { label, icon: Icon, className } = config[plan];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };

  return (
    <Badge variant="outline" className={`${className} ${sizeClasses[size]} gap-1`}>
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
      {label}
    </Badge>
  );
}
