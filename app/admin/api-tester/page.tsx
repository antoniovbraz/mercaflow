"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface APITestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  data?: unknown;
  error?: string;
  responseTime: number;
}

export default function APITestPage() {
  const [results, setResults] = useState<APITestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");

  // Lista de endpoints para testar
  const endpoints = [
    {
      category: "Settings",
      apis: [
        { name: "Get Settings", method: "GET", path: "/api/settings" },
        { 
          name: "Update Settings", 
          method: "PUT", 
          path: "/api/settings",
          body: { notifications_enabled: true, auto_reprice: false, min_margin: 15.5 }
        },
      ]
    },
    {
      category: "Analytics",
      apis: [
        { name: "Price Elasticity", method: "GET", path: "/api/analytics/elasticity?days=30" },
        { name: "Forecast", method: "GET", path: "/api/analytics/forecast?historical_days=30&forecast_days=7" },
        { name: "Competitors", method: "GET", path: "/api/analytics/competitors?limit=5" },
      ]
    },
    {
      category: "Dashboard",
      apis: [
        { name: "KPIs", method: "GET", path: "/api/dashboard/kpis" },
      ]
    },
    {
      category: "Mercado Livre",
      apis: [
        { name: "ML Auth Status", method: "GET", path: "/api/ml/auth/status" },
        { name: "ML Products", method: "GET", path: "/api/ml/products" },
        { name: "ML Orders", method: "GET", path: "/api/ml/orders" },
      ]
    },
  ];

  const testAPI = async (endpoint: string, method: string, body?: Record<string, unknown>) => {
    const startTime = performance.now();

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint, options);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      let data;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }

      const result: APITestResult = {
        endpoint,
        method,
        status: response.status,
        success: response.ok,
        data,
        responseTime,
      };

      if (!response.ok) {
        result.error = data.error || data.message || `HTTP ${response.status}`;
      }

      setResults(prev => [result, ...prev]);
      return result;
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      const result: APITestResult = {
        endpoint,
        method,
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      };

      setResults(prev => [result, ...prev]);
      return result;
    }
  };

  const testAllEndpoints = async () => {
    setIsLoading(true);
    setResults([]);

    for (const category of endpoints) {
      for (const api of category.apis) {
        await testAPI(api.path, api.method, api.body);
        // Pequeno delay entre requisições
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    setIsLoading(false);
  };

  const testCategory = async (categoryName: string) => {
    setIsLoading(true);

    const category = endpoints.find(c => c.category === categoryName);
    if (!category) return;

    for (const api of category.apis) {
      await testAPI(api.path, api.method, api.body);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusColor = (status: number) => {
    if (status === 0) return "destructive";
    if (status >= 200 && status < 300) return "default";
    if (status === 401) return "secondary";
    if (status >= 400) return "destructive";
    return "outline";
  };

  const filteredResults = selectedTab === "all" 
    ? results 
    : results.filter(r => {
        if (selectedTab === "success") return r.success;
        if (selectedTab === "error") return !r.success;
        return true;
      });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 API Testing Console</h1>
        <p className="text-muted-foreground">
          Teste todos os endpoints protegidos com sua sessão atual
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-6">
        <Button 
          onClick={testAllEndpoints} 
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? "Testando..." : "🚀 Testar Todos"}
        </Button>
        <Button 
          onClick={clearResults} 
          variant="outline"
          disabled={results.length === 0}
        >
          🗑️ Limpar
        </Button>
      </div>

      {/* Quick Test Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {endpoints.map(category => (
          <Card key={category.category} className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{category.category}</CardTitle>
              <CardDescription className="text-xs">
                {category.apis.length} endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => testCategory(category.category)}
                disabled={isLoading}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                Testar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
            <CardDescription>
              {results.length} teste{results.length !== 1 ? 's' : ''} executado{results.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  Todos ({results.length})
                </TabsTrigger>
                <TabsTrigger value="success">
                  Sucesso ({results.filter(r => r.success).length})
                </TabsTrigger>
                <TabsTrigger value="error">
                  Erros ({results.filter(r => !r.success).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab}>
                <div className="space-y-4">
                  {filteredResults.map((result, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{result.method}</Badge>
                            <Badge variant={getStatusColor(result.status)}>
                              {result.status || 'ERROR'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {result.responseTime}ms
                            </span>
                          </div>
                          <span className={result.success ? "text-green-600" : "text-red-600"}>
                            {result.success ? "✓" : "✗"}
                          </span>
                        </div>
                        <CardTitle className="text-sm font-mono">
                          {result.endpoint}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {result.error ? (
                          <div className="bg-red-50 dark:bg-red-950 p-3 rounded border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-600 dark:text-red-400">
                              ❌ {result.error}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-green-50 dark:bg-green-950 p-3 rounded border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                              ✓ Resposta recebida
                            </p>
                            <pre className="text-xs overflow-auto max-h-40 bg-background p-2 rounded">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {results.length === 0 && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">
              Nenhum teste executado ainda
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Clique em &quot;Testar Todos&quot; ou selecione uma categoria específica
            </p>
            <Button onClick={testAllEndpoints}>
              Começar Testes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="mt-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-700 dark:text-blue-300">
            ℹ️ Informações
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-600 dark:text-blue-400 space-y-2">
          <p>• Esta página testa os endpoints usando sua sessão atual (cookies)</p>
          <p>• Status 401 = Não autenticado (faça login primeiro)</p>
          <p>• Status 200 = Sucesso</p>
          <p>• Status 403 = Sem permissão (verifique seu tenant)</p>
          <p>• Status 500 = Erro do servidor</p>
        </CardContent>
      </Card>
    </div>
  );
}
