import { MLConnectionStatus } from '@/components/ml/ConnectionStatus';
import { MLProductManager } from '@/components/ml/ProductManager';
import { MLOrderManager } from '@/components/ml/OrderManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requireRole } from '@/utils/supabase/roles';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function MLDashboard() {
  // Require authenticated user with user role or higher
  const profile = await requireRole('user');
  
  if (!profile) {
    redirect('/login');
  }

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

          {/* Connection Status */}
          <MLConnectionStatus />

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow">
            <Tabs defaultValue="products" className="p-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="orders">Pedidos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="products" className="mt-6">
                <MLProductManager />
              </TabsContent>
              
              <TabsContent value="orders" className="mt-6">
                <MLOrderManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}