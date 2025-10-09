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
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Conexão com Mercado Livre realizada com sucesso!
            </p>
            <p className="text-sm text-green-700 mt-1">
              Agora você pode gerenciar seus produtos e pedidos diretamente pelo MercaFlow.
            </p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Voltar ao Dashboard
              </Link>
              <div className="border-l border-gray-300 h-6"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                Mercado Livre Integration
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Integração Mercado Livre</h2>
            <p className="text-gray-600">
              Gerencie seus produtos e vendas do Mercado Livre de forma centralizada
            </p>
          </div>

          {/* Success Message */}
          <SuccessMessage searchParams={resolvedSearchParams} />

          {/* Connection Status */}
          <MLConnectionStatus />

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow">
            <Tabs defaultValue="products" className="p-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="orders">Pedidos</TabsTrigger>
                <TabsTrigger value="questions">Perguntas</TabsTrigger>
                <TabsTrigger value="messages">Mensagens</TabsTrigger>
              </TabsList>
              
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