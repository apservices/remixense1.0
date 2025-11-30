import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GlobalStreamingPlayer } from './player/GlobalStreamingPlayer';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from './ui/button';
import { Home, Scissors, Play, Users, ShoppingBag, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentTrack, playlist } = usePlayer();

  const navItems = [
    { id: 'home', label: 'Início', icon: Home, path: '/' },
    { id: 'stems', label: 'Stems Studio', icon: Scissors, path: '/studio/stems' },
    { id: 'autodj', label: 'Auto DJ', icon: Play, path: '/dj/auto' },
    { id: 'feed', label: 'Social', icon: Users, path: '/feed' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
    { id: 'profile', label: 'Perfil', icon: User, path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 lg:hidden glass glass-border border-b backdrop-blur-glass">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-lg font-bold text-white">R</span>
            </div>
            <span className="font-bold text-lg">RemiXense</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col glass glass-border border-r backdrop-blur-glass z-40">
        <div className="p-6 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center neon-glow">
              <span className="text-xl font-bold text-white">R</span>
            </div>
            <span className="font-bold text-xl">RemiXense</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  isActive && 'neon-glow'
                )}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <aside className="absolute left-0 top-0 bottom-0 w-64 glass glass-border border-r backdrop-blur-glass">
            <nav className="p-4 space-y-2 mt-16">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3',
                      isActive && 'neon-glow'
                    )}
                    onClick={() => {
                      navigate(item.path);
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pb-32">
        {children}
      </main>

      {/* Global Player - Fixed at bottom */}
      {currentTrack && (
        <div className="lg:ml-64">
          <GlobalStreamingPlayer
            currentTrack={currentTrack}
            playlist={playlist}
          />
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden pb-24">
        <div className="glass glass-border border-t backdrop-blur-glass">
          <div className="flex items-center justify-around py-2 px-2">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg transition-smooth min-w-0 flex-1',
                    isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5',
                    isActive && 'animate-scale-in'
                  )} />
                  <span className="text-[10px] font-medium leading-none truncate">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
