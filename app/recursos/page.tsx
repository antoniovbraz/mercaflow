import PublicLayout from '@/components/layout/PublicLayout'
import { 
  Palette, 
  Bot, 
  BarChart3, 
  Zap, 
  Shield, 
  Smartphone,
  Globe,
  HeadphonesIcon,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react'
import Link from 'next/link'

export default function RecursosPage() {
  const mainFeatures = [
    {
      icon: Palette,
      title: 'Vitrine Profissional Personalizada',
      description: 'Crie sua loja virtual com identidade única usando nossos templates premium e editor visual intuitivo.',
      features: [
        'Templates premium otimizados para conversão',
        'Editor drag-and-drop sem código',
        'Domínio personalizado incluído',
        'Responsive design automático',
        'SEO otimizado para Google'
      ],
      image: '/features/vitrine.jpg',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: Bot,
      title: 'IA Avançada para Otimização',
      description: 'Inteligência artificial que analisa milhões de dados para otimizar preços, títulos e descrições automaticamente.',
      features: [
        'Otimização de preços em tempo real',
        'Geração automática de títulos atrativos',
        'Análise competitiva 24/7',
        'Sugestões de produtos populares',
        'Previsão de demanda por IA'
      ],
      image: '/features/ia.jpg',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Relatórios Premium',
      description: 'Dashboards completos com métricas avançadas e insights acionáveis para maximizar seu ROI.',
      features: [
        'Dashboard em tempo real',
        'Relatórios de ROI detalhados',
        'Análise de funil de vendas',
        'Métricas de performance por produto',
        'Exportação de dados CSV/PDF'
      ],
      image: '/features/analytics.jpg',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Integração Nativa Mercado Livre',
      description: 'Sincronização automática e bidireccional com ML. Produtos, pedidos e estoque sempre atualizados.',
      features: [
        'Sincronização automática em tempo real',
        'Gestão centralizada de produtos',
        'Controle de estoque integrado',
        'Processamento automático de pedidos',
        'Webhooks para atualizações instantâneas'
      ],
      image: '/features/integracao.jpg',
      gradient: 'from-purple-500 to-violet-500'
    }
  ]

  const additionalFeatures = [
    {
      icon: Shield,
      title: 'Segurança Enterprise',
      description: 'Proteção nivel bancário com criptografia end-to-end e compliance LGPD.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'App nativo iOS/Android + PWA para gestão completa no celular.',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Globe,
      title: 'Multi-marketplace',
      description: 'Conecte com Shopee, Magazine Luiza e outros marketplaces.',
      gradient: 'from-teal-500 to-green-500'
    },
    {
      icon: HeadphonesIcon,
      title: 'Suporte Premium 24/7',
      description: 'Atendimento especializado com tempo de resposta < 2 horas.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Users,
      title: 'Gestão de Equipe',
      description: 'Controle de acesso granular e colaboração em tempo real.',
      gradient: 'from-pink-500 to-purple-500'
    },
    {
      icon: TrendingUp,
      title: 'Growth Hacking',
      description: 'Ferramentas avançadas para acelerar o crescimento das vendas.',
      gradient: 'from-emerald-500 to-teal-500'
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
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Recursos Premium</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Ferramentas{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                world-class
              </span>{' '}
              para dominar o Mercado Livre
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Descubra por que mais de 2.500 vendedores escolheram o MercaFlow. 
              Recursos profissionais, IA avançada e integrações nativas em uma plataforma única.
            </p>

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
              Recursos Principais
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa para transformar seu negócio
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

                  <ul className="space-y-3">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
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
              Recursos Adicionais
            </h2>
            <p className="text-xl text-gray-600">
              Muito mais funcionalidades para seu sucesso
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
            Pronto para experimentar todos esses recursos?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Teste grátis por 14 dias. Sem cartão de crédito, sem compromisso.
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