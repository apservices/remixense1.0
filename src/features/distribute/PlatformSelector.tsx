import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  popular?: boolean;
}

const PLATFORMS: Platform[] = [
  { id: 'spotify', name: 'Spotify', icon: '🎵', color: 'bg-emerald-500', description: 'Maior plataforma de streaming', popular: true },
  { id: 'apple_music', name: 'Apple Music', icon: '🍎', color: 'bg-pink-500', description: 'Qualidade premium de áudio', popular: true },
  { id: 'youtube_music', name: 'YouTube Music', icon: '▶️', color: 'bg-red-500', description: 'Alcance global', popular: true },
  { id: 'amazon_music', name: 'Amazon Music', icon: '📦', color: 'bg-amber-500', description: 'HD e Ultra HD' },
  { id: 'deezer', name: 'Deezer', icon: '🎧', color: 'bg-purple-500', description: 'Forte na Europa e Brasil' },
  { id: 'tidal', name: 'Tidal', icon: '🌊', color: 'bg-slate-700', description: 'Hi-Fi e Master Quality' },
  { id: 'soundcloud', name: 'SoundCloud', icon: '☁️', color: 'bg-orange-500', description: 'Comunidade independente' },
  { id: 'tiktok', name: 'TikTok', icon: '📱', color: 'bg-slate-900', description: 'Viral e trending' },
  { id: 'instagram', name: 'Instagram/Facebook', icon: '📸', color: 'bg-gradient-to-r from-purple-500 to-pink-500', description: 'Reels e Stories' },
  { id: 'pandora', name: 'Pandora', icon: '📻', color: 'bg-blue-500', description: 'Radio personalizado' }
];

interface PlatformSelectorProps {
  selected: string[];
  onChange: (platforms: string[]) => void;
}

export default function PlatformSelector({ selected, onChange }: PlatformSelectorProps) {
  const togglePlatform = (platformId: string) => {
    if (selected.includes(platformId)) {
      onChange(selected.filter(id => id !== platformId));
    } else {
      onChange([...selected, platformId]);
    }
  };

  const selectAll = () => {
    onChange(PLATFORMS.map(p => p.id));
  };

  const selectPopular = () => {
    onChange(PLATFORMS.filter(p => p.popular).map(p => p.id));
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Plataformas
            </CardTitle>
            <CardDescription>Selecione onde distribuir sua música</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-primary/10"
              onClick={selectPopular}
            >
              Populares
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-primary/10"
              onClick={selectAll}
            >
              Todas
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-3">
          {PLATFORMS.map((platform) => {
            const isSelected = selected.includes(platform.id);
            return (
              <div
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  isSelected 
                    ? "border-primary bg-primary/10" 
                    : "border-muted-foreground/20 hover:border-primary/50"
                )}
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl", platform.color)}>
                  {platform.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{platform.name}</p>
                    {platform.popular && (
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{platform.description}</p>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                )}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            );
          })}
        </div>
        
        <p className="text-sm text-muted-foreground mt-4 text-center">
          {selected.length} plataforma{selected.length !== 1 ? 's' : ''} selecionada{selected.length !== 1 ? 's' : ''}
        </p>
      </CardContent>
    </Card>
  );
}
