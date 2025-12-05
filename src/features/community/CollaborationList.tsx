import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Check, X, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Collaboration {
  id: string;
  proposer_id: string;
  recipient_id: string;
  project_id: string | null;
  proposed_role: string | null;
  status: string;
  created_at: string;
  project?: { title: string } | null;
}

export default function CollaborationList() {
  const { user } = useAuth();
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadCollaborations();
  }, [user?.id]);

  const loadCollaborations = async () => {
    const { data } = await supabase
      .from('collaborations')
      .select('*, project:projects(title)')
      .or(`proposer_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
      .order('created_at', { ascending: false });

    if (data) setCollaborations(data);
    setIsLoading(false);
  };

  const respondToCollaboration = async (collabId: string, accept: boolean) => {
    const { error } = await supabase
      .from('collaborations')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', collabId);

    if (!error) {
      setCollaborations(prev => prev.map(c => c.id === collabId ? { ...c, status: accept ? 'accepted' : 'rejected' } : c));
      toast.success(accept ? 'Aceito!' : 'Recusado');
    }
  };

  const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendente', color: 'bg-amber-500/20 text-amber-500' },
    accepted: { label: 'Aceito', color: 'bg-emerald-500/20 text-emerald-500' },
    rejected: { label: 'Recusado', color: 'bg-destructive/20 text-destructive' }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <Card className="glass-card">
      <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Colaborações</CardTitle></CardHeader>
      <CardContent>
        {collaborations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>Nenhuma colaboração</p></div>
        ) : (
          <div className="space-y-4">
            {collaborations.map(collab => {
              const isRecipient = collab.recipient_id === user?.id;
              const isPending = collab.status === 'pending';
              const cfg = STATUS_CONFIG[collab.status] || STATUS_CONFIG.pending;
              return (
                <div key={collab.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                  <Avatar><AvatarFallback>U</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Colaborador</p>
                      <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{collab.project?.title || 'Projeto'}</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(collab.created_at), { locale: ptBR, addSuffix: true })}</p>
                  </div>
                  {isRecipient && isPending && (
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="text-emerald-500" onClick={() => respondToCollaboration(collab.id, true)}><Check className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => respondToCollaboration(collab.id, false)}><X className="w-4 h-4" /></Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
