'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Store, AlertCircle } from 'lucide-react';

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
}

interface IntegrationStatus {
  hasIntegration: boolean;
  integration?: MLIntegration;
}

interface MLContentWrapperProps {
  children: React.ReactNode;
}

export function MLContentWrapper({ children }: MLContentWrapperProps) {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    
    // Listen for custom events when ML connection status changes
    const handleConnectionChange = () => {
      fetchStatus();
    };
    
    window.addEventListener('ml-connection-changed', handleConnectionChange);
    
    return () => {
      window.removeEventListener('ml-connection-changed', handleConnectionChange);
    };
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
    } catch (err) {
      console.error('Failed to fetch ML integration status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Verificando conexão...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-400" />
            <p className="text-red-600 font-medium mb-2">Erro ao verificar conexão</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show not connected state
  if (!status?.hasIntegration) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-900 font-medium mb-2">Conecte sua conta do Mercado Livre</p>
            <p className="text-gray-600 mb-6">
              Para gerenciar produtos e pedidos, primeiro conecte sua conta do Mercado Livre acima.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show content if connected and active
  if (status.integration?.status === 'active') {
    return <>{children}</>;
  }

  // Show integration issues
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-yellow-500" />
          <p className="text-gray-900 font-medium mb-2">Problema na integração</p>
          <p className="text-gray-600 mb-2">
            Status da integração: <span className="font-mono">{status.integration?.status}</span>
          </p>
          <p className="text-gray-600 text-sm">
            Reconecte sua conta do Mercado Livre para resolver o problema.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}