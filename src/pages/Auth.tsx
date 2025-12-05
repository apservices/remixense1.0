
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/ui/Logo';
import { Mail, Lock, User, Music, ArrowLeft } from 'lucide-react';
import { Navigate } from 'react-router-dom';


interface AuthProps {
  onBack?: () => void;
}

export default function Auth({ onBack }: AuthProps) {
  const { user, loading, signIn, signInWithGoogle, signInWithSpotify, signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [djName, setDjName] = useState('');
  

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await signIn(email, password);
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await signUp(email, password, djName);
      if (!error) {
        setActiveTab('signin');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass border-glass-border rounded-xl p-6">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary animate-pulse" />
            <p className="text-foreground text-sm">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {onBack && (
        <div className="p-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="touch-manipulation">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </div>
      )}

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo/Title */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center mb-1">
              <Logo size="lg" />
            </div>
            <h1 className="text-lg font-bold gradient-text">RemiXense</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sua jornada musical começa aqui
            </p>
            <p className="text-[10px] text-warning mt-1">Beta</p>
          </div>

          <Card className="glass border-border/30 p-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="signin-email" className="text-xs text-muted-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-8 h-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signin-password" className="text-xs text-muted-foreground">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-8 h-9"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="neon"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
                <div className="mt-3 space-y-2">
                  <div className="text-center text-[10px] text-muted-foreground">ou continue com</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" type="button" onClick={signInWithGoogle}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-3.5 w-3.5 mr-1.5">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C35.202,7.163,29.902,5,24,5C12.955,5,4,13.955,4,25 s8.955,20,20,20s20-8.955,20-20C44,23.659,43.862,21.822,43.611,20.083z"/>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.817C14.475,16.042,18.884,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C35.202,7.163,29.902,5,24,5C16.318,5,9.656,9.337,6.306,14.691z"/>
                        <path fill="#4CAF50" d="M24,45c5.166,0,9.86-1.977,13.409-5.197l-6.192-5.238C29.211,36.091,26.715,37,24,37 c-5.202,0-9.623-3.317-11.285-7.946l-6.536,5.036C9.5,40.556,16.227,45,24,45z"/>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.093,5.565 c0.001-0.001,0.002-0.001,0.003-0.002l6.192,5.238C36.969,39.682,44,34,44,25C44,23.659,43.862,21.822,43.611,20.083z"/>
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" type="button" onClick={signInWithSpotify}>
                      <svg className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 24 24" fill="#1DB954">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                      Spotify
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="signup-djname" className="text-xs text-muted-foreground">
                      Nome de usuário
                    </Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="signup-djname"
                        type="text"
                        placeholder="Seu username"
                        value={djName}
                        onChange={(e) => setDjName(e.target.value)}
                        className="pl-8 h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signup-email" className="text-xs text-muted-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-8 h-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signup-password" className="text-xs text-muted-foreground">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-8 h-9"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="neon"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Criando...' : 'Criar conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-4 pt-3 border-t border-border/30">
              <p className="text-[10px] text-muted-foreground/70 text-center leading-relaxed">
                Ao continuar, você concorda com nossos{' '}
                <a href="#" className="text-primary/80 hover:underline">Termos</a> e{' '}
                <a href="#" className="text-primary/80 hover:underline">Privacidade</a>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
