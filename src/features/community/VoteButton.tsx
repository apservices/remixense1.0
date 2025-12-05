import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  entryId: string;
  initialVotes: number;
  hasVoted?: boolean;
  onVoteChange?: (newVotes: number, hasVoted: boolean) => void;
}

export default function VoteButton({ entryId, initialVotes, hasVoted: initialHasVoted = false, onVoteChange }: VoteButtonProps) {
  const { user } = useAuth();
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    if (!user) {
      toast.error('Faça login para votar');
      return;
    }

    setIsVoting(true);
    
    try {
      if (hasVoted) {
        // Remove vote (decrement)
        const { error } = await supabase
          .from('challenge_entries')
          .update({ votes: votes - 1 })
          .eq('id', entryId);

        if (error) throw error;
        
        setVotes(v => v - 1);
        setHasVoted(false);
        onVoteChange?.(votes - 1, false);
        toast.success('Voto removido');
      } else {
        // Add vote (increment)
        const { error } = await supabase
          .from('challenge_entries')
          .update({ votes: votes + 1 })
          .eq('id', entryId);

        if (error) throw error;
        
        setVotes(v => v + 1);
        setHasVoted(true);
        onVoteChange?.(votes + 1, true);
        toast.success('Voto registrado!');
      }
    } catch (error: any) {
      toast.error(`Erro ao votar: ${error.message}`);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Button
      variant={hasVoted ? "default" : "outline"}
      size="sm"
      onClick={handleVote}
      disabled={isVoting}
      className={cn(
        "gap-2 transition-all",
        hasVoted && "bg-primary hover:bg-primary/90"
      )}
    >
      {isVoting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ThumbsUp className={cn("w-4 h-4", hasVoted && "fill-current")} />
      )}
      <span>{votes}</span>
    </Button>
  );
}
