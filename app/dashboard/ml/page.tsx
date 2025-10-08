import { MLConnectionStatus } from '@/components/ml/ConnectionStatus';
import { MLProductManager } from '@/components/ml/ProductManager';
import { MLOrderManager } from '@/components/ml/OrderManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requireRole } from '@/utils/supabase/roles';
import { redirect } from 'next/navigation';

export default async function MLDashboard() {
  // Require authenticated user with user role or higher
  const profile = await requireRole('user');
  
  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Integração Mercado Livre</h1>
        <p className="text-muted-foreground">
          Gerencie seus produtos e vendas do Mercado Livre de forma centralizada
        </p>
      </div>

      {/* Connection Status */}
      <MLConnectionStatus />

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-4">
          <MLProductManager />
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <MLOrderManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}