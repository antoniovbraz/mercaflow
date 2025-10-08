import PublicLayout from '@/components/layout/PublicLayout'
import { 
  Search,
  HelpCircle,
  Book,
  MessageCircle,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Settings,
  Zap,
  Shield,
  CreditCard,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

export default function AjudaPage() {
  const quickHelp = [
    {
      icon: Zap,
      title: 'Começando',
      description: 'Como configurar sua conta em 15 minutos',
      articles: [
        'Criando sua conta no MercaFlow',
        'Conectando com Mercado Livre',
        'Configuração inicial da vitrine',
        'Primeiro produto sincronizado'
      ]
    },
    {
      icon: Settings,
      title: 'Configuração',
      description: 'Configure sua loja para máximo desempenho',
      articles: [
        'Configurações de sincronização',
        'Personalização da vitrine',
        'Configuração de templates',
        'Webhooks e notificações'
      ]
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Entenda seus dados e otimize vendas',
      articles: [
        'Interpretando o dashboard',
        'Relatórios de performance',
        'Métricas de conversão',
        'Análise de competidores'
      ]
    },
    {
      icon: CreditCard,
      title: 'Pagamentos',
      description: 'Gerenciamento de planos e faturas',
      articles: [
        'Alterando plano de assinatura',
        'Métodos de pagamento',
        'Histórico de faturas',
        'Cancelamento de conta'
      ]
    }
  ]

  const faqs = [
    {
      category: 'Geral',
      questions: [
        {
          question: 'Como funciona o período de teste gratuito?',
          answer: 'Você tem 14 dias para explorar todos os recursos do MercaFlow, sem necessidade de cartão de crédito. Durante o teste, você pode sincronizar até 50 produtos e usar todas as funcionalidades.'
        },
        {
          question: 'Posso cancelar minha assinatura a qualquer momento?',
          answer: 'Sim! Você pode cancelar a qualquer momento pela área do cliente. Seu acesso continua até o final do período pago e você pode exportar todos os seus dados.'
        },
        {
          question: 'Como funciona a sincronização com Mercado Livre?',
          answer: 'A sincronização é automática e em tempo real. Conectamos via API oficial do Mercado Livre e sincronizamos produtos, estoque, preços e pedidos automaticamente.'
        }
      ]
    },
    {
      category: 'Técnico',
      questions: [
        {
          question: 'Quais integrações estão disponíveis?',
          answer: 'Suportamos Mercado Livre (oficial), Shopee, Amazon, Magazine Luiza, e mais de 20 plataformas. Também integramos com ERPs como TOTVS, SAP e Bling.'
        },
        {
          question: 'Como funciona a IA de otimização?',
          answer: 'Nossa IA analisa seus produtos, concorrência e histórico de vendas para otimizar títulos, descrições, preços e posicionamento automaticamente.'
        },
        {
          question: 'Posso usar API própria para integração?',
          answer: 'Sim! Oferecemos API REST completa nos planos Business e Enterprise. Documentação completa disponível em /docs.'
        }
      ]
    },
    {
      category: 'Vendas',
      questions: [
        {
          question: 'Como aumentar minhas vendas com MercaFlow?',
          answer: 'Use nossa IA para otimizar produtos, configure alertas de preços, utilize templates de alta conversão e acompanhe analytics para identificar oportunidades.'
        },
        {
          question: 'Posso gerenciar múltiplas lojas?',
          answer: 'Sim! No plano Business você pode gerenciar até 3 lojas, e no Enterprise lojas ilimitadas, tudo em uma única dashboard.'
        },
        {
          question: 'Como funciona o controle de estoque?',
          answer: 'Sincronização automática entre todas as plataformas. Quando vende em uma, o estoque é atualizado em todas as outras instantaneamente.'
        }
      ]
    }
  ]

  const supportChannels = [
    {
      icon: MessageCircle,
      title: 'Chat ao Vivo',
      description: 'Resposta em menos de 2 minutos',
      availability: 'Segunda a Sexta, 8h às 20h',
      action: 'Iniciar Chat',
      primary: true
    },
    {
      icon: Mail,
      title: 'Email Suporte',
      description: 'suporte@mercaflow.com.br',
      availability: 'Resposta em até 4 horas',
      action: 'Enviar Email',
      primary: false
    },
    {
      icon: Phone,
      title: 'WhatsApp',
      description: '+55 (11) 99999-9999',
      availability: 'Segunda a Sexta, 9h às 18h',
      action: 'Chamar no WhatsApp',
      primary: false
    }
  ]

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Central de{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Ajuda
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Encontre respostas rápidas, tutoriais completos e suporte especializado 
              para maximizar seus resultados com o MercaFlow.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Pesquisar artigos, tutoriais, FAQs..."
                  className="w-full pl-12 pr-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span>🔥 Mais procurado:</span>
              <button className="text-blue-600 hover:text-blue-800">Como conectar ML</button>
              <button className="text-blue-600 hover:text-blue-800">Sincronização</button>
              <button className="text-blue-600 hover:text-blue-800">Preços</button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Guias Rápidos
            </h2>
            <p className="text-xl text-gray-600">
              Tutoriais passo-a-passo para você dominar o MercaFlow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickHelp.map((category, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                
                <div className="space-y-2">
                  {category.articles.map((article, i) => (
                    <Link
                      key={i}
                      href="#"
                      className="block text-blue-600 hover:text-blue-800 text-sm hover:underline"
                    >
                      {article}
                    </Link>
                  ))}
                </div>
                
                <Link
                  href="#"
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium text-sm mt-4"
                >
                  <span>Ver todos os artigos</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Respostas para as dúvidas mais comuns
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {faqs.map((category, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-4">
                  {category.category}
                </h3>
                
                <div className="space-y-6">
                  {category.questions.map((faq, i) => (
                    <div key={i}>
                      <div className="flex items-start space-x-3 mb-3">
                        <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <h4 className="font-medium text-gray-900 text-sm">{faq.question}</h4>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed ml-8">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Precisa de Mais Ajuda?
            </h2>
            <p className="text-xl text-gray-600">
              Nossa equipe está pronta para resolver qualquer dúvida
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportChannels.map((channel, index) => (
              <div 
                key={index} 
                className={`rounded-xl p-6 text-center transition-all hover:shadow-lg ${
                  channel.primary 
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200' 
                    : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                  channel.primary 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                    : 'bg-gray-600'
                }`}>
                  <channel.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{channel.title}</h3>
                <p className="text-gray-600 mb-2">{channel.description}</p>
                <p className="text-sm text-gray-500 mb-6">{channel.availability}</p>
                
                <button className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                  channel.primary
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}>
                  {channel.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status and Resources */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* System Status */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-gray-900">Status do Sistema</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">API MercaFlow</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 text-sm">Operacional</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Sincronização ML</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 text-sm">Operacional</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Dashboard</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 text-sm">Operacional</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">IA de Otimização</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 text-sm">Operacional</span>
                  </div>
                </div>
              </div>
              
              <Link
                href="/status"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium mt-4"
              >
                <span>Ver página de status completa</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Additional Resources */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Recursos Adicionais</h3>
              
              <div className="space-y-4">
                <Link href="/docs" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Book className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Documentação Técnica</div>
                    <div className="text-gray-600 text-sm">APIs, webhooks e integrações</div>
                  </div>
                </Link>
                
                <Link href="/blog" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Blog MercaFlow</div>
                    <div className="text-gray-600 text-sm">Dicas de e-commerce e novidades</div>
                  </div>
                </Link>
                
                <Link href="/cases" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Cases de Sucesso</div>
                    <div className="text-gray-600 text-sm">Histórias reais de crescimento</div>
                  </div>
                </Link>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Horário de Suporte</div>
                    <div className="text-gray-600 text-sm">Segunda a Sexta, 8h às 20h (Brasília)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ainda Com Dúvidas?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Nossa equipe de especialistas está pronta para ajudar você 
            a resolver qualquer problema e otimizar seus resultados.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Falar com Suporte</span>
            </button>
            
            <Link
              href="/contato"
              className="border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Agendar Demonstração</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="mt-8 text-blue-200 text-sm">
            ✓ Suporte em português ✓ Resposta em 2 horas ✓ Especialistas em e-commerce
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}