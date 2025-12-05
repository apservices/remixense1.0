import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Music, ExternalLink, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ReleaseCardProps {
  release: {
    id: string;
    title: string;
    artist: string;
    cover_url?: string;
    release_date: string;
    status: 'draft' | 'scheduled' | 'released' | 'distributed';
    platforms?: string[];
  };
  onEdit?: () => void;
  onView?: () => void;
}

const STATUS_CONFIG = {
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Agendado', color: 'bg-amber-500/20 text-amber-500' },
  released: { label: 'Lançado', color: 'bg-emerald-500/20 text-emerald-500' },
  distributed: { label: 'Distribuído', color: 'bg-primary/20 text-primary' }
};

export default function ReleaseCard({ release, onEdit, onView }: ReleaseCardProps) {
  const statusConfig = STATUS_CONFIG[release.status];
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isUpcoming = new Date(release.release_date) > new Date();

  return (
    <Card className="glass-card overflow-hidden group hover:border-primary/30 transition-colors">
      <CardContent className="p-0">
        <div className="flex gap-4">
          {/* Cover */}
          <div className="relative w-24 h-24 flex-shrink-0">
            {release.cover_url ? (
              <img 
                src={release.cover_url} 
                alt={release.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-cyan-500/30 flex items-center justify-center">
                <Music className="w-8 h-8 text-primary/50" />
              </div>
            )}
            {isUpcoming && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 py-3 pr-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold line-clamp-1">{release.title}</h3>
                <p className="text-sm text-muted-foreground">{release.artist}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onView}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>
                    Editar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(release.release_date)}
              </span>
            </div>

            {release.platforms && release.platforms.length > 0 && (
              <div className="flex gap-1 mt-2">
                {release.platforms.slice(0, 3).map(platform => (
                  <Badge key={platform} variant="outline" className="text-xs">
                    {platform}
                  </Badge>
                ))}
                {release.platforms.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{release.platforms.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
