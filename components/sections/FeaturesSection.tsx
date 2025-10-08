import { 
  Palette, 
  Bot, 
  BarChart3, 
  Zap, 
  Shield, 
  Smartphone,
  Globe,
  HeadphonesIcon,
  ArrowRight
} from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: Palette,
      title: 'Vitrine Profissional',
      description: 'Crie sua loja virtual personalizada com templates premium e editor drag-and-drop. Sua marca, sua identidade.',
      benefits: ['Templates premium', 'Editor visual', 'Domínio personalizado'],
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: Bot,
      title: 'IA Avançada',
      description: 'Nossa IA otimiza preços, títulos e descrições automaticamente, analisando milhões de dados do mercado em tempo real.',
      benefits: ['Otimização de preços', 'Títulos inteligentes', 'Análise competitiva'],
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics Profissional',
      description: 'Dashboards completos com métricas avançadas, ROI detalhado e insights acionáveis para maximizar suas vendas.',
      benefits: ['Dashboard completo', 'ROI em tempo real', 'Relatórios premium'],
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Integração Nativa ML',
      description: 'Sincronização automática e em tempo real com Mercado Livre. Produtos, pedidos, estoque - tudo conectado.',
      benefits: ['Sync automático', 'Tempo real', 'Zero configuração'],
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Segurança nivel bancário com criptografia end-to-end, backups automáticos e compliance total com LGPD.',
      benefits: ['Criptografia E2E', 'Backup automático', 'LGPD compliant'],
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Experiência perfeita em qualquer dispositivo. App nativo iOS/Android + PWA para máxima performance.',
      benefits: ['App nativo', 'PWA included', 'Offline ready'],
      gradient: 'from-indigo-500 to-blue-500'
    }
  ]

  const highlights = [
    {
      icon: Globe,
      title: 'Multi-marketplace',
      description: 'Integre com Mercado Livre, Shopee, Magazine Luiza e mais'
    },
    {
      icon: HeadphonesIcon,
      title: 'Suporte Premium',
      description: 'Atendimento especializado 24/7 com tempo de resposta < 2h'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Recursos Premium</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tudo que você precisa para
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {' '}dominar o Mercado Livre
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ferramentas profissionais, IA avançada e integrações nativas. 
            Tudo em uma plataforma world-class construída especificamente para o mercado brasileiro.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className={`relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Benefits */}
                <ul className="space-y-2 mb-6">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className={`w-1.5 h-1.5 bg-gradient-to-r ${feature.gradient} rounded-full`} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Learn More Link */}
                <button className="group/link flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
                  <span>Saiba mais</span>
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="flex items-center space-x-6 bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <highlight.icon className="w-8 h-8 text-gray-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {highlight.title}
                </h3>
                <p className="text-gray-600">
                  {highlight.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Pronto para revolucionar suas vendas?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Junte-se a mais de 2.500 vendedores que já escolheram o MercaFlow. 
              Setup gratuito e suporte premium incluído.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center space-x-2">
              <span>Começar Teste Grátis</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}