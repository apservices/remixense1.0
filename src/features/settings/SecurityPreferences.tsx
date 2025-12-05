import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Key, Smartphone, Clock, AlertTriangle, Loader2, Save } from "lucide-react";
import { securityPreferencesSchema, type SecurityPreferences as SecurityPrefs } from "@/lib/schemas/user";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function SecurityPreferences() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm<SecurityPrefs>({
    resolver: zodResolver(securityPreferencesSchema),
    defaultValues: {
      two_factor_enabled: false,
      login_notifications: true,
      session_timeout_minutes: 1440
    }
  });

  const twoFactorEnabled = watch('two_factor_enabled');

  const onSubmit = async (data: SecurityPrefs) => {
    setIsLoading(true);
    try {
      // In production, save to user preferences table
      toast.success('Preferências de segurança atualizadas');
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast.success('Senha atualizada com sucesso');
      setShowPasswordChange(false);
    } catch (error: any) {
      toast.error(`Erro ao alterar senha: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Segurança
        </CardTitle>
        <CardDescription>Configure suas preferências de segurança</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Two-Factor Auth */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <Label className="text-base">Autenticação de 2 fatores</Label>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança
                </p>
              </div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={(checked) => setValue('two_factor_enabled', checked, { shouldDirty: true })}
            />
          </div>

          {/* Login Notifications */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <Label className="text-base">Notificações de login</Label>
                <p className="text-sm text-muted-foreground">
                  Receba alertas de novos acessos
                </p>
              </div>
            </div>
            <Switch
              {...register('login_notifications')}
              onCheckedChange={(checked) => setValue('login_notifications', checked, { shouldDirty: true })}
            />
          </div>

          {/* Session Timeout */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Label>Tempo de sessão</Label>
            </div>
            <Select 
              defaultValue="1440"
              onValueChange={(v) => setValue('session_timeout_minutes', parseInt(v), { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="480">8 horas</SelectItem>
                <SelectItem value="1440">1 dia</SelectItem>
                <SelectItem value="10080">7 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Save Preferences */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !isDirty}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Preferências
          </Button>
        </form>

        {/* Password Change Section */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowPasswordChange(!showPasswordChange)}
          >
            <Key className="w-4 h-4 mr-2" />
            Alterar Senha
          </Button>

          {showPasswordChange && (
            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Alterar
                </Button>
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => setShowPasswordChange(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
