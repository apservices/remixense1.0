import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Play } from 'lucide-react';
import { useState } from 'react';

interface SocialFeedCardProps {
  id: string;
  user: {
    id: string;
    username: string;
    djName?: string;
    avatarUrl?: string;
  };
  postType: 'set' | 'remix' | 'track' | 'text';
  caption?: string;
  mediaUrls?: string[];
  likeCount: number;
  commentCount: number;
  playCount?: number;
  createdAt: string;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export function SocialFeedCard({
  user,
  postType,
  caption,
  likeCount,
  commentCount,
  playCount,
  createdAt,
  isLiked = false,
  onLike,
  onComment,
  onShare
}: SocialFeedCardProps) {
  const handleLike = () => {
    onLike?.();
  };

  const getPostTypeLabel = () => {
    const labels = {
      set: '🎧 DJ Set',
      remix: '🎛️ Remix',
      track: '🎵 Track',
      text: '📝 Post'
    };
    return labels[postType];
  };

  return (
    <Card className="glass glass-border overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.djName || user.username}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
        <div className="text-xs glass glass-border px-2 py-1 rounded">
          {getPostTypeLabel()}
        </div>
      </div>

      {/* Media / Content */}
      {postType !== 'text' && (
        <div className="relative aspect-square bg-muted/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="icon"
              className="h-16 w-16 rounded-full neon-glow"
            >
              <Play className="h-8 w-8 ml-1" />
            </Button>
          </div>
          {/* Waveform overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/90 to-transparent" />
        </div>
      )}

      {/* Caption */}
      {caption && (
        <div className="px-4 py-3">
          <p className="text-sm">{caption}</p>
        </div>
      )}

      {/* Stats bar */}
      {playCount !== undefined && (
        <div className="px-4 py-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            {playCount.toLocaleString('pt-BR')} plays
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={isLiked ? 'text-red-500' : ''}
          >
            <Heart className={`h-5 w-5 mr-1 ${isLiked ? 'fill-current' : ''}`} />
            {likeCount}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onComment}
          >
            <MessageCircle className="h-5 w-5 mr-1" />
            {commentCount}
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onShare}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}
