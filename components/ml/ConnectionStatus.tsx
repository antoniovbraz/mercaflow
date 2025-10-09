'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Clock,
  Store,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MLIntegration {
  id: string;
  ml_user_id: number;
  ml_nickname: string;
  ml_email?: string;
  status: string;
  token_expires_at: string;
  last_sync_at?: string;
  scopes: string[];
  auto_sync_enabled: boolean;
  product_count?: number;
  error_count?: number;
  last_log_at?: string;
}

interface IntegrationStatus {
  hasIntegration: boolean;
  integration?: MLIntegration;
}

export function MLConnectionStatus() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setError(null);
      const response = await fetch('/api/ml/integration/status');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch status');
      }
      
      const data: IntegrationStatus = await response.json();
      setStatus(data);
      
      // Emit event to notify other components
      window.dispatchEvent(new CustomEvent('ml-connection-changed'));
    } catch (err) {
      console.error('Failed to fetch ML integration status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const connectToML = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ml/auth/initiate', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate connection');
      }
      
      const { authUrl } = await response.json();
      
      // Redirect to ML OAuth
      window.location.href = authUrl;
    } catch (err) {
      console.error('ML connection error:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setConnecting(false);
    }
  };

  const disconnectML = async () => {
    if (!confirm('Tem certeza que deseja desconectar sua conta do Mercado Livre? Você perderá acesso aos dados de vendas e produtos.')) {
      return;
    }

    setDisconnecting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ml/integration/status', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect');
      }
      
      // Update state immediately to reflect disconnection
      setStatus({ hasIntegration: false });
      
      // Emit event to notify other components
      window.dispatchEvent(new CustomEvent('ml-connection-changed'));
      
      // Also refresh from server to be sure
      setTimeout(() => {
        fetchStatus();
      }, 1000);
    } catch (err) {
      console.error('Failed to disconnect ML:', err);
      setError(err instanceof Error ? err.message : 'Disconnect failed');
    } finally {
      setDisconnecting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'expiring_soon':
        return 'secondary';
      case 'expired':
        return 'destructive';
      case 'error':
        return 'destructive';
      case 'revoked':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'expiring_soon':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'expired':
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-muted-foreground">Carregando status da integração...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Mercado Livre
            </div>
            {status?.hasIntegration && (
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStatus}
                className="ml-auto"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {status?.hasIntegration && status.integration ? (
            <>
              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(status.integration.status)}
                  <div>
                    <p className="font-medium">
                      Conectado como {status.integration.ml_nickname}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ID: {status.integration.ml_user_id}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusColor(status.integration.status)}>
                  {status.integration.status}
                </Badge>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {status.integration.product_count || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Produtos
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {status.integration.error_count || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Erros
                  </div>
                </div>
              </div>

              {/* Token Expiry Warning */}
              {status.integration.status === 'expiring_soon' && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Seu token de acesso expira em breve. A renovação será feita automaticamente.
                  </AlertDescription>
                </Alert>
              )}

              {/* Details */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Token expira em:</span>
                  <span>
                    {formatDistanceToNow(
                      new Date(status.integration.token_expires_at),
                      { addSuffix: true, locale: ptBR }
                    )}
                  </span>
                </div>
                
                {status.integration.last_sync_at && (
                  <div className="flex justify-between">
                    <span>Última sincronização:</span>
                    <span>
                      {formatDistanceToNow(
                        new Date(status.integration.last_sync_at),
                        { addSuffix: true, locale: ptBR }
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Permissões:</span>
                  <span>{status.integration.scopes.join(', ')}</span>
                </div>

                <div className="flex justify-between">
                  <span>Sincronização automática:</span>
                  <span>
                    {status.integration.auto_sync_enabled ? 'Ativada' : 'Desativada'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(
                    `https://www.mercadolivre.com.br/perfil/${status.integration!.ml_nickname}`,
                    '_blank'
                  )}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Perfil ML
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/dashboard/ml/products', '_self')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Ver Produtos
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={disconnectML}
                  disabled={disconnecting}
                >
                  {disconnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {disconnecting ? 'Desconectando...' : 'Desconectar'}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Not Connected State */}
              <div className="text-center py-6">
                <div className="flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                
                <h3 className="font-medium mb-2">
                  Não conectado ao Mercado Livre
                </h3>
                
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Conecte sua conta do Mercado Livre para sincronizar produtos, 
                  gerenciar vendas e receber notificações automáticas sobre seu negócio.
                </p>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-6">
                  <p>✓ Sincronização automática de produtos</p>
                  <p>✓ Gestão centralizada de vendas</p>
                  <p>✓ Notificações em tempo real</p>
                  <p>✓ Análise de performance</p>
                </div>

                <Button
                  onClick={connectToML}
                  disabled={connecting}
                  size="lg"
                  className="w-full max-w-xs"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Store className="w-4 h-4 mr-2" />
                      Conectar ao Mercado Livre
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}