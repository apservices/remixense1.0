import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Calendar, Globe, Wand2, BarChart3, Users, Music } from 'lucide-react';

export function QuickLinks() {
  const links = [
    {
      icon: Wand2,
      title: 'Estúdio de IA',
      description: 'Mastering, melodias e mood',
      path: '/ai-studio',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Calendar,
      title: 'Calendário',
      description: 'Seus lançamentos',
      path: '/calendar',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Globe,
      title: 'Landing Pages',
      description: 'Crie páginas de lançamento',
      path: '/tools/landing-page',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Users,
      title: 'Feedback Rooms',
      description: 'Colabore com outros artistas',
      path: '/feedback',
      color: 'from-amber-500 to-orange-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Receita e performance',
      path: '/revenue',
      color: 'from-rose-500 to-red-600'
    },
    {
      icon: Music,
      title: 'Trends',
      description: 'O que está em alta',
      path: '/trends',
      color: 'from-violet-500 to-purple-600'
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Ferramentas</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.path} to={link.path}>
              <Card className="glass border-glass-border hover:scale-105 transition-smooth cursor-pointer group h-full">
                <div className="p-4 space-y-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center group-hover:scale-110 transition-smooth`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-smooth">
                      {link.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {link.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
