'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Store,
  ArrowRight
} from 'lucide-react';

interface CallbackStatus {
  status: 'loading' | 'success' | 'error';
  message?: string;
  integration?: {
    ml_nickname: string;
    ml_user_id: number;
  };
}

export default function MLCallbackPage() {
  const [status, setStatus] = useState<CallbackStatus>({ status: 'loading' });
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Check for ML error response
        if (error) {
          const errorDescription = searchParams.get('error_description') || error;
          throw new Error(`Erro na autorização: ${errorDescription}`);
        }

        // Check required parameters
        if (!code || !state) {
          throw new Error('Parâmetros de callback inválidos');
        }

        // Exchange code for token
        const response = await fetch('/api/ml/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Falha na autenticação');
        }

        // Success!
        setStatus({
          status: 'success',
          message: 'Conexão com Mercado Livre estabelecida com sucesso!',
          integration: data.integration,
        });

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          router.push('/dashboard/ml');
        }, 3000);

      } catch (err) {
        console.error('ML callback error:', err);
        
        setStatus({
          status: 'error',
          message: err instanceof Error ? err.message : 'Erro desconhecido',
        });
      }
    };

    handleCallback();
  }, [searchParams, router]);

  const goToDashboard = () => {
    router.push('/dashboard/ml');
  };

  const tryAgain = () => {
    router.push('/dashboard/ml');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                {status.status === 'loading' && (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                )}
                
                {status.status === 'success' && (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                )}
                
                {status.status === 'error' && (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                )}
              </div>

              {/* Title and Message */}
              <div className="space-y-2">
                {status.status === 'loading' && (
                  <>
                    <h1 className="text-xl font-semibold">
                      Conectando ao Mercado Livre
                    </h1>
                    <p className="text-muted-foreground">
                      Processando sua autorização...
                    </p>
                  </>
                )}
                
                {status.status === 'success' && (
                  <>
                    <h1 className="text-xl font-semibold text-green-700">
                      Conexão Estabelecida!
                    </h1>
                    {status.integration && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground">
                          {status.message}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
                          <Store className="w-4 h-4" />
                          <span>
                            Conectado como <strong>{status.integration.ml_nickname}</strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {status.status === 'error' && (
                  <>
                    <h1 className="text-xl font-semibold text-red-700">
                      Erro na Conexão
                    </h1>
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{status.message}</AlertDescription>
                    </Alert>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {status.status === 'loading' && (
                  <div className="text-sm text-muted-foreground">
                    Este processo pode levar alguns segundos...
                  </div>
                )}
                
                {status.status === 'success' && (
                  <>
                    <div className="text-sm text-muted-foreground">
                      Redirecionando automaticamente em 3 segundos...
                    </div>
                    <Button onClick={goToDashboard} className="w-full">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Ir para Dashboard
                    </Button>
                  </>
                )}
                
                {status.status === 'error' && (
                  <div className="space-y-2">
                    <Button onClick={tryAgain} className="w-full">
                      Tentar Novamente
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      className="w-full"
                    >
                      Voltar ao Dashboard
                    </Button>
                  </div>
                )}
              </div>

              {/* Help Text */}
              {status.status === 'error' && (
                <div className="text-xs text-muted-foreground">
                  Se o problema persistir, entre em contato com o suporte ou
                  verifique se você possui permissões adequadas no Mercado Livre.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}