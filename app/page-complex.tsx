import { getCurrentUser } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  // Check if user is authenticated
  const user = await getCurrentUser()
  
  // If authenticated, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="w-full px-4 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">MercaFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Entrar
            </Link>
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            A plataforma world-class para
            <span className="text-blue-600 block">integração com Mercado Livre</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Otimize suas vendas, monitore a concorrência e automatize sua operação no Mercado Livre 
            com inteligência artificial e analytics avançados.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg"
            >
              Começar Agora - Grátis
            </Link>
            <Link 
              href="/login" 
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 font-semibold text-lg"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 text-2xl">📈</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Otimização de Preços</h3>
            <p className="text-gray-600">
              IA avançada analisa a concorrência e sugere preços otimizados para maximizar suas vendas e margem.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Análise Competitiva</h3>
            <p className="text-gray-600">
              Monitore seus concorrentes em tempo real e receba alertas quando perder posições no ranking.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-purple-600 text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Automação Completa</h3>
            <p className="text-gray-600">
              Sincronização automática, webhooks em tempo real e integração nativa com todas as APIs do ML.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 MercaFlow. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  )
}