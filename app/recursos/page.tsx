import PublicLayout from '@/components/layout/PublicLayout'
import { 
  Brain,
  DollarSign,
  TrendingUp,
  Target,
  Eye,
  Sparkles,
  Zap, 
  Shield, 
  Globe,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react'
import Link from 'next/link'

export default function RecursosPage() {
  const mainFeatures = [
    {
      icon: DollarSign,
      title: 'Precificação Científica com Elasticidade-Preço',
      description: 'Não é "feeling" ou copiar concorrente. Usamos economia aplicada para calcular seu preço ótimo baseado em elasticidade da demanda, ponto de equilíbrio e curva de oferta/demanda.',
      features: [
        'Cálculo de elasticidade-preço em tempo real',
        'Simulador de impacto: "Reduzir 5% = +18% vendas"',
        'Ponto de equilíbrio otimizado por produto',
        'Curva de demanda personalizada com histórico',
        'Sugestões concretas: "Seu preço ótimo é R$ 147"'
      ],
      image: '/features/elasticidade.jpg',
      gradient: 'from-green-500 to-emerald-500',
      example: 'Exemplo: "Reduzir preço 5% = +18% vendas (+R$ 1.2k/mês)"'
    },
    {
      icon: TrendingUp,
      title: 'Análise Preditiva com 87% de Precisão',
      description: 'IA prevê suas vendas nos próximos 30/60/90 dias usando modelos de séries temporais, sazonalidade e tendências. Recomendações automáticas de estoque baseadas em previsões.',
      features: [
        'Previsão de vendas 30/60/90 dias (87% precisão)',
        'Detecção automática de sazonalidade',
        'Identificação de tendências de alta/baixa',
        'Alertas de anomalias: "Conversão caiu 40%"',
        'Recomendação de estoque: "Mínimo 189 unidades"'
      ],
      image: '/features/previsao.jpg',
      gradient: 'from-blue-500 to-cyan-500',
      example: 'Exemplo: "Próximos 30 dias: 234 vendas (±15%) | Confiança: 87%"'
    },
    {
      icon: Brain,
      title: 'Insights Acionáveis - Dashboard Ativo',
      description: 'Não mostramos só gráficos. Dizemos EXATAMENTE o que fazer, quando fazer e qual o impacto esperado. Dashboard ativo com cards de oportunidades priorizados por ROI.',
      features: [
        'Cards de ação: "🔥 Aumente preço 8% AGORA"',
        'Priorização automática por ROI esperado',
        'Confiança estatística de cada insight (0-100%)',
        'Impacto quantificado: "+R$ 1.2k/mês"',
        'Histórico de insights aplicados e resultados'
      ],
      image: '/features/insights.jpg',
      gradient: 'from-purple-500 to-violet-500',
      example: 'Exemplo: "💡 Otimize título → +23% conversão (92% confiança)"'
    },
    {
      icon: Eye,
      title: 'Análise Competitiva 24/7',
      description: 'Monitore concorrentes automaticamente. Alertas em tempo real de mudanças de preço, benchmarking por categoria e estratégias sugeridas para se destacar.',
      features: [
        'Monitor de preços concorrentes 24/7',
        'Alertas instantâneos: "Concorrente baixou 18%"',
        'Benchmarking: "Você está 12% acima da média"',
        'Posicionamento relativo no mercado',
        'Estratégias: "Igualar ou destacar diferencial"'
      ],
      image: '/features/competitivo.jpg',
      gradient: 'from-orange-500 to-red-500',
      example: 'Exemplo: "⚠️ Concorrente: R$ 129 | Você: R$ 159 | Ação sugerida"'
    },
    {
      icon: Sparkles,
      title: 'Site Automático Sincronizado',
      description: 'Crie site profissional em < 15 minutos. Zero código necessário. Sincronização automática com Mercado Livre via webhooks. SEO otimizado e domínio personalizado.',
      features: [
        'Setup completo em < 15 minutos',
        'Sincronização bidirecional automática com ML',
        '5 templates otimizados para conversão',
        'SEO: URLs amigáveis, meta tags, schema.org',
        'Domínio personalizado: sualoja.com.br'
      ],
      image: '/features/site.jpg',
      gradient: 'from-pink-500 to-rose-500',
      example: 'Exemplo: OAuth → Selecionar template → Site no ar em 15min'
    },
    {
      icon: Target,
      title: 'Otimização por IA e NLP',
      description: 'Processamento de linguagem natural (NLP) para otimizar títulos, descrições e categorias. Análise de sentiment de reviews para identificar pontos fortes/fracos.',
      features: [
        'Títulos otimizados por NLP: +23% cliques',
        'Análise de sentiment de reviews',
        'Sugestões de categorias mais assertivas',
        'Detecção de palavras-chave populares',
        'A/B testing automático de descrições'
      ],
      image: '/features/nlp.jpg',
      gradient: 'from-indigo-500 to-blue-500',
      example: 'Exemplo: "Título fraco detectado → IA sugere: \'Tênis Nike...\'"'
    }
  ]

  const additionalFeatures = [
    {
      icon: Globe,
      title: 'Multi-marketplace Inteligente',
      description: 'Hoje Mercado Livre. Em breve: Shopee, Amazon BR, Magazine Luiza. Catálogo unificado com análise cross-platform.',
      gradient: 'from-teal-500 to-green-500'
    },
    {
      icon: Shield,
      title: 'Segurança Enterprise',
      description: 'Criptografia AES-256-GCM, multi-tenancy com RLS, LGPD compliant e auditoria completa de ações.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Zap,
      title: 'Webhooks & API Priority',
      description: 'Atualizações em tempo real via webhooks. API RESTful completa para integrações customizadas.',
      gradient: 'from-purple-500 to-violet-500'
    }
  ]

  const integrations = [
    { name: 'Mercado Livre', status: 'Nativa', color: 'text-yellow-600' },
    { name: 'Shopee', status: 'Beta', color: 'text-orange-600' },
    { name: 'Magazine Luiza', status: 'Em breve', color: 'text-blue-600' },
    { name: 'Amazon', status: 'Roadmap', color: 'text-gray-600' },
    { name: 'B2W/Americanas', status: 'Roadmap', color: 'text-gray-600' },
    { name: 'Casas Bahia', status: 'Roadmap', color: 'text-gray-600' }
  ]

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Inteligência Analítica + Automação</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              De dados passivos para{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                insights acionáveis
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Economia aplicada + IA + análise preditiva. Não mostramos apenas gráficos - 
              dizemos exatamente <strong>o que fazer, quando fazer e qual o impacto esperado</strong>.
              Dashboard ativo que sugere ações concretas, priorizadas por ROI.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-3xl font-bold text-green-600 mb-1">87%</div>
                <div className="text-sm text-gray-600">Precisão Preditiva</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-3xl font-bold text-blue-600 mb-1">+R$ 15k</div>
                <div className="text-sm text-gray-600">ROI Médio/Mês</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-3xl font-bold text-purple-600 mb-1">40%</div>
                <div className="text-sm text-gray-600">Aumento Vendas</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all inline-flex items-center justify-center space-x-2"
              >
                <span>Testar Grátis por 14 Dias</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                href="/precos"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                Ver Preços
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              6 Pilares de Inteligência Analítica
            </h2>
            <p className="text-xl text-gray-600">
              Decisões baseadas em economia, ciência de dados e IA - não em achismo
            </p>
          </div>

          <div className="space-y-20">
            {mainFeatures.map((feature, index) => (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-lg text-gray-600 mb-6">
                    {feature.description}
                  </p>

                  <ul className="space-y-3 mb-6">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Example Badge */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-600 font-semibold text-sm">💡 Exemplo Real:</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{feature.example}</p>
                  </div>
                </div>

                {/* Mock Visual */}
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <div className={`bg-gradient-to-br ${feature.gradient} rounded-2xl p-8 h-80 flex items-center justify-center`}>
                    <div className="text-center text-white">
                      <feature.icon className="w-20 h-20 mx-auto mb-4 opacity-80" />
                      <div className="text-lg font-semibold">
                        {feature.title}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Infraestrutura Enterprise
            </h2>
            <p className="text-xl text-gray-600">
              Segurança, performance e integrações para escalar seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl mb-6`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Integrações Disponíveis
            </h2>
            <p className="text-xl text-gray-600">
              Conecte com os principais marketplaces do Brasil
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {integration.name}
                    </h3>
                    <span className={`text-sm font-medium ${integration.color}`}>
                      {integration.status}
                    </span>
                  </div>
                  
                  {integration.status === 'Nativa' && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-500">Premium</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pare de adivinhar. Comece a decidir com ciência.
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Mais de 2.500 vendedores transformaram dashboards passivos em insights acionáveis.
            87% de precisão preditiva. ROI médio de <strong>+R$ 15k/mês</strong>.
            Teste grátis por 14 dias - sem cartão, sem compromisso.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Começar Teste Grátis</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link
              href="/contato"
              className="border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Falar com Especialista
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}