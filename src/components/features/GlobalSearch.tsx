import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Music, User, FileText, Radio, Sparkles, X, Command } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'track' | 'user' | 'post' | 'page';
  title: string;
  subtitle?: string;
  url: string;
  icon: typeof Music;
}

const quickActions = [
  { label: 'Upload de música', url: '/tracks', icon: Music },
  { label: 'Gerar com IA', url: '/ai-studio', icon: Sparkles },
  { label: 'Auto DJ', url: '/dj/auto', icon: Radio },
  { label: 'Meu perfil', url: '/profile', icon: User },
];

export function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search tracks
      const { data: tracks } = await supabase
        .from('tracks')
        .select('id, title, artist')
        .or(`title.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%`)
        .limit(5);

      if (tracks) {
        searchResults.push(
          ...tracks.map(track => ({
            id: track.id,
            type: 'track' as const,
            title: track.title,
            subtitle: track.artist || 'Artista desconhecido',
            url: '/tracks',
            icon: Music,
          }))
        );
      }

      // Search users/profiles - usando VIEW pública segura
      const { data: profiles } = await supabase
        .from('public_user_profiles')
        .select('id, username')
        .ilike('username', `%${searchQuery}%`)
        .limit(5);

      if (profiles) {
        searchResults.push(
          ...profiles.map(profile => ({
            id: profile.id,
            type: 'user' as const,
            title: profile.username,
            subtitle: 'Usuário',
            url: '/feed',
            icon: User,
          }))
        );
      }

      // Search posts
      const { data: posts } = await supabase
        .from('posts')
        .select('id, content')
        .ilike('content', `%${searchQuery}%`)
        .limit(3);

      if (posts) {
        searchResults.push(
          ...posts.map(post => ({
            id: post.id,
            type: 'post' as const,
            title: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
            subtitle: 'Publicação',
            url: '/feed',
            icon: FileText,
          }))
        );
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = query ? results : quickActions;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedItem = query ? results[selectedIndex] : quickActions[selectedIndex];
        if (selectedItem) {
          navigate(selectedItem.url);
          setOpen(false);
          setQuery('');
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, query, results, selectedIndex, navigate]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results, query]);

  const handleSelect = (url: string) => {
    navigate(url);
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 text-muted-foreground h-9 px-3 bg-muted/30"
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">Buscar...</span>
        <kbd className="hidden md:inline-flex ml-2 h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
          <Command className="h-3 w-3" />K
        </kbd>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="sm:hidden"
      >
        <Search className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-lg glass glass-border backdrop-blur-glass bg-background/95">
          <div className="flex items-center border-b border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar músicas, usuários, publicações..."
              className="border-0 focus-visible:ring-0 bg-transparent"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuery('')}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <ScrollArea className="max-h-[300px]">
            {!query ? (
              <div className="p-2">
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Ações rápidas
                </p>
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => handleSelect(action.url)}
                      className={cn(
                        'w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
                        index === selectedIndex
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Nenhum resultado encontrado</p>
              </div>
            ) : (
              <div className="p-2">
                {results.map((result, index) => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result.url)}
                      className={cn(
                        'w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
                        index === selectedIndex
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm truncate">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {result.type === 'track' ? 'Música' : 
                         result.type === 'user' ? 'Usuário' : 'Post'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="border-t border-border px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <kbd className="h-5 px-1.5 rounded border bg-muted">↑</kbd>
              <kbd className="h-5 px-1.5 rounded border bg-muted">↓</kbd>
              <span>navegar</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="h-5 px-1.5 rounded border bg-muted">↵</kbd>
              <span>selecionar</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="h-5 px-1.5 rounded border bg-muted">esc</kbd>
              <span>fechar</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
