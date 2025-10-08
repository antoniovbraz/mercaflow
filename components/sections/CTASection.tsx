import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Shield, Award } from 'lucide-react'

export default function CTASection() {
  const benefits = [
    'Setup completo em 15 minutos',
    'Suporte premium 24/7 incluído', 
    'Integração nativa com Mercado Livre',
    'IA para otimização automática',
    'Vitrine profissional personalizada',
    'Analytics avançados em tempo real'
  ]

  const guarantees = [
    {
      icon: Shield,
      text: '14 dias grátis, sem compromisso'
    },
    {
      icon: Award,
      text: 'Garantia de satisfação 100%'
    },
    {
      icon: Zap,
      text: 'Resultados em até 30 dias'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Oferta Limitada - Primeiros 100 Clientes</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Pronto para{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              revolucionar
            </span>{' '}
            suas vendas no Mercado Livre?
          </h2>

          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Junte-se a mais de <strong>2.500 vendedores</strong> que já escolheram o MercaFlow. 
            Teste grátis por 14 dias e veja seus resultados dispararem.
          </p>

          {/* Key Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">+127%</div>
              <div className="text-blue-200 text-sm">Aumento médio de vendas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">15 min</div>
              <div className="text-blue-200 text-sm">Para estar no ar</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">4.9/5</div>
              <div className="text-blue-200 text-sm">Satisfação dos clientes</div>
            </div>
          </div>
        </div>

        {/* Main CTA Card */}
        <div className="bg-white/10 backdrop-blur rounded-3xl p-8 lg:p-12 border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Benefits */}
            <div>
              <h3 className="text-2xl font-bold mb-6">
                O que você recebe <span className="text-yellow-400">gratuitamente</span>:
              </h3>
              
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-blue-100">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Guarantees */}
              <div className="space-y-3">
                {guarantees.map((guarantee, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <guarantee.icon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-sm text-blue-200">{guarantee.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - CTA */}
            <div className="text-center lg:text-left">
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 text-gray-900">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">R$ 0</div>
                  <div className="text-lg text-gray-600 mb-1">nos primeiros 14 dias</div>
                  <div className="text-sm text-gray-500">Depois apenas R$ 67/mês</div>
                </div>

                <div className="space-y-4">
                  <Link
                    href="/register"
                    className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center group"
                  >
                    Começar Teste Grátis Agora
                    <ArrowRight className="inline-block w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      ✓ Sem cartão de crédito ✓ Sem compromisso ✓ Cancelamento livre
                    </div>
                    
                    <Link
                      href="/demo"
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm underline"
                    >
                      Ou veja uma demo rápida (2 min)
                    </Link>
                  </div>
                </div>
              </div>

              {/* Urgency */}
              <div className="mt-6 text-center">
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                  <div className="text-red-300 font-semibold text-sm">
                    ⏰ Oferta por tempo limitado!
                  </div>
                  <div className="text-red-200 text-xs mt-1">
                    Apenas para os primeiros 100 novos clientes este mês
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Signals */}
        <div className="text-center mt-12">
          <p className="text-blue-200 text-sm mb-4">
            Mais de 2.500 vendedores já confiam no MercaFlow
          </p>
          
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-white/40 font-bold">Mercado Livre</div>
            <div className="text-white/40">•</div>
            <div className="text-white/40 font-bold">Shopee</div>
            <div className="text-white/40">•</div>
            <div className="text-white/40 font-bold">Magazine Luiza</div>
          </div>

          <div className="mt-6 flex justify-center items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-blue-200 text-sm">4.9/5 baseado em 1.247 avaliações</span>
          </div>
        </div>
      </div>
    </section>
  )
}