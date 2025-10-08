import { createClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/supabase/roles'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDashboard() {
  // Require super_admin role
  const profile = await requireRole('super_admin')
  
  if (!profile) {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  
  // Get platform statistics
  const { data: users } = await supabase
    .from('profiles')
    .select('id, role, created_at')
  
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  
  const stats = {
    totalUsers: authUsers?.users?.length || 0,
    superAdmins: users?.filter(u => u.role === 'super_admin').length || 0,
    admins: users?.filter(u => u.role === 'admin').length || 0,
    regularUsers: users?.filter(u => u.role === 'user').length || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black">
      {/* Navigation Header */}
      <nav className="bg-black/20 backdrop-blur-md shadow-2xl border-b border-red-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-sm text-red-300 hover:text-red-100 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Voltar ao Dashboard
              </Link>
              <div className="border-l border-red-500/30 h-6"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-xl">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Super Admin Console
                  </h1>
                  <p className="text-xs text-red-300 -mt-1">
                    Sistema de Controle Total
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-700 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                  SUPER ADMIN
                </span>
                <span className="text-red-300 text-sm font-medium">
                  {profile.profiles?.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl mb-4 shadow-2xl animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white mb-3">
            Painel de Administração
          </h2>
          <p className="text-lg text-red-200 max-w-2xl mx-auto">
            Controle total da plataforma MercaFlow. Gerencie usuários, monitorize sistema e configure integrações com poder máximo.
          </p>
        </div>

        {/* Advanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-black/20 backdrop-blur-md overflow-hidden shadow-2xl rounded-2xl border border-red-500/20 hover:border-red-400/30 transition-all duration-300 hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-300">Total de Usuários</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-sm text-green-400 flex items-center">
                    <span className="text-xs mr-1">↗</span> +12% este mês
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md overflow-hidden shadow-2xl rounded-2xl border border-red-500/20 hover:border-red-400/30 transition-all duration-300 hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-300">Super Admins</p>
                  <p className="text-3xl font-bold text-white">{stats.superAdmins}</p>
                  <p className="text-sm text-red-400 flex items-center">
                    <span className="text-xs mr-1">⚡</span> Máximo poder
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md overflow-hidden shadow-2xl rounded-2xl border border-red-500/20 hover:border-red-400/30 transition-all duration-300 hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-300">Administradores</p>
                  <p className="text-3xl font-bold text-white">{stats.admins}</p>
                  <p className="text-sm text-blue-400 flex items-center">
                    <span className="text-xs mr-1">👤</span> Gestores
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md overflow-hidden shadow-2xl rounded-2xl border border-red-500/20 hover:border-red-400/30 transition-all duration-300 hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-300">Usuários Ativos</p>
                  <p className="text-3xl font-bold text-white">{stats.regularUsers}</p>
                  <p className="text-sm text-purple-400 flex items-center">
                    <span className="text-xs mr-1">◆</span> Clientes
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Control Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* User Management */}
          <div className="bg-black/20 backdrop-blur-md overflow-hidden shadow-2xl rounded-2xl border border-red-500/20 hover:border-red-400/30 transition-all duration-300 hover:-translate-y-1">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-xl">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                      </svg>
                    </div>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full">
                      USUÁRIOS
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Gerenciar Usuários
                  </h3>
                  <p className="text-red-200 text-sm leading-relaxed">
                    Controle total sobre usuários, roles e permissões do sistema
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-red-300">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Criar, editar e remover usuários
                </div>
                <div className="flex items-center text-sm text-red-300">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Alterar roles e permissões
                </div>
                <div className="flex items-center text-sm text-red-300">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Monitorar atividades
                </div>
              </div>

              <Link 
                href="/admin/users"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 inline-block text-center"
              >
                Gerenciar Usuários
              </Link>
            </div>
          </div>

          {/* System Configuration */}
          <div className="bg-black/20 backdrop-blur-md overflow-hidden shadow-2xl rounded-2xl border border-red-500/20 hover:border-red-400/30 transition-all duration-300 hover:-translate-y-1">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-xl">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-full">
                      SISTEMA
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Configurações
                  </h3>
                  <p className="text-red-200 text-sm leading-relaxed">
                    Parâmetros globais, integrações e configurações avançadas
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-red-300">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Variáveis de ambiente
                </div>
                <div className="flex items-center text-sm text-red-300">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  APIs e webhooks
                </div>
                <div className="flex items-center text-sm text-red-300">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Configurações de segurança
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5">
                Configurar Sistema
              </button>
            </div>
          </div>

          {/* System Monitoring */}
          <div className="bg-black/20 backdrop-blur-md overflow-hidden shadow-2xl rounded-2xl border border-red-500/20 hover:border-red-400/30 transition-all duration-300 hover:-translate-y-1">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-xl">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full">
                      MONITORAMENTO
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Analytics & Logs
                  </h3>
                  <p className="text-red-200 text-sm leading-relaxed">
                    Monitore performance, logs e métricas do sistema
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-red-300">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Logs de sistema e erros
                </div>
                <div className="flex items-center text-sm text-red-300">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Métricas de performance
                </div>
                <div className="flex items-center text-sm text-red-300">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Relatórios avançados
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5">
                Ver Analytics
              </button>
            </div>
          </div>
        </div>

        {/* System Status Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Health */}
          <div className="lg:col-span-2 bg-black/20 backdrop-blur-md shadow-2xl rounded-2xl border border-red-500/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Status do Sistema</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium text-sm">Operacional</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-red-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span className="text-red-200 font-medium">Database</span>
                  </div>
                  <span className="text-green-400 text-sm font-semibold">Online</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-red-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span className="text-red-200 font-medium">API Mercado Livre</span>
                  </div>
                  <span className="text-green-400 text-sm font-semibold">Conectado</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-red-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                    </div>
                    <span className="text-red-200 font-medium">Webhooks</span>
                  </div>
                  <span className="text-yellow-400 text-sm font-semibold">Limitado</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-red-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m4 0H3v18h18V4z"></path>
                      </svg>
                    </div>
                    <span className="text-red-200 font-medium">Storage</span>
                  </div>
                  <span className="text-blue-400 text-sm font-semibold">78% usado</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-red-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <span className="text-red-200 font-medium">Performance</span>
                  </div>
                  <span className="text-purple-400 text-sm font-semibold">Excelente</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-red-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    <span className="text-red-200 font-medium">Segurança</span>
                  </div>
                  <span className="text-green-400 text-sm font-semibold">Protegido</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Critical Actions */}
          <div className="bg-black/20 backdrop-blur-md shadow-2xl rounded-2xl border border-red-500/20 p-6">
            <h4 className="text-xl font-bold text-white mb-6">Ações Críticas</h4>
            <div className="space-y-4">
              <button className="w-full p-4 text-left bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-xl transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Sync Manual</p>
                    <p className="text-green-300 text-xs">Executar agora</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 text-left bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Backup Sistema</p>
                    <p className="text-blue-300 text-xs">Criar backup</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 text-left bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Limpar Cache</p>
                    <p className="text-purple-300 text-xs">Otimizar sistema</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 text-left bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Modo Manutenção</p>
                    <p className="text-red-300 text-xs">CUIDADO</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}