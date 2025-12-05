import { ReactNode, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { VoiceCommandButton } from '@/components/features/VoiceCommandButton';
import { DynamicThemeToggle } from '@/components/features/DynamicThemeToggle';
import { NotificationCenter } from '@/components/features/NotificationCenter';
import { GlobalSearch } from '@/components/features/GlobalSearch';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Sparkles, 
  FolderKanban, 
  Share2, 
  Users, 
  Settings,
  User,
  LogOut,
  CreditCard,
  Menu,
  X,
  ChevronRight,
  Music,
  Mic2,
  Radio,
  Calendar,
  TrendingUp,
  Wallet,
  MessageSquare,
  Layers,
  MoreHorizontal,
  Globe,
  Palette,
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

const mainNavItems = [
  { id: 'home', label: 'Início', icon: Home, path: '/' },
  { id: 'create', label: 'Criar', icon: Sparkles, path: '/ai-studio', description: 'IA Musical' },
  { id: 'manage', label: 'Gerenciar', icon: FolderKanban, path: '/tracks', description: 'Gestão Musical' },
  { id: 'distribute', label: 'Distribuir', icon: Share2, path: '/calendar', description: 'Distribuição' },
  { id: 'community', label: 'Comunidade', icon: Users, path: '/feed', description: 'Social' },
  { id: 'settings', label: 'Ajustes', icon: Settings, path: '/settings', description: 'Configurações' },
];

const subNavItems = {
  create: [
    { label: 'Estúdio IA', icon: Sparkles, path: '/ai-studio' },
    { label: 'Stems Studio', icon: Layers, path: '/studio/stems' },
    { label: 'Auto DJ', icon: Radio, path: '/dj/auto' },
  ],
  manage: [
    { label: 'Minhas Tracks', icon: Music, path: '/tracks' },
    { label: 'Vault', icon: FolderKanban, path: '/vault' },
    { label: 'Metadados', icon: Mic2, path: '/metadata' },
    { label: 'Analytics', icon: TrendingUp, path: '/analytics' },
  ],
  distribute: [
    { label: 'Calendário', icon: Calendar, path: '/calendar' },
    { label: 'Landing Pages', icon: Share2, path: '/tools/landing-page' },
    { label: 'Revenue', icon: Wallet, path: '/revenue' },
  ],
  community: [
    { label: 'Feed Social', icon: Users, path: '/feed' },
    { label: 'Feedback Rooms', icon: MessageSquare, path: '/feedback' },
    { label: 'Marketplace', icon: Layers, path: '/marketplace' },
  ],
};

const mobileNavItems = [
  { id: 'home', label: 'Início', icon: Home, path: '/' },
  { id: 'create', label: 'Criar', icon: Sparkles, path: '/ai-studio' },
  { id: 'manage', label: 'Vault', icon: FolderKanban, path: '/vault' },
  { id: 'community', label: 'Social', icon: Users, path: '/feed' },
  { id: 'profile', label: 'Perfil', icon: User, path: '/profile' },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { subscription, isFree } = useSubscription();
  const { currentTrack } = usePlayer();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showMobileFeatures, setShowMobileFeatures] = useState(false);
  
  // Calculate if player is visible for bottom padding
  const hasActivePlayer = !!currentTrack;

  const currentPage = mainNavItems.find(item => 
    location.pathname === item.path || 
    location.pathname.startsWith(item.path + '/')
  )?.label || 'RemiXense';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop TopBar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 md:h-16 glass glass-border border-b backdrop-blur-glass">
        <div className="flex items-center justify-between h-full px-3 md:px-4 lg:px-6">
          {/* Left: Logo + Page Title */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-muted/50 transition-colors touch-manipulation"
              aria-label="Menu"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <Link to="/" className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="hidden sm:block font-bold text-base md:text-lg gradient-text">RemiXense</span>
            </Link>

            <div className="hidden lg:flex items-center gap-2 text-muted-foreground">
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground text-sm">{currentPage}</span>
            </div>
          </div>

          {/* Right: Actions + Profile */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Global Search */}
            <GlobalSearch />
            
            {/* V3 Features - Desktop */}
            <div className="hidden md:flex items-center gap-1">
              <LanguageSelector />
              <DynamicThemeToggle compact />
              <VoiceCommandButton className="h-9 w-9" />
            </div>
            
            {/* V3 Features Toggle - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setShowMobileFeatures(!showMobileFeatures)}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
            
            {/* Notifications */}
            <NotificationCenter />

            {isFree && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/pricing')}
                className="hidden sm:flex border-primary/50 text-primary hover:bg-primary/10 text-xs md:text-sm"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Upgrade
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 touch-manipulation">
                  <div className="h-8 w-8 md:h-9 md:w-9 rounded-full gradient-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm max-w-[100px] truncate">
                    {user?.email?.split('@')[0] || 'Usuário'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass glass-border backdrop-blur-glass bg-background/95">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">Plano {subscription?.plan_type || 'Free'}</p>
                </div>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/pricing')}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Gerenciar Assinatura
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-60 xl:w-64 flex-col glass glass-border border-r backdrop-blur-glass z-40 overflow-y-auto">
        <nav className="flex-1 p-3 xl:p-4 space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            const hasSubNav = subNavItems[item.id as keyof typeof subNavItems];
            const isExpanded = expandedSection === item.id;
            
            return (
              <div key={item.id}>
                <button
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    isActive 
                      ? 'gradient-primary text-white neon-glow' 
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => {
                    if (hasSubNav) {
                      setExpandedSection(isExpanded ? null : item.id);
                    } else {
                      navigate(item.path);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <div className="text-left">
                      <span className="font-medium">{item.label}</span>
                      {item.description && (
                        <p className={cn(
                          "text-xs",
                          isActive ? "text-white/70" : "text-muted-foreground"
                        )}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {hasSubNav && (
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-90"
                    )} />
                  )}
                </button>

                {/* Sub Navigation */}
                {hasSubNav && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
                    {subNavItems[item.id as keyof typeof subNavItems].map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <button
                          key={subItem.path}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                            isSubActive 
                              ? 'bg-primary/20 text-primary' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                          )}
                          onClick={() => navigate(subItem.path)}
                        >
                          <SubIcon className="h-4 w-4" />
                          {subItem.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <div className="glass-card rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-2">RemiXense v1.0</p>
            <p className="text-xs text-muted-foreground">Fase Beta • Release Candidate</p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        >
          <aside 
            className="absolute left-0 top-16 bottom-0 w-72 glass glass-border border-r backdrop-blur-glass overflow-y-auto animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-4 space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <button
                    key={item.id}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                      isActive 
                        ? 'gradient-primary text-white neon-glow' 
                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => {
                      navigate(item.path);
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="text-left">
                      <span className="font-medium">{item.label}</span>
                      {item.description && (
                        <p className={cn(
                          "text-xs",
                          isActive ? "text-white/70" : "text-muted-foreground"
                        )}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Mobile V3 Features Dropdown */}
      {showMobileFeatures && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setShowMobileFeatures(false)}
        >
          <div 
            className="absolute right-3 top-14 glass glass-border rounded-xl p-3 space-y-2 animate-in fade-in slide-in-from-top-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <LanguageSelector />
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm mr-2">Tema</span>
              <DynamicThemeToggle compact />
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <VoiceCommandButton />
              <span className="text-sm">Comandos de Voz</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={cn(
        "pt-14 md:pt-16 lg:pl-60 xl:lg:pl-64 min-h-screen lg:pb-8 transition-all",
        hasActivePlayer ? "pb-44 md:pb-40" : "pb-20 md:pb-24"
      )}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass glass-border border-t backdrop-blur-glass pb-safe">
        <div className="flex items-center justify-around py-1.5 px-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all duration-200 min-w-0 flex-1 touch-manipulation',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground active:scale-95'
                )}
              >
                <div className={cn(
                  'p-2 rounded-xl transition-all duration-200',
                  isActive && 'gradient-primary neon-glow'
                )}>
                  <Icon className={cn(
                    'h-5 w-5',
                    isActive ? 'text-white' : ''
                  )} />
                </div>
                <span className={cn(
                  'text-[10px] font-semibold leading-none mt-0.5',
                  isActive && 'text-primary'
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
