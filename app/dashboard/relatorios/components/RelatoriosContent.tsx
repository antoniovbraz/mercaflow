"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logger } from "@/utils/logger";

export function RelatoriosContent() {
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalOrders: 0,
    averageTicket: 0,
    topProducts: [],
    conversionRate: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement stats loading from API
      logger.info("Loading stats", { period });

      // Mock data for now
      setStats({
        totalSales: 12450.0,
        totalRevenue: 24900.0,
        totalOrders: 45,
        averageTicket: 553.33,
        topProducts: [],
        conversionRate: 2.5,
      });
    } catch (error) {
      logger.error("Error loading stats", { error });
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const exportToCSV = () => {
    logger.info("Exporting to CSV");
    // TODO: Implement CSV export
    alert("Funcionalidade de exportação será implementada em breve");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Relatórios e Analytics
            </h1>
            <p className="text-gray-600">Análise de desempenho e métricas</p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="1y">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} variant="outline">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Exportar CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Vendas</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              R${" "}
              {stats.totalSales.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Receita Bruta</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              R${" "}
              {stats.totalRevenue.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pedidos</CardDescription>
            <CardTitle className="text-3xl">{stats.totalOrders}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ticket Médio</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              R${" "}
              {stats.averageTicket.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Dia</CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                Gráfico será implementado em breve
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance de Produtos</CardTitle>
            <CardDescription>Top 5 produtos mais vendidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                Gráfico será implementado em breve
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Conversão</CardTitle>
            <CardDescription>Visitas que resultaram em venda</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">
              {stats.conversionRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos Ativos</CardTitle>
            <CardDescription>Anúncios publicados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">--</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tempo Médio de Entrega</CardTitle>
            <CardDescription>Dias úteis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-600">-- dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Note */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-medium text-blue-900 mb-1">
                Funcionalidade em Desenvolvimento
              </p>
              <p className="text-sm text-blue-700">
                Os gráficos e métricas avançadas serão implementados nas
                próximas atualizações. Por enquanto, você pode visualizar as
                estatísticas básicas e exportar relatórios.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
