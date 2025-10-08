import Link from 'next/link'
import { ArrowRight, Play, Star, TrendingUp, Zap } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-600/20 blur-3xl" />
        <div className="absolute top-80 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-600/20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-blue-800">
                #1 Plataforma para Mercado Livre
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              O{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Linktree Premium
              </span>{' '}
              para E-commerce Brasileiro
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Transforme seu negócio no <strong>Mercado Livre</strong> com nossa plataforma world-class. 
              Vitrine profissional + IA + Integração nativa = <strong>até 40% mais vendas</strong> em 6 meses.
            </p>

            {/* Key Benefits */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center lg:justify-start">
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Setup em 15 min</span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">+40% vendas</span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">ROI garantido</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/register"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <span>Começar Grátis por 14 Dias</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="group flex items-center justify-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:shadow-xl transition-all">
                  <Play className="w-5 h-5 text-blue-600 ml-1" />
                </div>
                <span>Ver Demo (2 min)</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Mais de 2.500 vendedores confiam no MercaFlow</p>
              <div className="flex items-center justify-center lg:justify-start space-x-8 opacity-60">
                <div className="text-2xl font-bold text-gray-400">Mercado Livre</div>
                <div className="text-2xl font-bold text-gray-400">Magazine Luiza</div>
                <div className="text-2xl font-bold text-gray-400">Shopee</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual/Dashboard Preview */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Mock Dashboard Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-12 flex items-center px-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
                </div>
              </div>
              
              {/* Mock Dashboard Content */}
              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">+127%</div>
                    <div className="text-xs text-gray-500">Vendas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">R$ 45k</div>
                    <div className="text-xs text-gray-500">Receita</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">2.3k</div>
                    <div className="text-xs text-gray-500">Visitantes</div>
                  </div>
                </div>
                
                {/* Mock Chart */}
                <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg mb-4 flex items-end justify-center space-x-1 p-4">
                  {[40, 70, 45, 80, 60, 95, 75].map((height, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-t from-blue-600 to-indigo-600 rounded-sm w-6"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                
                {/* Mock Product List */}
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-200 to-indigo-200 rounded" />
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded w-24 mb-1" />
                        <div className="h-2 bg-gray-100 rounded w-16" />
                      </div>
                      <div className="text-green-600 font-semibold text-sm">+{i * 15}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold shadow-lg animate-bounce">
              +40%
            </div>
            <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
              <Star className="w-6 h-6 fill-current" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}