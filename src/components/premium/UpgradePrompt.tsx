import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  feature: string;
  requiredPlan?: 'premium' | 'pro';
  className?: string;
}

export default function UpgradePrompt({ feature, requiredPlan = 'premium', className }: UpgradePromptProps) {
  const navigate = useNavigate();

  const planDetails = {
    premium: {
      name: 'Premium',
      icon: Crown,
      color: 'text-amber-500',
      benefits: ['Análise ilimitada', 'Stems AI', 'Export HD', 'Suporte prioritário']
    },
    pro: {
      name: 'Pro',
      icon: Zap,
      color: 'text-purple-500',
      benefits: ['Tudo do Premium', 'Marketplace', 'API Access', 'Colaborações ilimitadas']
    }
  };

  const plan = planDetails[requiredPlan];
  const Icon = plan.icon;

  return (
    <Card className={`glass-card border-primary/20 ${className}`}>
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center mb-2">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-lg">Recurso {plan.name}</CardTitle>
        <CardDescription>
          <span className="font-medium text-foreground">{feature}</span> requer plano {plan.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {plan.benefits.map((benefit, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              {benefit}
            </li>
          ))}
        </ul>
        <Button 
          className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90"
          onClick={() => navigate('/pricing')}
        >
          Fazer Upgrade
        </Button>
      </CardContent>
    </Card>
  );
}
