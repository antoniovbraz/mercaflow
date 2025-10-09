import { MLConnectionStatus } from '@/components/ml/ConnectionStatus';
import { MLProductManager } from '@/components/ml/ProductManager';
import MLOrderManagerNew from '@/components/ml/OrderManagerNew';
import { MLQuestionManager } from '@/components/ml/QuestionManager';
import MLMessageManager from '@/components/ml/MessageManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Component to handle success message
function SuccessMessage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  if (searchParams?.connected === 'success') {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-bold text-green-800">
                🎉 Conexão Estabelecida!
              </h3>
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                ✅ ATIVO
              </span>
            </div>
            <p className="text-green-700 mb-3">
              Conexão com Mercado Livre realizada com sucesso! Sua integração está funcionando perfeitamente.
            </p>
            <div className="flex items-center text-sm text-green-600 bg-white/60 rounded-lg p-3">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span className="font-medium">Agora você pode gerenciar produtos, pedidos e muito mais através do MercaFlow!</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default async function MLDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  // Use getCurrentUser instead of requireRole to avoid exceptions
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Optional: Check user role for display purposes (keeping for future use)
  // const userRole = await getUserRole();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-yellow-400/10 to-orange-600/10 blur-3xl" />
        <div className="absolute top-80 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-orange-400/10 to-red-600/10 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-gradient-to-br from-red-400/10 to-pink-600/10 blur-3xl" />
      </div>

      {/* Navigation Header */}
      <nav className="relative bg-white/90 backdrop-blur-md shadow-lg border-b border-orange-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="group inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                <span>Voltar ao Dashboard</span>
              </Link>
              <div className="border-l border-orange-200 h-6"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Mercado Livre Integration
                </h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-4 py-2 mb-6">
              <span className="text-2xl">🚀</span>
              <span className="text-sm font-medium text-orange-800">
                Integração Premium
              </span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Integração{' '}
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Mercado Livre
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Gerencie seus produtos e vendas do Mercado Livre de forma centralizada com 
              <strong> tecnologia world-class</strong> e sincronização em tempo real.
            </p>

            {/* Quick Stats Badges */}
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-gray-700">Sincronização ativa</span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                <span className="text-sm font-medium text-orange-600">📊</span>
                <span className="text-sm font-medium text-gray-700">Analytics ML</span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                <span className="text-sm font-medium text-red-600">⚡</span>
                <span className="text-sm font-medium text-gray-700">API nativa ML</span>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <SuccessMessage searchParams={resolvedSearchParams} />

          {/* Connection Status */}
          <MLConnectionStatus />

          {/* Main Content */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-orange-100/50">
            <Tabs defaultValue="products" className="p-8">
              <div className="mb-8">
                <TabsList className="grid w-full grid-cols-4 lg:w-[700px] mx-auto bg-gradient-to-r from-orange-50 to-yellow-50 p-1 rounded-xl border border-orange-200/50">
                  <TabsTrigger 
                    value="products" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white font-medium transition-all duration-200 rounded-lg"
                  >
                    🛍️ Produtos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="orders" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white font-medium transition-all duration-200 rounded-lg"
                  >
                    📦 Pedidos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="questions" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white font-medium transition-all duration-200 rounded-lg"
                  >
                    ❓ Perguntas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="messages" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-medium transition-all duration-200 rounded-lg"
                  >
                    💬 Mensagens
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="products" className="mt-6">
                <MLProductManager />
              </TabsContent>
              
              <TabsContent value="orders" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Gerenciamento de Pedidos</h3>
                    <Link 
                      href="/pedidos"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Ver Todos os Pedidos
                    </Link>
                  </div>
                  <MLOrderManagerNew />
                </div>
              </TabsContent>
              
              <TabsContent value="questions" className="mt-6">
                <MLQuestionManager />
              </TabsContent>
              
              <TabsContent value="messages" className="mt-6">
                <MLMessageManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}