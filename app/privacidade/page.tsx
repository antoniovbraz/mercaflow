import PublicLayout from '@/components/layout/PublicLayout'
import { 
  Shield,
  Eye,
  Lock,
  FileText,
  Users,
  Globe,
  Clock,
  Mail
} from 'lucide-react'
import Link from 'next/link'

export default function PrivacidadePage() {
  const dataTypes = [
    {
      icon: Users,
      title: 'Dados de Identificação',
      items: [
        'Nome completo',
        'Email',
        'Telefone/WhatsApp',
        'CPF/CNPJ',
        'Endereço da empresa'
      ]
    },
    {
      icon: Globe,
      title: 'Dados de Uso',
      items: [
        'Dados de navegação',
        'Logs de acesso',
        'Preferências do usuário',
        'Histórico de atividades',
        'Estatísticas de uso'
      ]
    },
    {
      icon: FileText,
      title: 'Dados Comerciais',
      items: [
        'Informações de produtos',
        'Dados de vendas',
        'Histórico de transações',
        'Configurações da loja',
        'Integrações conectadas'
      ]
    },
    {
      icon: Lock,
      title: 'Dados Técnicos',
      items: [
        'Endereço IP',
        'Informações do dispositivo',
        'Dados de localização',
        'Cookies e tokens',
        'Logs de sistema'
      ]
    }
  ]

  const rights = [
    {
      icon: Eye,
      title: 'Acesso aos Dados',
      description: 'Solicite uma cópia de todos os dados pessoais que temos sobre você.'
    },
    {
      icon: FileText,
      title: 'Correção de Dados',
      description: 'Corrija dados pessoais incompletos, inexatos ou desatualizados.'
    },
    {
      icon: Shield,
      title: 'Exclusão de Dados',
      description: 'Solicite a exclusão de dados pessoais desnecessários ou excessivos.'
    },
    {
      icon: Lock,
      title: 'Portabilidade',
      description: 'Receba seus dados em formato estruturado e de uso comum.'
    },
    {
      icon: Users,
      title: 'Revogação de Consentimento',
      description: 'Revogue consentimentos dados anteriormente para o tratamento de dados.'
    },
    {
      icon: Globe,
      title: 'Oposição ao Tratamento',
      description: 'Oponha-se ao tratamento realizado com base no legítimo interesse.'
    }
  ]

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Conforme LGPD • Última atualização: 08/10/2025</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Política de{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Privacidade
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transparência total sobre como coletamos, usamos e protegemos seus dados pessoais. 
              Seu controle e privacidade são nossa prioridade.
            </p>

            <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-600">
              <span className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>LGPD Compliance</span>
              </span>
              <span className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-green-600" />
                <span>Criptografia de Ponta</span>
              </span>
              <span className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-green-600" />
                <span>Total Transparência</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Introdução</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <p className="text-gray-700 leading-relaxed">
                <strong>MercaFlow Tecnologia Ltda.</strong>, inscrita no CNPJ 00.000.000/0001-00, 
                com sede na Av. Paulista, 1374 - 8º andar, São Paulo - SP, CEP 01310-100, 
                está comprometida com a proteção da privacidade e dos dados pessoais de seus usuários, 
                em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos 
              as informações pessoais dos usuários da plataforma MercaFlow. Ao utilizar nossos serviços, 
              você concorda com as práticas descritas nesta política.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Recomendamos que você leia esta política periodicamente, 
                pois ela pode ser atualizada conforme mudanças em nossos serviços ou na legislação aplicável.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Collection */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              2. Dados que Coletamos
            </h2>
            <p className="text-xl text-gray-600">
              Transparência sobre as informações que processamos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {dataTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <type.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{type.title}</h3>
                
                <ul className="space-y-2">
                  {type.items.map((item, i) => (
                    <li key={i} className="text-gray-600 text-sm flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto prose prose-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Finalidades do Tratamento</h3>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Prestação de serviços:</strong> Operação da plataforma, sincronização de dados e funcionalidades do MercaFlow</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Comunicação:</strong> Envio de notificações, suporte técnico e atualizações importantes</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Melhoria dos serviços:</strong> Análise de uso, desenvolvimento de novas funcionalidades</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Compliance:</strong> Cumprimento de obrigações legais e regulamentares</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Segurança:</strong> Prevenção de fraudes, proteção da plataforma e dos usuários</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Rights Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              3. Seus Direitos (LGPD)
            </h2>
            <p className="text-xl text-gray-600">
              Você tem controle total sobre seus dados pessoais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {rights.map((right, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                  <right.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{right.title}</h3>
                <p className="text-gray-600 text-sm">{right.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Como Exercer Seus Direitos
            </h3>
            <p className="text-gray-700 mb-6">
              Para exercer qualquer um dos direitos acima, entre em contato conosco através dos canais oficiais:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:privacidade@mercaflow.com.br"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>privacidade@mercaflow.com.br</span>
              </a>
              <Link
                href="/contato"
                className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Formulário de Contato
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security and Storage */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Segurança e Armazenamento</h2>
            
            <div className="bg-white rounded-lg p-8 border border-gray-200 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Medidas de Segurança</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Técnicas</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Criptografia AES-256</li>
                    <li>• SSL/TLS para transmissão</li>
                    <li>• Autenticação multifator</li>
                    <li>• Monitoramento 24/7</li>
                    <li>• Backups automáticos</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Organizacionais</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Acesso restrito por função</li>
                    <li>• Treinamento da equipe</li>
                    <li>• Auditorias regulares</li>
                    <li>• Contratos de confidencialidade</li>
                    <li>• Políticas internas rígidas</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Retenção de Dados</h3>
            <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
              <p className="text-gray-700 mb-4">
                Mantemos seus dados pessoais apenas pelo tempo necessário para as finalidades descritas, 
                respeitando os seguintes prazos:
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Dados de conta ativa</span>
                  <span className="text-blue-600 font-medium">Durante a vigência do contrato</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Dados comerciais</span>
                  <span className="text-blue-600 font-medium">5 anos (legislação fiscal)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Logs de acesso</span>
                  <span className="text-blue-600 font-medium">6 meses</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Dados de marketing</span>
                  <span className="text-blue-600 font-medium">Até revogação do consentimento</span>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Compartilhamento de Dados</h3>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-gray-700 mb-4">
                Seus dados podem ser compartilhados apenas nas seguintes situações:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Parceiros técnicos:</strong> Provedores de infraestrutura (AWS, Vercel) com contratos de confidencialidade</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Integrações:</strong> Marketplaces conectados (Mercado Livre, etc.) conforme necessário para o serviço</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Obrigações legais:</strong> Autoridades competentes quando exigido por lei</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact and Updates */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Contato e Atualizações</h2>
            
            <div className="bg-gray-50 rounded-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Encarregado de Dados (DPO)</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>Nome:</strong> Maria Silva Santos</p>
                <p><strong>Email:</strong> dpo@mercaflow.com.br</p>
                <p><strong>Telefone:</strong> +55 (11) 3000-0000</p>
                <p><strong>Endereço:</strong> Av. Paulista, 1374 - 8º andar, São Paulo - SP, CEP 01310-100</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Alterações desta Política</h3>
            <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
              <p className="text-gray-700 mb-4">
                Esta Política de Privacidade pode ser atualizada periodicamente. Quando isso ocorrer:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Notificaremos por email sobre mudanças significativas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>A data de &ldquo;última atualização&rdquo; será modificada</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Mudanças entram em vigor 30 dias após a notificação</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
              <h4 className="font-semibold text-blue-900 mb-2">Fale Conosco</h4>
              <p className="text-blue-800 text-sm">
                Dúvidas sobre esta política ou sobre o tratamento de seus dados? 
                Entre em contato através do email <strong>privacidade@mercaflow.com.br</strong> 
                ou pelo nosso <Link href="/contato" className="underline">formulário de contato</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}