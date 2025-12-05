import { Badge } from "@/components/ui/badge";
import { Clock, Upload, CheckCircle2, AlertCircle, XCircle, FileEdit } from "lucide-react";

type ReleaseStatus = 'draft' | 'scheduled' | 'pending' | 'submitted' | 'live' | 'failed';

interface ReleaseStatusBadgeProps {
  status: ReleaseStatus;
  size?: 'sm' | 'default';
}

const STATUS_CONFIG: Record<ReleaseStatus, { 
  icon: React.ElementType; 
  label: string; 
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  className: string;
}> = {
  draft: { 
    icon: FileEdit, 
    label: 'Rascunho', 
    variant: 'outline',
    className: 'bg-muted/50 text-muted-foreground border-muted-foreground/30'
  },
  scheduled: { 
    icon: Clock, 
    label: 'Agendado', 
    variant: 'outline',
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/30'
  },
  pending: { 
    icon: Clock, 
    label: 'Pendente', 
    variant: 'outline',
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/30'
  },
  submitted: { 
    icon: Upload, 
    label: 'Enviado', 
    variant: 'outline',
    className: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30'
  },
  live: { 
    icon: CheckCircle2, 
    label: 'Publicado', 
    variant: 'outline',
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
  },
  failed: { 
    icon: XCircle, 
    label: 'Falhou', 
    variant: 'destructive',
    className: 'bg-destructive/10 text-destructive border-destructive/30'
  }
};

export default function ReleaseStatusBadge({ status, size = 'default' }: ReleaseStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = config.icon;
  
  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} gap-1 ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {config.label}
    </Badge>
  );
}
