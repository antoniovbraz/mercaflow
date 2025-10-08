import PublicLayout from '@/components/layout/PublicLayout'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageCircle,
  Headphones,
  Zap,
  Calendar,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function ContatoPage() {
  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Chat ao Vivo',
      description: 'Resposta em menos de 2 minutos',
      detail: 'Segunda a Sexta, 8h às 20h',
      action: 'Iniciar Chat',
      primary: true
    },
    {
      icon: Mail,
      title: 'Email Suporte',
      description: 'Para dúvidas técnicas e suporte',
      detail: 'suporte@mercaflow.com.br',
      action: 'Enviar Email',
      primary: false
    },
    {
      icon: Phone,
      title: 'WhatsApp Business',
      description: 'Atendimento personalizado',
      detail: '+55 (11) 99999-9999',
      action: 'Chamar no WhatsApp',
      primary: false
    },
    {
      icon: Calendar,
      title: 'Agendar Demo',
      description: 'Demonstração personalizada (30min)',
      detail: 'Com nosso especialista',
      action: 'Agendar Agora',
      primary: true
    }
  ]

  const offices = [
    {
      city: 'São Paulo - HQ',
      address: 'Av. Paulista, 1374 - 8º andar',
      district: 'Bela Vista, São Paulo - SP',
      zipcode: 'CEP: 01310-100',
      phone: '+55 (11) 3000-0000',
      hours: 'Segunda a Sexta: 9h às 18h'
    },
    {
      city: 'Rio de Janeiro',
      address: 'Rua do Ouvidor, 98 - 12º andar',
      district: 'Centro, Rio de Janeiro - RJ',
      zipcode: 'CEP: 20040-030',
      phone: '+55 (21) 3000-0000',
      hours: 'Segunda a Sexta: 9h às 18h'
    },
    {
      city: 'Belo Horizonte',
      address: 'Av. Afonso Pena, 867 - 5º andar',
      district: 'Centro, Belo Horizonte - MG',
      zipcode: 'CEP: 30130-002',
      phone: '+55 (31) 3000-0000',
      hours: 'Segunda a Sexta: 9h às 18h'
    }
  ]

  const faqs = [
    {
      question: 'Quanto tempo leva para implementar?',
      answer: 'A implementação básica leva apenas 15 minutos. Nossa equipe oferece setup assistido gratuito para todos os planos.'
    },
    {
      question: 'Vocês oferecem treinamento?',
      answer: 'Sim! Oferecemos onboarding completo, documentação detalhada, vídeo-aulas e suporte contínuo da nossa equipe.'
    },
    {
      question: 'Como funciona a integração com Mercado Livre?',
      answer: 'Integração oficial e segura via OAuth. Conectamos automaticamente produtos, pedidos e estoque em tempo real.'
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim, sem taxas ou penalidades. Você mantém acesso até o final do período pago e pode exportar todos os seus dados.'
    }
  ]

  const supportLevels = [
    {
      plan: 'Starter',
      response: '< 24h',
      channels: ['Email', 'Central de Ajuda'],
      features: ['Documentação completa', 'Vídeo tutoriais', 'FAQ interativo']
    },
    {
      plan: 'Business',
      response: '< 4h',
      channels: ['Email', 'Chat', 'WhatsApp'],
      features: ['Suporte prioritário', 'Onboarding assistido', 'Treinamento 1:1']
    },
    {
      plan: 'Enterprise',
      response: '< 2h',
      channels: ['Todos + Telefone', 'Account Manager'],
      features: ['Suporte premium 24/7', 'Setup completo', 'Treinamento da equipe', 'SLA garantido']
    }
  ]

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Fale com{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Nossos Especialistas
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Estamos aqui para ajudar você a revolucionar suas vendas. 
              Escolha a forma de contato que preferir - todos levam ao sucesso.
            </p>

            <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-6 py-3">
              <Headphones className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Suporte em português • Resposta rápida garantida</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <div 
                key={index} 
                className={`rounded-2xl p-6 text-center transition-all hover:shadow-lg ${
                  method.primary 
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200' 
                    : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                  method.primary 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                    : 'bg-gray-600'
                }`}>
                  <method.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-3">{method.description}</p>
                <p className="text-sm text-gray-500 mb-4">{method.detail}</p>
                
                <button className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                  method.primary
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}>
                  {method.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Envie uma Mensagem
              </h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp
                    </label>
                    <input 
                      type="tel" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome da sua empresa"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto *
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Dúvidas sobre planos</option>
                    <option>Solicitar demonstração</option>
                    <option>Suporte técnico</option>
                    <option>Parceria comercial</option>
                    <option>Imprensa/mídia</option>
                    <option>Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem *
                  </label>
                  <textarea 
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Conte-nos como podemos ajudar você..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all inline-flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Enviar Mensagem</span>
                </button>
              </form>
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Por que Escolher o MercaFlow?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Implementação em 15min</div>
                      <div className="text-gray-600 text-sm">Setup automático e assistido</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Headphones className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Suporte em português</div>
                      <div className="text-gray-600 text-sm">Equipe especializada no Brasil</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Resposta em 2h</div>
                      <div className="text-gray-600 text-sm">SLA garantido em contrato</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3">Precisa de Ajuda Imediata?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Nossa central de ajuda tem centenas de artigos e tutoriais para resolver 
                  suas dúvidas na hora.
                </p>
                <Link 
                  href="/ajuda" 
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center space-x-1"
                >
                  <span>Acessar Central de Ajuda</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Levels */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Níveis de Suporte
            </h2>
            <p className="text-xl text-gray-600">
              Suporte especializado para cada tipo de cliente
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {supportLevels.map((level, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{level.plan}</h3>
                
                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-1">Tempo de Resposta:</div>
                  <div className="text-2xl font-bold text-blue-600">{level.response}</div>
                </div>

                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-2">Canais Disponíveis:</div>
                  <div className="space-y-1">
                    {level.channels.map((channel, i) => (
                      <div key={i} className="text-gray-700 text-sm">• {channel}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Recursos Incluídos:</div>
                  <div className="space-y-1">
                    {level.features.map((feature, i) => (
                      <div key={i} className="text-gray-700 text-sm">• {feature}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nossos Escritórios
            </h2>
            <p className="text-xl text-gray-600">
              Presença nacional para estar sempre perto de você
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offices.map((office, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start space-x-3 mb-4">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{office.city}</h3>
                    <div className="text-gray-600 text-sm space-y-1">
                      <div>{office.address}</div>
                      <div>{office.district}</div>
                      <div>{office.zipcode}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{office.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{office.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Quick */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Respostas rápidas para as dúvidas mais comuns
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para Revolucionar Suas Vendas?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Não perca mais tempo com ferramentas limitadas. 
            Comece seu teste gratuito agora mesmo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center space-x-2">
              <span>Começar Teste Grátis</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              Agendar Demonstração
            </button>
          </div>

          <div className="mt-8 text-blue-200 text-sm">
            ✓ Sem cartão de crédito ✓ Setup em 15 min ✓ Suporte premium incluído
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}