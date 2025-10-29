/**
 * MercaFlow - ML Token Viewer (Admin Only)
 *
 * Simple page to view and copy ML access token for testing
 */

"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface TokenData {
  success: boolean;
  integration?: {
    id: string;
    ml_user_id: number;
    created_at: string;
    updated_at: string;
    expires_at: string;
    is_expired: boolean;
    expires_in_minutes: number;
  };
  token?: {
    access_token: string;
    token_type: string;
    length: number;
    preview: string;
  };
  usage?: {
    curl_example: string;
    powershell_example: string;
  };
  error?: string;
  message?: string;
}

export default function MLTokenPage() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ml/debug-token");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setTokenData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch token");
      setTokenData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>🔑 ML Access Token</CardTitle>
            <CardDescription>Loading token information...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>🔑 ML Access Token</CardTitle>
            <CardDescription>
              View and copy your Mercado Livre token
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>

            {error.includes("No ML integration") && (
              <Alert>
                <AlertDescription>
                  <strong>Como resolver:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>
                      Vá para{" "}
                      <a href="/ml/auth" className="text-blue-600 underline">
                        /ml/auth
                      </a>
                    </li>
                    <li>Clique em &quot;Conectar com Mercado Livre&quot;</li>
                    <li>Autorize a aplicação</li>
                    <li>Volte aqui para ver o token</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}

            {error.includes("Super admin") && (
              <Alert>
                <AlertDescription>
                  <strong>Acesso Negado:</strong> Este recurso requer permissão
                  de super_admin.
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={fetchToken} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenData?.success || !tokenData.token) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>🔑 ML Access Token</CardTitle>
            <CardDescription>No token available</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Nenhum token encontrado. Configure a integração ML primeiro.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { integration, token, usage } = tokenData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🔑 ML Access Token</h1>
          <p className="text-gray-600 mt-1">
            Token descriptografado para testes de API do Mercado Livre
          </p>
        </div>
        <Button onClick={fetchToken} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Integration Info */}
      {integration && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Informações da Integração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Integration ID</p>
                <p className="font-mono text-sm">{integration.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ML User ID</p>
                <p className="font-mono text-sm">{integration.ml_user_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Criado em</p>
                <p className="text-sm">
                  {new Date(integration.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Atualizado em</p>
                <p className="text-sm">
                  {new Date(integration.updated_at).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm text-gray-600 mb-2">Status do Token</p>
              {integration.is_expired ? (
                <Badge variant="destructive">❌ Token Expirado</Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-600">
                    ✓ Token Válido
                  </Badge>
                  <span className="text-sm text-gray-600">
                    (expira em {integration.expires_in_minutes} minutos)
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Expira em:{" "}
                {new Date(integration.expires_at).toLocaleString("pt-BR")}
              </p>
            </div>

            {integration.is_expired && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Token expirado! Reconecte com Mercado Livre em{" "}
                  <a href="/ml/auth" className="underline font-semibold">
                    /ml/auth
                  </a>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Token Display */}
      <Card>
        <CardHeader>
          <CardTitle>🔐 Access Token</CardTitle>
          <CardDescription>
            Token descriptografado - copie e use para testes diretos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600">Token Completo</p>
              <Button
                onClick={() => copyToClipboard(token.access_token)}
                size="sm"
                variant="outline"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Token
                  </>
                )}
              </Button>
            </div>
            <div className="bg-gray-100 p-4 rounded-md border">
              <code className="text-sm font-mono break-all">
                {token.access_token}
              </code>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tipo: {token.token_type} | Tamanho: {token.length} caracteres
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      {usage && (
        <Card>
          <CardHeader>
            <CardTitle>📝 Exemplos de Uso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold">cURL</p>
                <Button
                  onClick={() => copyToClipboard(usage.curl_example)}
                  size="sm"
                  variant="ghost"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
                <code className="text-xs font-mono whitespace-pre">
                  {usage.curl_example}
                </code>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold">PowerShell</p>
                <Button
                  onClick={() => copyToClipboard(usage.powershell_example)}
                  size="sm"
                  variant="ghost"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-blue-900 text-blue-100 p-3 rounded-md overflow-x-auto">
                <code className="text-xs font-mono whitespace-pre">
                  {usage.powershell_example}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Test Links */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Testes Rápidos</CardTitle>
          <CardDescription>
            Use esses comandos para testar as APIs do ML diretamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold">User Info:</p>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto">
              {`curl -X GET 'https://api.mercadolibre.com/users/me' -H 'Authorization: Bearer ${token.access_token}'`}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Produtos Ativos:</p>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto">
              {`curl -X GET 'https://api.mercadolibre.com/users/me/items/search?status=active' -H 'Authorization: Bearer ${token.access_token}'`}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Pedidos Recentes:</p>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto">
              {`curl -X GET 'https://api.mercadolibre.com/orders/search?seller=me' -H 'Authorization: Bearer ${token.access_token}'`}
            </div>
          </div>

          <Alert>
            <AlertDescription>
              💡 <strong>Dica:</strong> Use o script PowerShell para testar
              todas as APIs de uma vez:
              <br />
              <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                {`.\\test_ml_token.ps1 -AccessToken "${token.access_token}"`}
              </code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
