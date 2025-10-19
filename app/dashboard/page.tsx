import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/supabase/server";
import { getUserRole, hasRole } from "@/utils/supabase/roles";
import { signOutAction } from "../login/actions";
import Link from "next/link";
import { DashboardStats } from "./components/DashboardStats";
import { NotificationsWidget } from "@/components/dashboard/NotificationsWidget";

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
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-xl">
            <span className="text-2xl">🚀</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
            Bem-vindo ao MercaFlow
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sua plataforma profissional de integração e-commerce. Centralize
            suas vendas, gerencie produtos e potencialize seu negócio digital.
          </p>
        </div>

        {/* Modern Stats Cards */}
        <DashboardStats />

        {/* Notifications Widget */}
        <div className="mb-8">
          <NotificationsWidget />
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {/* Mercado Livre Integration - Featured */}
          <div className="lg:col-span-2 xl:col-span-1 bg-gradient-to-br from-yellow-50 to-orange-50 overflow-hidden shadow-xl rounded-2xl border border-yellow-200/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-7 h-7 text-white"
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
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      PRINCIPAL
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Mercado Livre
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Conecte sua conta, sincronize produtos e gerencie vendas de
                    forma centralizada
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Sincronização automática de produtos
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Gestão centralizada de vendas
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Notificações em tempo real
                </div>
              </div>

              <Link
                href="/dashboard/ml"
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-block text-center"
              >
                Gerenciar Integração ML
              </Link>
            </div>
          </div>

          {/* Products Management */}
          <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-gray-100/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center mb-4">
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
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Produtos
                  </h3>
                  <p className="text-sm text-gray-500">Gerencie catálogo</p>
                </div>
              </div>
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <p>• Cadastro e edição</p>
                <p>• Controle de estoque</p>
                <p>• Otimização de preços</p>
              </div>
              <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg">
                Gerenciar Produtos
              </button>
            </div>
          </div>

          {/* Analytics & Reports */}
          <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-gray-100/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center mb-4">
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
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Analytics
                  </h3>
                  <p className="text-sm text-gray-500">Relatórios e métricas</p>
                </div>
              </div>
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <p>• Vendas por período</p>
                <p>• Performance produtos</p>
                <p>• Análise de conversão</p>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg">
                Ver Relatórios
              </button>
            </div>
          </div>
        </div>

        {/* Additional Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Orders Management */}
          <div className="bg-white/60 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-gray-100/50 hover:shadow-xl transition-all duration-300">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
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
                <h4 className="ml-3 font-semibold text-gray-900 text-sm">
                  Pedidos
                </h4>
              </div>
              <p className="text-xs text-gray-600 mb-3">Gerencie vendas</p>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                Ver Pedidos
              </button>
            </div>
          </div>

          {/* Customers */}
          <div className="bg-white/60 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-gray-100/50 hover:shadow-xl transition-all duration-300">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    ></path>
                  </svg>
                </div>
                <h4 className="ml-3 font-semibold text-gray-900 text-sm">
                  Clientes
                </h4>
              </div>
              <p className="text-xs text-gray-600 mb-3">Base de clientes</p>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                Ver Clientes
              </button>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white/60 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-gray-100/50 hover:shadow-xl transition-all duration-300">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m4 0H3v18h18V4z"
                    ></path>
                  </svg>
                </div>
                <h4 className="ml-3 font-semibold text-gray-900 text-sm">
                  Estoque
                </h4>
              </div>
              <p className="text-xs text-gray-600 mb-3">Controle inventário</p>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                Ver Estoque
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white/60 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-gray-100/50 hover:shadow-xl transition-all duration-300">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
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
                <h4 className="ml-3 font-semibold text-gray-900 text-sm">
                  Configurações
                </h4>
              </div>
              <p className="text-xs text-gray-600 mb-3">Personalizar sistema</p>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                Configurar
              </button>
            </div>
          </div>
        </div>

        {/* Super Admin Panel */}
        {isSuperAdmin && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200/50 overflow-hidden shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <svg
                        className="w-8 h-8 text-white"
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
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Painel Super Admin
                        </h3>
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full animate-pulse">
                          ADMIN SYSTEM
                        </span>
                      </div>
                      <p className="text-gray-600 text-lg">
                        Controle total do sistema, usuários, integrações e
                        configurações avançadas
                      </p>
                      <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 text-red-500 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            ></path>
                          </svg>
                          Gestão de Usuários
                        </span>
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 text-red-500 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            ></path>
                          </svg>
                          Permissões RBAC
                        </span>
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 text-red-500 mr-1"
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
                          Config. Sistema
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex space-x-4">
                  <Link
                    href="/admin"
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-block"
                  >
                    Acessar Painel Admin
                  </Link>
                  <button className="bg-white/80 hover:bg-white text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg border border-gray-200">
                    Ver Logs Sistema
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Information & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Information */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Informações da Conta
                </h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">
                      Email
                    </dt>
                    <dd className="flex items-center space-x-2">
                      <span className="text-gray-900 font-medium">
                        {user.email}
                      </span>
                      {user.email_confirmed_at ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4"
                            ></path>
                          </svg>
                          Verificado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          Pendente
                        </span>
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">
                      Nível de Acesso
                    </dt>
                    <dd>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          userRole === "super_admin"
                            ? "bg-gradient-to-r from-red-100 to-pink-100 text-red-800"
                            : userRole === "admin"
                            ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800"
                            : "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800"
                        }`}
                      >
                        {userRole === "super_admin"
                          ? "⚡ Super Administrador"
                          : userRole === "admin"
                          ? "👤 Administrador"
                          : "👤 Usuário"}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">
                      Membro desde
                    </dt>
                    <dd className="text-gray-900 font-medium">
                      {new Date(user.created_at).toLocaleDateString("pt-BR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">
                      ID do Usuário
                    </dt>
                    <dd className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded border">
                      {user.id}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">
                      Status da Conta
                    </dt>
                    <dd className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-600 font-medium">Ativo</span>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">
                      Plano
                    </dt>
                    <dd>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800">
                        ⭐ Profissional
                      </span>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100/50 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Ações Rápidas
              </h4>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 text-left rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        ></path>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Editar Perfil
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>

                <button className="w-full flex items-center justify-between p-3 text-left rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Verificar Email
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>

                <button className="w-full flex items-center justify-between p-3 text-left rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        ></path>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Alterar Senha
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 shadow-lg rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Suporte
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Precisa de ajuda? Nossa equipe está pronta para atender você.
              </p>
              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg">
                Falar com Suporte
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
