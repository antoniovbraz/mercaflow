import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/supabase/server";
import { getUserRole, hasRole } from "@/utils/supabase/roles";
import { signOutAction } from "../login/actions";
import Link from "next/link";
import { IntelligenceCenter } from "@/components/dashboard/IntelligenceCenter";
import { QuickMetricsBar } from "@/components/dashboard/QuickMetricsBar";

export default async function DashboardPage() {
  // Require authentication
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Get user role and profile data
  const userRole = await getUserRole();
  const isSuperAdmin = await hasRole("super_admin");
  const isAdmin = await hasRole("admin");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-600/10 blur-3xl" />
        <div className="absolute top-80 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-600/10 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-600/10 blur-3xl" />
      </div>

      {/* Modern Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  <span className="text-white font-bold text-sm">MF</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    MercaFlow
                  </h1>
                  <div className="flex items-center space-x-2 -mt-1">
                    {isSuperAdmin && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                        ⚡ Super Admin
                      </span>
                    )}
                    {isAdmin && !isSuperAdmin && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                        👤 Admin
                      </span>
                    )}
                    {!isAdmin && !isSuperAdmin && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800">
                        📊 Dashboard
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-5 5-5-5h5v-12z"
                    />
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                    />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-3">
                {userRole && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      userRole === "super_admin"
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                        : userRole === "admin"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                    }`}
                  >
                    {userRole === "super_admin"
                      ? "Super Admin"
                      : userRole === "admin"
                      ? "Admin"
                      : "Usuário"}
                  </span>
                )}

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-700">
                      {user.email}
                    </p>
                  </div>
                </div>

                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Sair
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Modern Welcome Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Dashboard Principal
            </h2>
            <p className="text-sm text-gray-600">
              Insights inteligentes e métricas em tempo real
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/ml"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
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
              <span>Mercado Livre</span>
            </Link>
          </div>
        </div>

        {/* Quick Metrics Bar - 30% (Header KPIs) */}
        <div className="mb-8">
          <QuickMetricsBar compactMode={true} />
        </div>

        {/* Intelligence Center - 70% (Main Content) */}
        <div className="mb-8">
          <IntelligenceCenter compactMode={false} />
        </div>

        {/* Navigation Grid - Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Products Management */}
          <Link
            href="/dashboard/produtos"
            className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-gray-100/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
          >
            <div className="p-5">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
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
                <div className="ml-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    Produtos
                  </h3>
                  <p className="text-xs text-gray-500">Catálogo completo</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Gerencie produtos com insights de otimização
              </p>
            </div>
          </Link>

          {/* Analytics */}
          <Link
            href="/dashboard/analytics"
            className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-gray-100/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
          >
            <div className="p-5">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
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
                    ></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    Analytics
                  </h3>
                  <p className="text-xs text-gray-500">Análises avançadas</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Elasticidade, forecast e concorrência
              </p>
            </div>
          </Link>

          {/* Orders */}
          <Link
            href="/dashboard/pedidos"
            className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-gray-100/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
          >
            <div className="p-5">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    Pedidos
                  </h3>
                  <p className="text-xs text-gray-500">Gestão de vendas</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Acompanhe e gerencie seus pedidos
              </p>
            </div>
          </Link>

          {/* Settings */}
          <Link
            href="/dashboard/configuracoes"
            className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-gray-100/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
          >
            <div className="p-5">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    Configurações
                  </h3>
                  <p className="text-xs text-gray-500">Sistema</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Personalize seu dashboard
              </p>
            </div>
          </Link>
        </div>

        {/* Super Admin Panel */}
        {isSuperAdmin && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200/50 overflow-hidden shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
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
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          Painel Super Admin
                        </h3>
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                          ADMIN
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Controle total do sistema e usuários
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/admin"
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Acessar Admin
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Logado como <span className="font-semibold text-gray-700">{user.email}</span> •{" "}
            <span className="font-semibold text-gray-700">
              {userRole === "super_admin"
                ? "Super Admin"
                : userRole === "admin"
                ? "Admin"
                : "Usuário"}
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
