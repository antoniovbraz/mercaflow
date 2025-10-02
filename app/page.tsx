import Link from 'next/link'
import { ShoppingCart, TrendingUp, Bell, Settings } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Merca Flow</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/api/auth/ml/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Conectar MercadoLibre
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Intelligence Comercial para
            <span className="text-blue-600"> MercadoLibre</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Optimize seus preços, monitore a concorrência e automatize suas vendas com dados reais do MercadoLibre Brasil.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Link
              href="/api/auth/ml/login"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Começar Agora - Grátis
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  Otimização de Preços
                </h3>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Receba sugestões de preços direto do algoritmo do MercadoLibre e monitore sua posição competitiva em tempo real.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-yellow-600" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  Alertas Inteligentes
                </h3>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Seja notificado instantaneamente sobre mudanças importantes: vendas, feedbacks, movimentos da concorrência.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-blue-600" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  Automação Completa
                </h3>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Automatize ajustes de preços, respostas a perguntas e gestão de estoque baseado em intelligence real.
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status do Sistema</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">MercadoLibre API</span>
                <span className="text-sm text-green-600">● Conectado</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Database</span>
                <span className="text-sm text-green-600">● Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Webhooks</span>
                <span className="text-sm text-yellow-600">● Configurando</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}