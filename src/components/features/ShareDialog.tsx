import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, MessageCircle, Send, Facebook, Twitter, 
  Instagram, Link, Check, X, Music2 
} from 'lucide-react';
import { shareService, ShareContent } from '@/services/social/share-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { toast } from 'sonner';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ShareContent;
}

const platformIcons: Record<string, React.ReactNode> = {
  native: <Share2 className="h-5 w-5" />,
  whatsapp: <MessageCircle className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  telegram: <Send className="h-5 w-5" />,
  tiktok: <Music2 className="h-5 w-5" />,
  instagram: <Instagram className="h-5 w-5" />,
  copy: <Link className="h-5 w-5" />
};

export function ShareDialog({ open, onOpenChange, content }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const platforms = shareService.getAvailablePlatforms();

  const handleShare = async (platformId: string) => {
    if (platformId === 'native') {
      const result = await shareService.shareNative(content);
      if (result.success) {
        toast.success('Compartilhado com sucesso!');
        onOpenChange(false);
      } else if (result.error !== 'Share cancelled') {
        // Fallback to other options
        toast.info('Escolha uma plataforma para compartilhar');
      }
      return;
    }

    if (platformId === 'copy') {
      const success = await shareService.copyLink(content.url);
      if (success) {
        setCopied(true);
        toast.success('Link copiado!');
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error('Erro ao copiar link');
      }
      return;
    }

    shareService.openSharePopup(platformId, content);
    shareService.trackShare(platformId, 'track', content.url);
    toast.success(`Abrindo ${platforms.find(p => p.id === platformId)?.name}...`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            Compartilhar
          </DialogTitle>
        </DialogHeader>

        {/* Content Preview */}
        <div className="p-3 rounded-lg bg-muted/50 mb-4">
          <p className="font-medium text-sm truncate">{content.title}</p>
          {content.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {content.description}
            </p>
          )}
        </div>

        {/* Share Buttons Grid */}
        <div className="grid grid-cols-4 gap-3">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => handleShare(platform.id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl 
                         hover:bg-accent transition-colors w-full touch-manipulation
                         active:scale-95"
                style={{ 
                  '--platform-color': platform.color 
                } as React.CSSProperties}
              >
                <div 
                  className="p-2.5 rounded-full transition-colors"
                  style={{ backgroundColor: `${platform.color}20` }}
                >
                  <span style={{ color: platform.color }}>
                    {platform.id === 'copy' && copied ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      platformIcons[platform.id]
                    )}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {platform.id === 'copy' && copied ? 'Copiado!' : platform.name}
                </span>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Hashtags */}
        {content.hashtags && content.hashtags.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground mb-2">Hashtags sugeridas:</p>
            <div className="flex flex-wrap gap-1.5">
              {content.hashtags.map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
