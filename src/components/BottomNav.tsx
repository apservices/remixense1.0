import { Music, Zap, Users, User, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "home", label: "Início", icon: Home, path: "/" },
  { id: "vault", label: "Vault", icon: Music, path: "/vault" },
  { id: "studio", label: "Studio", icon: Zap, path: "/studio" },
  { id: "social", label: "Social", icon: Users, path: "/feed" },
  { id: "profile", label: "Perfil", icon: User, path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="glass border-t border-glass-border backdrop-blur-glass">
        <div className="flex items-center justify-around py-1.5 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-smooth min-w-0 flex-1 touch-manipulation",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive && "animate-scale-in"
                )} />
                <span className="text-[10px] font-semibold leading-none truncate">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
