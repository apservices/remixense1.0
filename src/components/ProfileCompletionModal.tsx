import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { User, Camera, FileText, MapPin, AlertCircle } from 'lucide-react';
import { useProfileCompletion, getFieldLabel } from '@/hooks/useProfileCompletion';

interface ProfileCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FIELD_ICONS: Record<string, React.ComponentType<any>> = {
  dj_name: User,
  bio: FileText,
  avatar_url: Camera,
  location: MapPin,
};

export function ProfileCompletionModal({ open, onOpenChange }: ProfileCompletionModalProps) {
  const navigate = useNavigate();
  const { completionPercentage, missingFields } = useProfileCompletion();

  const handleCompleteProfile = () => {
    onOpenChange(false);
    navigate('/profile');
  };

  const handleSkip = () => {
    // Store that user skipped, show again in 24h
    localStorage.setItem('profile_completion_skipped', Date.now().toString());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Complete seu perfil
          </DialogTitle>
          <DialogDescription>
            Um perfil completo ajuda outros DJs a encontrar você e aumenta sua visibilidade na comunidade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso do perfil</span>
              <span className="font-medium text-foreground">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {/* Missing Fields */}
          {missingFields.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Campos faltando:</p>
              <div className="space-y-2">
                {missingFields.map(field => {
                  const Icon = FIELD_ICONS[field] || User;
                  return (
                    <div 
                      key={field}
                      className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                    >
                      <div className="p-2 rounded-lg bg-destructive/10">
                        <Icon className="h-4 w-4 text-destructive" />
                      </div>
                      <span className="text-sm text-foreground">{getFieldLabel(field)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Benefícios:</strong> Perfis completos aparecem 3x mais nas buscas e recebem 2x mais seguidores.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleSkip} className="flex-1">
            Depois
          </Button>
          <Button onClick={handleCompleteProfile} className="flex-1">
            Completar agora
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
