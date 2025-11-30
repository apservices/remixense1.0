import { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommentsPanelProps {
  postId: string;
}

export function CommentsPanel({ postId }: CommentsPanelProps) {
  const { comments, isLoading, addComment, deleteComment } = useComments(postId);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(newComment.trim());
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass glass-border p-4">
      <h3 className="text-heading-md mb-4">
        Comentários ({comments.length})
      </h3>

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicione um comentário..."
            className="glass glass-border"
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      {/* Comments list */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Carregando comentários...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum comentário ainda. Seja o primeiro!
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user.avatarUrl} />
                <AvatarFallback>
                  {comment.user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {comment.user.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteComment(comment.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
