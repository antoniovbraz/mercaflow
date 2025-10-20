import { 
  Brain,
  DollarSign,
  TrendingUp,
  Target,
  Sparkles,
  Eye,
  Shield, 
  Globe,
  ArrowRight
} from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: DollarSign,
      title: 'Precificação Científica',
      description: 'Elasticidade-preço da demanda, ponto de equilíbrio otimizado e curva de demanda. Não é "feeling" - é economia aplicada dizendo seu preço ótimo.',
      benefits: ['Elasticidade-preço calculada', 'Simulador de impacto', 'Preço ótimo sugerido'],
      gradient: 'from-green-500 to-emerald-500',
      category: 'intelligence'
    },
    {
      icon: TrendingUp,
      title: 'Análise Preditiva',
      description: 'IA prevê suas vendas nos próximos 30/60/90 dias com 87% de precisão. Sazonalidade, tendências e recomendações de estoque baseadas em dados reais.',
      benefits: ['Previsão 30/60/90 dias', 'Detecção de tendências', 'Recomendação de estoque'],
      gradient: 'from-blue-500 to-cyan-500',
      category: 'intelligence'
    },
    {
      icon: Brain,
      title: 'Insights Acionáveis',
      description: 'Não mostramos só gráficos - dizemos EXATAMENTE o que fazer. "Aumente preço 8%" ou "Otimize este título". Dashboard ativo, não passivo.',
      benefits: ['Ações priorizadas por ROI', 'Confiança estatística', 'Cards de oportunidades'],
      gradient: 'from-purple-500 to-violet-500',
      category: 'intelligence'
    },
    {
      icon: Eye,
      title: 'Análise Competitiva',
      description: 'Monitore concorrentes 24/7. Alertas automáticos de mudanças de preço, benchmarking e estratégias sugeridas para se destacar.',
      benefits: ['Monitor de preços 24/7', 'Benchmarking automático', 'Alertas de concorrentes'],
      gradient: 'from-orange-500 to-red-500',
      category: 'intelligence'
    },
    {
      icon: Sparkles,
      title: 'Site Automático',
      description: 'Crie site profissional em < 15 minutos. Sincronização automática com marketplaces, SEO otimizado e zero código necessário.',
      benefits: ['Setup < 15 minutos', 'Sync automático ML', 'SEO otimizado'],
      gradient: 'from-pink-500 to-rose-500',
      category: 'automation'
    },
    {
      icon: Target,
      title: 'Otimização por IA',
      description: 'NLP otimiza títulos e descrições automaticamente. Análise de sentiment de reviews e sugestões de categorias mais assertivas.',
      benefits: ['Títulos otimizados por NLP', 'Análise de reviews', 'Categorias sugeridas'],
      gradient: 'from-indigo-500 to-blue-500',
      category: 'intelligence'
    }
  ]

  const highlights = [
    {
      icon: Globe,
      title: 'Multi-marketplace',
      description: 'Hoje Mercado Livre. Em breve: Shopee, Amazon BR, Magazine Luiza. Catálogo unificado inteligente.'
    },
    {
      icon: Shield,
      title: 'Segurança Enterprise',
      description: 'Criptografia AES-256-GCM, multi-tenancy com RLS, LGPD compliant e auditoria completa.'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Inteligência Analítica + Automação</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Não mostramos dados,
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {' '}dizemos o QUE fazer
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Economia aplicada + IA + análise preditiva para transformar dados em{' '}
            <strong>insights acionáveis</strong>. Dashboards ativos que sugerem ações concretas,
            não apenas mostram números.
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
              Pare de adivinhar. Comece a decidir com dados.
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Mais de 2.500 vendedores aumentaram suas vendas com insights acionáveis.
              87% de precisão preditiva. ROI médio de +R$ 15k/mês.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center space-x-2">
              <span>Começar Teste Grátis por 14 Dias</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}