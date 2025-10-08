import PublicLayout from '@/components/layout/PublicLayout'
import { 
  CheckCircle, 
  X, 
  Star,
  Zap,
  Crown,
  ArrowRight,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'

export default function PrecosPage() {
  const plans = [
    {
      name: 'Starter',
      description: 'Perfeito para começar no Mercado Livre',
      price: 67,
      originalPrice: 97,
      billing: 'mensal',
      popular: false,
      icon: Zap,
      gradient: 'from-blue-500 to-blue-600',
      features: [
        'Até 100 produtos sincronizados',
        'Vitrine profissional básica',
        '3 templates premium',
        'Analytics essenciais',
        'Suporte por email',
        'Integração Mercado Livre',
        'Mobile app incluído',
        'SSL gratuito'
      ],
      limitations: [
        'IA limitada (10 otimizações/mês)',
        'Sem multi-marketplace',
        'Relatórios básicos'
      ]
    },
    {
      name: 'Business',
      description: 'Ideal para vendedores estabelecidos',
      price: 147,
      originalPrice: 197,
      billing: 'mensal',
      popular: true,
      icon: Star,
      gradient: 'from-indigo-500 to-purple-600',
      features: [
        'Até 1.000 produtos sincronizados',
        'Vitrine profissional premium',
        'Todos os templates + customização',
        'Analytics avançados',
        'Suporte prioritário (< 4h)',
        'IA completa (ilimitada)',
        'Multi-marketplace (3 plataformas)',
        'API access',
        'Equipe até 3 usuários',
        'Relatórios personalizados',
        'Backup automático',
        'Webhooks customizados'
      ],
      limitations: [
        'Sem white-label',
        'Limitado a 3 marketplaces'
      ]
    },
    {
      name: 'Enterprise',
      description: 'Para grandes operações e agências',
      price: 297,
      originalPrice: 497,
      billing: 'mensal',
      popular: false,
      icon: Crown,
      gradient: 'from-purple-600 to-pink-600',
      features: [
        'Produtos ilimitados',
        'White-label completo',
        'Templates customizados exclusivos',
        'Analytics enterprise + BI',
        'Suporte premium 24/7 (< 2h)',
        'IA avançada + treinamento customizado',
        'Todos os marketplaces',
        'API priority access',
        'Usuários ilimitados',
        'Relatórios executivos',
        'Integração ERP/CRM',
        'Account manager dedicado',
        'Setup assistido',
        'Treinamento da equipe'
      ],
      limitations: []
    }
  ]

  const addons = [
    {
      name: 'IA Premium Training',
      description: 'Treinamento personalizado da IA para seu nicho',
      price: 197,
      billing: 'setup único'
    },
    {
      name: 'Setup Assistido',
      description: 'Nossa equipe configura tudo para você',
      price: 297,
      billing: 'setup único'
    },
    {
      name: 'Usuários Extras',
      description: 'Adicione mais membros à sua equipe',
      price: 47,
      billing: 'por usuário/mês'
    },
    {
      name: 'Marketplace Extra',
      description: 'Conecte marketplaces adicionais',
      price: 67,
      billing: 'por marketplace/mês'
    }
  ]

  const faqs = [
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim, você pode cancelar sua assinatura a qualquer momento sem penalidades ou taxas extras. Seu acesso continua até o final do período pago.'
    },
    {
      question: 'Existe período de teste gratuito?',
      answer: 'Sim! Oferecemos 14 dias de teste gratuito em todos os planos, sem necessidade de cartão de crédito. Você pode explorar todos os recursos sem compromisso.'
    },
    {
      question: 'Como funciona a integração com Mercado Livre?',
      answer: 'Nossa integração é nativa e oficial. Conectamos via OAuth seguro e sincronizamos produtos, pedidos e estoque em tempo real, sem necessidade de configurações técnicas.'
    },
    {
      question: 'Posso mudar de plano depois?',
      answer: 'Claro! Você pode fazer upgrade ou downgrade a qualquer momento. Ajustamos automaticamente a cobrança proporcional ao tempo restante.'
    },
    {
      question: 'Os dados ficam seguros?',
      answer: 'Absolutamente. Usamos criptografia de nível bancário, certificações de segurança internacionais e compliance total com a LGPD brasileira.'
    },
    {
      question: 'Há desconto para pagamento anual?',
      answer: 'Sim! Oferecemos 20% de desconto para assinaturas anuais, além de recursos extras como prioridade no suporte e early access a novos recursos.'
    }
  ]

  const testimonialPricing = {
    name: 'Roberto Silva',
    company: 'TechStore Premium',
    quote: 'O plano Business pagou sozinho em 2 meses. Minhas vendas aumentaram 180% e a IA otimizou automaticamente todos os meus produtos.',
    results: '+180% vendas, ROI 340%'
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-green-600 fill-current" />
              <span className="text-sm font-medium text-green-800">14 dias grátis • Sem cartão de crédito</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Planos que{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                se pagam sozinhos
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Escolha o plano ideal para seu negócio. Todos incluem teste gratuito, 
              suporte premium e garantia de satisfação de 30 dias.
            </p>

            {/* Toggle Annual/Monthly */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className="text-gray-600">Mensal</span>
              <div className="relative inline-flex items-center">
                <input type="checkbox" className="sr-only" />
                <div className="w-12 h-6 bg-gray-200 rounded-full cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-x-0.5 mt-0.5"></div>
                </div>
              </div>
              <span className="text-gray-600">Anual <span className="text-green-600 font-semibold">(20% off)</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl border-2 p-8 ${
                  plan.popular 
                    ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 transform scale-105' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } transition-all duration-300 hover:shadow-xl`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      🏆 Mais Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${plan.gradient} rounded-2xl mb-4`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-4xl font-bold text-gray-900">R$ {plan.price}</span>
                      <div className="text-left">
                        <div className="text-gray-500 line-through text-sm">R$ {plan.originalPrice}</div>
                        <div className="text-gray-600 text-sm">/{plan.billing}</div>
                      </div>
                    </div>
                    <div className="text-green-600 font-semibold text-sm mt-1">
                      Economia de R$ {plan.originalPrice - plan.price}/mês
                    </div>
                  </div>

                  <Link
                    href="/register"
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all inline-flex items-center justify-center space-x-2 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    <span>Começar Teste Grátis</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Incluído:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Limitações:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, i) => (
                          <li key={i} className="flex items-center space-x-3">
                            <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-500 text-sm">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Serviços Adicionais
            </h2>
            <p className="text-xl text-gray-600">
              Potencialize ainda mais seus resultados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addons.map((addon, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{addon.name}</h3>
                    <p className="text-gray-600 text-sm">{addon.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">R$ {addon.price}</div>
                    <div className="text-gray-500 text-sm">{addon.billing}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-xl mb-6">
                &ldquo;{testimonialPricing.quote}&rdquo;
              </blockquote>
              
              <div className="mb-4">
                <div className="font-semibold">{testimonialPricing.name}</div>
                <div className="text-blue-200">{testimonialPricing.company}</div>
              </div>
              
              <div className="bg-white/20 rounded-lg px-4 py-2 inline-block">
                <span className="font-semibold">{testimonialPricing.results}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Tire suas dúvidas sobre nossos planos
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Não encontrou sua resposta?
            </p>
            <Link
              href="/contato"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Fale com nosso time de vendas →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para revolucionar suas vendas?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Teste qualquer plano grátis por 14 dias. 
            Sem risco, sem compromisso, resultados garantidos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Começar Teste Grátis Agora</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link
              href="/contato"
              className="border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Falar com Especialista
            </Link>
          </div>

          <div className="mt-8 text-blue-200 text-sm">
            ✓ 14 dias grátis ✓ Sem cartão ✓ Setup em 15 minutos
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}