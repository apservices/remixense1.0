import { Music, TrendingUp, Lightbulb, User, Home, History } from "lucide-react";
import { cn } from "@/lib/utils";
// Using BottomNav instead of MobileNav for consistency

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", label: "Início", icon: Home },
  { id: "vault", label: "Vault", icon: Music },
  { id: "sessions", label: "Sessões", icon: History },
  { id: "trends", label: "Tendências", icon: TrendingUp },
  { id: "profile", label: "Perfil", icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass border-t border-glass-border backdrop-blur-glass">
        <div className="flex items-center justify-around py-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-smooth min-w-0",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive && "animate-scale-in"
                )} />
                <span className="text-xs font-medium leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}