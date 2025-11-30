import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, ShoppingCart, Star } from 'lucide-react';

interface ProductCardProps {
  id: string;
  title: string;
  seller: {
    id: string;
    username: string;
    djName?: string;
  };
  productType: 'remix' | 'loop' | 'kit' | 'stem' | 'preset' | 'sample_pack';
  price: number;
  coverImageUrl?: string;
  rating?: number;
  reviewCount?: number;
  downloadsCount?: number;
  tags?: string[];
  bpm?: number;
  keySignature?: string;
  genre?: string;
}

export function ProductCard({
  title,
  seller,
  productType,
  price,
  coverImageUrl,
  rating = 0,
  reviewCount = 0,
  downloadsCount = 0,
  tags = [],
  bpm,
  keySignature,
  genre
}: ProductCardProps) {
  const getTypeLabel = () => {
    const labels = {
      remix: '🎛️ Remix',
      loop: '🔁 Loop',
      kit: '🥁 Kit',
      stem: '🎚️ Stem',
      preset: '⚙️ Preset',
      sample_pack: '📦 Sample Pack'
    };
    return labels[productType];
  };

  return (
    <Card className="glass glass-border overflow-hidden group cursor-pointer transition-smooth hover:neon-glow">
      {/* Cover image */}
      <div className="relative aspect-square bg-muted/20">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🎵
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button size="icon" className="h-12 w-12 rounded-full neon-glow">
            <Play className="h-6 w-6 ml-0.5" />
          </Button>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 right-2">
          <Badge className="glass glass-border text-xs">
            {getTypeLabel()}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-medium line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground">
            by {seller.djName || seller.username}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span>{rating.toFixed(1)}</span>
              <span>({reviewCount})</span>
            </div>
          )}
          <span>•</span>
          <span>{downloadsCount} downloads</span>
        </div>

        {/* Tags */}
        {(bpm || keySignature || genre) && (
          <div className="flex flex-wrap gap-1">
            {bpm && (
              <Badge variant="outline" className="text-xs">
                {bpm} BPM
              </Badge>
            )}
            {keySignature && (
              <Badge variant="outline" className="text-xs">
                {keySignature}
              </Badge>
            )}
            {genre && (
              <Badge variant="outline" className="text-xs">
                {genre}
              </Badge>
            )}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Price & action */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-lg font-bold text-primary">
            R$ {(price / 100).toFixed(2)}
          </div>
          <Button size="sm" className="neon-glow">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Comprar
          </Button>
        </div>
      </div>
    </Card>
  );
}
