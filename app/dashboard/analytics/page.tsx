import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/supabase/server";
import Link from "next/link";
import { ElasticityChart } from "@/components/analytics/ElasticityChart";

export default async function AnalyticsPage() {
  // Require authentication
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-600/10 blur-3xl" />
        <div className="absolute top-80 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-600/10 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="border-b border-gray-200/50 bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Voltar ao Dashboard
                </Link>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Analytics Intelligence
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Análises avançadas: Elasticidade, Forecast e Competitividade
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  Em Tempo Real
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Elasticidade Média */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Elasticidade Média
              </h3>
              <p className="text-2xl font-bold text-gray-900">-1.2</p>
              <p className="text-xs text-gray-500 mt-1">
                Demanda elástica detectada
              </p>
            </div>

            {/* Forecast Accuracy */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Precisão Forecast
              </h3>
              <p className="text-2xl font-bold text-gray-900">87%</p>
              <p className="text-xs text-gray-500 mt-1">Últimos 30 dias</p>
            </div>

            {/* Posição Competitiva */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Posição Competitiva
              </h3>
              <p className="text-2xl font-bold text-gray-900">2º</p>
              <p className="text-xs text-gray-500 mt-1">De 15 vendedores</p>
            </div>

            {/* ROI Potencial */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                ROI Potencial
              </h3>
              <p className="text-2xl font-bold text-gray-900">R$ 8.5k</p>
              <p className="text-xs text-gray-500 mt-1">
                Otimizações sugeridas
              </p>
            </div>
          </div>

          {/* Analytics Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Elasticidade de Preços */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100/50 shadow-xl">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Elasticidade de Preços
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Curva preço-demanda e pontos ótimos
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ElasticityChart compactMode={false} />
              </div>
            </div>

            {/* Forecast 30/60/90 dias */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100/50 shadow-xl">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Forecast de Vendas
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Previsões 30/60/90 dias com intervalos
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {/* ForecastChart será inserido aqui */}
                <div className="h-80 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-200">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-purple-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      />
                    </svg>
                    <p className="text-gray-600 font-medium mb-2">
                      Gráfico de Forecast
                    </p>
                    <p className="text-sm text-gray-500">
                      Em desenvolvimento - Sprint 2
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Análise Competitiva */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100/50 shadow-xl lg:col-span-2">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Análise Competitiva
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Benchmarking com principais concorrentes
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {/* CompetitorAnalysis será inserido aqui */}
                <div className="h-80 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-dashed border-green-200">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-green-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                    <p className="text-gray-600 font-medium mb-2">
                      Tabela Competitiva
                    </p>
                    <p className="text-sm text-gray-500">
                      Em desenvolvimento - Sprint 2
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              💡 Insights Rápidos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/80 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Melhor Hora para Ajuste
                </p>
                <p className="text-xs text-gray-600">
                  Terça-feira, 10h-12h - Pico de visualizações
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Categoria em Alta
                </p>
                <p className="text-xs text-gray-600">
                  Eletrônicos: +32% demanda vs semana anterior
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Oportunidade Detectada
                </p>
                <p className="text-xs text-gray-600">
                  3 produtos com preço 15% abaixo do ideal
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
