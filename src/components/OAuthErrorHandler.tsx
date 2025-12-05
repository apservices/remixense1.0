import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface OAuthError {
  provider: string;
  message: string;
  code?: string;
}

const ERROR_MESSAGES: Record<string, { title: string; description: string; action: string }> = {
  'access_denied': {
    title: 'Acesso negado',
    description: 'Você cancelou o login ou não autorizou o acesso. Tente novamente.',
    action: 'Tentar novamente'
  },
  'invalid_request': {
    title: 'Erro na requisição',
    description: 'Houve um problema técnico. Por favor, tente novamente em alguns instantes.',
    action: 'Tentar novamente'
  },
  'server_error': {
    title: 'Erro no servidor',
    description: 'O serviço de autenticação está temporariamente indisponível. Tente novamente mais tarde.',
    action: 'Tentar novamente'
  },
  'temporarily_unavailable': {
    title: 'Serviço indisponível',
    description: 'O serviço está sobrecarregado. Por favor, aguarde alguns minutos.',
    action: 'Tentar novamente'
  },
  'user_cancelled_login_flow': {
    title: 'Login cancelado',
    description: 'O processo de login foi interrompido. Você pode tentar novamente quando quiser.',
    action: 'Tentar novamente'
  },
  'default': {
    title: 'Erro no login',
    description: 'Ocorreu um erro durante o login. Por favor, tente novamente ou use outro método.',
    action: 'Tentar novamente'
  }
};

export function OAuthErrorHandler() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState<OAuthError | null>(null);
  const { signInWithGoogle, signInWithSpotify } = useAuth();

  useEffect(() => {
    const errorCode = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const provider = searchParams.get('provider') || 'oauth';

    if (errorCode) {
      setError({
        provider,
        message: errorDescription || errorCode,
        code: errorCode,
      });

      // Clean up URL params
      searchParams.delete('error');
      searchParams.delete('error_description');
      searchParams.delete('provider');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const handleRetry = async () => {
    if (error?.provider === 'google') {
      await signInWithGoogle();
    } else if (error?.provider === 'spotify') {
      await signInWithSpotify();
    }
    setError(null);
  };

  const handleClose = () => {
    setError(null);
  };

  const errorInfo = error?.code ? ERROR_MESSAGES[error.code] || ERROR_MESSAGES['default'] : ERROR_MESSAGES['default'];

  return (
    <Dialog open={!!error} onOpenChange={() => setError(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {errorInfo.title}
          </DialogTitle>
          <DialogDescription>
            {errorInfo.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error details (collapsible for debugging) */}
          {error?.message && error.message !== error.code && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 p-2 rounded bg-muted overflow-auto">
                {error.message}
              </pre>
            </details>
          )}

          {/* Provider-specific tips */}
          {error?.provider === 'spotify' && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm">
              <p className="text-foreground">
                <strong>Dica Spotify:</strong> Certifique-se de que sua conta Spotify está ativa e você tem permissão para apps de terceiros.
              </p>
            </div>
          )}

          {error?.provider === 'google' && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
              <p className="text-foreground">
                <strong>Dica Google:</strong> Verifique se cookies de terceiros estão habilitados no seu navegador.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleClose} className="flex-1">
            Fechar
          </Button>
          <Button onClick={handleRetry} className="flex-1 gap-2">
            <RefreshCw className="h-4 w-4" />
            {errorInfo.action}
          </Button>
        </div>

        <div className="text-center pt-2 border-t border-border">
          <Button variant="link" size="sm" className="text-muted-foreground gap-1">
            <Mail className="h-3 w-3" />
            Ou entre com email e senha
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
