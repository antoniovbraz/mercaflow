"use client";

import { useState, useEffect } from "react";

interface DashboardSummary {
  integrations: {
    total: number;
    active: number;
    inactive: number;
    lastSync: string | null;
  };
  orders: {
    total: number;
    revenue: number;
    recentRevenue: number;
    byStatus: Record<string, number>;
    recentCount: number;
  };
  products: {
    total: number;
    active: number;
    inventory: number;
    sold: number;
    averagePrice: number;
  };
  webhooks: {
    total: number;
    byStatus: Record<string, number>;
    byTopic: Record<string, number>;
    last24h: number;
  };
  performance: {
    webhookSuccessRate: number;
    integrationHealthScore: number;
  };
}

export function DashboardStats() {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardSummary();
  }, []);

  const loadDashboardSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/summary");

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.dashboard);
      }
    } catch {
      // Removed console.error - errors handled by error boundaries;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {/* Revenue Card */}
      <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-gray-100/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita (30d)</p>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-900">
                    R${" "}
                    {(dashboardData?.orders?.revenue || 0).toLocaleString(
                      "pt-BR",
                      { minimumFractionDigits: 2 }
                    )}
                  </p>
                  <p className="text-sm text-green-600 flex items-center">
                    <span className="text-xs mr-1">↗</span>
                    R${" "}
                    {(dashboardData?.orders?.recentRevenue || 0).toLocaleString(
                      "pt-BR",
                      { minimumFractionDigits: 2 }
                    )}{" "}
                    últimos 7d
                  </p>
                </>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Card */}
      <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-gray-100/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos (30d)</p>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardData?.orders?.total || 0}
                  </p>
                  <p className="text-sm text-blue-600 flex items-center">
                    <span className="text-xs mr-1">→</span>{" "}
                    {dashboardData?.orders?.recentCount || 0} últimos 7d
                  </p>
                </>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Products Card */}
      <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-gray-100/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Produtos Ativos
              </p>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardData?.products?.active || 0}
                  </p>
                  <p className="text-sm text-purple-600 flex items-center">
                    <span className="text-xs mr-1">◆</span>{" "}
                    {dashboardData?.products?.total || 0} total
                  </p>
                </>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Card */}
      <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-gray-100/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Integrações</p>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardData?.integrations?.active || 0}
                  </p>
                  <p className="text-sm text-orange-600 flex items-center">
                    <span className="text-xs mr-1">⚡</span>
                    {(dashboardData?.integrations?.active || 0) > 0
                      ? "Mercado Livre"
                      : "Nenhuma ativa"}
                  </p>
                </>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
