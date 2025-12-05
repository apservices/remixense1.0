import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string | null;
    prize: string | null;
    start_date: string;
    end_date: string;
    status: 'open' | 'voting' | 'closed';
    participants_count?: number;
  };
  onJoin?: () => void;
  onView?: () => void;
}

const STATUS_CONFIG = {
  open: { label: 'Aberto', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' },
  voting: { label: 'Votação', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
  closed: { label: 'Encerrado', color: 'bg-muted text-muted-foreground border-muted-foreground/30' }
};

export default function ChallengeCard({ challenge, onJoin, onView }: ChallengeCardProps) {
  const statusConfig = STATUS_CONFIG[challenge.status];
  const isOpen = challenge.status === 'open';
  const endDate = new Date(challenge.end_date);
  const isEnding = endDate.getTime() - Date.now() < 24 * 60 * 60 * 1000; // 24h

  return (
    <Card className="glass-card overflow-hidden group hover:border-primary/30 transition-colors">
      <CardContent className="p-0">
        {/* Header Gradient */}
        <div className="h-2 bg-gradient-to-r from-primary to-cyan-500" />
        
        <div className="p-4 space-y-4">
          {/* Title & Status */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-lg line-clamp-1">{challenge.title}</h3>
              {challenge.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {challenge.description}
                </p>
              )}
            </div>
            <Badge variant="outline" className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>

          {/* Prize */}
          {challenge.prize && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">Prêmio</p>
                <p className="font-medium text-amber-500">{challenge.prize}</p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{challenge.participants_count || 0} participantes</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className={isEnding && isOpen ? 'text-amber-500' : ''}>
                {isOpen 
                  ? `Termina ${formatDistanceToNow(endDate, { locale: ptBR, addSuffix: true })}`
                  : `Encerrou ${formatDistanceToNow(endDate, { locale: ptBR, addSuffix: true })}`
                }
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isOpen && onJoin && (
              <Button 
                className="flex-1 bg-gradient-to-r from-primary to-cyan-500"
                onClick={onJoin}
              >
                Participar
              </Button>
            )}
            <Button 
              variant="outline" 
              className={isOpen ? '' : 'flex-1'}
              onClick={onView}
            >
              {isOpen ? <ChevronRight className="w-4 h-4" /> : 'Ver Resultados'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
