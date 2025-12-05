import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Play, Pause, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
  audioUrl?: string;
  mediaUrls?: string[];
  likeCount: number;
  commentCount: number;
  playCount?: number;
  createdAt: string;
  isLiked?: boolean;
  isPlaying?: boolean;
  contentId?: string;
  onPlay?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export function SocialFeedCard({
  user,
  postType,
  caption,
  audioUrl,
  likeCount,
  commentCount,
  playCount,
  createdAt,
  isLiked = false,
  isPlaying = false,
  contentId,
  onPlay,
  onLike,
  onComment,
  onShare
}: SocialFeedCardProps) {
  const hasAudio = postType !== 'text' && (audioUrl || contentId);

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
        <Link to={`/profile/${user.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
        </Link>
        <div className="text-xs glass glass-border px-2 py-1 rounded">
          {getPostTypeLabel()}
        </div>
      </div>

      {/* Audio Player / Content */}
      {hasAudio ? (
        <div className="relative aspect-video bg-gradient-to-br from-primary/20 via-muted/20 to-accent/20">
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden">
            {isPlaying && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.02, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </div>
          
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="icon"
                className="h-16 w-16 rounded-full neon-glow"
                onClick={onPlay}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>
            </motion.div>
          </div>

          {/* Sound indicator when playing */}
          {isPlaying && (
            <motion.div 
              className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-primary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Volume2 className="h-4 w-4" />
              <span>Tocando agora</span>
            </motion.div>
          )}

          {/* Waveform placeholder */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/90 to-transparent flex items-end px-4 pb-2">
            <div className="w-full h-8 flex items-end gap-[2px]">
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-primary/60 rounded-t"
                  initial={{ height: '20%' }}
                  animate={isPlaying ? { 
                    height: ['20%', `${Math.random() * 80 + 20}%`, '20%']
                  } : { height: `${Math.random() * 60 + 10}%` }}
                  transition={isPlaying ? {
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.02
                  } : {}}
                />
              ))}
            </div>
          </div>
        </div>
      ) : postType !== 'text' ? (
        <div className="relative aspect-square bg-muted/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="icon"
              className="h-16 w-16 rounded-full neon-glow"
              disabled
            >
              <Play className="h-8 w-8 ml-1" />
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/90 to-transparent" />
        </div>
      ) : null}

      {/* Caption */}
      {caption && (
        <div className="px-4 py-3">
          <p className="text-sm line-clamp-3">{caption}</p>
        </div>
      )}

      {/* Stats bar */}
      {playCount !== undefined && playCount > 0 && (
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
            onClick={onLike}
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
