import PublicLayout from '@/components/layout/PublicLayout'
import { 
  FileText,
  Scale,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Globe
} from 'lucide-react'
import Link from 'next/link'

export default function TermosPage() {
  const planLimits = [
    {
      plan: 'Starter',
      price: 'R$ 67/mês',
      products: '100 produtos',
      users: '1 usuário',
      support: 'Email'
    },
    {
      plan: 'Business',
      price: 'R$ 147/mês', 
      products: '1.000 produtos',
      users: '3 usuários',
      support: 'Chat + Email'
    },
    {
      plan: 'Enterprise',
      price: 'R$ 297/mês',
      products: 'Ilimitado',
      users: 'Ilimitado',
      support: '24/7 Premium'
    }
  ]

  const prohibitedUses = [
    'Uso para atividades ilegais ou fraudulentas',
    'Violação de direitos de propriedade intelectual',
    'Spam ou comunicações não solicitadas',
    'Tentativas de hacking ou acesso não autorizado',
    'Uso comercial não autorizado da plataforma',
    'Criação de contas falsas ou múltiplas',
    'Interferência na operação dos serviços',
    'Violação de políticas dos marketplaces integrados'
  ]

  const userObligations = [
    {
      icon: Shield,
      title: 'Segurança da Conta',
      description: 'Manter credenciais seguras e não compartilhar acesso'
    },
    {
      icon: FileText,
      title: 'Informações Precisas',
      description: 'Fornecer dados verdadeiros e atualizados'
    },
    {
      icon: CheckCircle,
      title: 'Uso Adequado',
      description: 'Utilizar os serviços conforme os termos estabelecidos'
    },
    {
      icon: CreditCard,
      title: 'Pagamentos em Dia',
      description: 'Manter assinatura atualizada e pagamentos regulares'
    }
  ]

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
              <Scale className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Vigência: 08/10/2025 • Versão 2.1</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Termos de{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Serviço
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Condições claras e justas para o uso da plataforma MercaFlow. 
              Leia atentamente para entender seus direitos e responsabilidades.
            </p>

            <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-600">
              <span className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Contrato de Adesão</span>
              </span>
              <span className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Lei Brasileira</span>
              </span>
              <span className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Vigência Indefinida</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Aceitação dos Termos</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <p className="text-gray-700 leading-relaxed">
                Estes Termos de Serviço (&ldquo;Termos&rdquo;) constituem um acordo legal entre você (&ldquo;Usuário&rdquo; ou &ldquo;Cliente&rdquo;) 
                e a <strong>MercaFlow Tecnologia Ltda.</strong>, CNPJ 00.000.000/0001-00, com sede na 
                Av. Paulista, 1374 - 8º andar, São Paulo - SP, CEP 01310-100 (&ldquo;MercaFlow&rdquo;, &ldquo;nós&rdquo; ou &ldquo;nossa empresa&rdquo;).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Ao se cadastrar, você:</h3>
                </div>
                <ul className="space-y-1 text-green-800 text-sm">
                  <li>• Aceita integralmente estes termos</li>
                  <li>• Confirma ter mais de 18 anos</li>
                  <li>• Garante capacidade legal para contratar</li>
                  <li>• Autoriza o processamento de dados</li>
                </ul>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">Se não concordar:</h3>
                </div>
                <ul className="space-y-1 text-red-800 text-sm">
                  <li>• Não deve usar nossos serviços</li>
                  <li>• Deve cancelar sua conta imediatamente</li>
                  <li>• Não terá direito aos recursos</li>
                  <li>• Perderá dados não exportados</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Description */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              2. Descrição dos Serviços
            </h2>
            <p className="text-xl text-gray-600">
              O que oferecemos em cada plano de assinatura
            </p>
          </div>

          <div className="mb-12">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Serviços Principais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">🏪 Vitrine Digital</h4>
                  <p className="text-gray-600 text-sm">Criação e personalização de páginas de produtos profissionais</p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">🤖 IA de Otimização</h4>
                  <p className="text-gray-600 text-sm">Otimização automática de títulos, descrições e preços</p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">📊 Analytics Avançados</h4>
                  <p className="text-gray-600 text-sm">Relatórios detalhados de performance e vendas</p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">🔄 Sincronização ML</h4>
                  <p className="text-gray-600 text-sm">Integração oficial com Mercado Livre em tempo real</p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">🎨 Templates Premium</h4>
                  <p className="text-gray-600 text-sm">Modelos profissionais de alta conversão</p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">🔧 API Access</h4>
                  <p className="text-gray-600 text-sm">Integrações personalizadas via API REST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Limits Table */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Limites por Plano</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Plano</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Preço</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Produtos</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Usuários</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Suporte</th>
                  </tr>
                </thead>
                <tbody>
                  {planLimits.map((plan, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{plan.plan}</td>
                      <td className="py-3 px-4 text-gray-700">{plan.price}</td>
                      <td className="py-3 px-4 text-gray-700">{plan.products}</td>
                      <td className="py-3 px-4 text-gray-700">{plan.users}</td>
                      <td className="py-3 px-4 text-gray-700">{plan.support}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* User Obligations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              3. Obrigações do Usuário
            </h2>
            <p className="text-xl text-gray-600">
              Suas responsabilidades para manter os serviços funcionando
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {userObligations.map((obligation, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <obligation.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{obligation.title}</h3>
                </div>
                <p className="text-gray-600">{obligation.description}</p>
              </div>
            ))}
          </div>

          {/* Prohibited Uses */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-semibold text-red-900">Usos Proibidos</h3>
            </div>
            <p className="text-red-800 mb-6">
              As seguintes atividades são expressamente proibidas e podem resultar em suspensão imediata:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prohibitedUses.map((use, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-red-800 text-sm">{use}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Payment and Billing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Pagamento e Faturamento</h2>
            
            <div className="bg-white rounded-lg p-8 border border-gray-200 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Condições de Pagamento</h3>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start space-x-3">
                  <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Cobrança Antecipada:</strong> Todos os planos são cobrados antecipadamente no ato da contratação
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Renovação Automática:</strong> Assinatura renovada automaticamente, cancelamento pode ser feito a qualquer momento
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Inadimplência:</strong> Atraso de 15 dias resulta em suspensão, 30 dias em cancelamento automático
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Reembolsos</h3>
            <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Direito a Reembolso</span>
                  </h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Primeiros 7 dias (garantia)</li>
                    <li>• Falha técnica comprovada</li>
                    <li>• Não entrega do serviço contratado</li>
                    <li>• Cobrança indevida</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-900 mb-2 flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Sem Direito a Reembolso</span>
                  </h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Uso inadequado da plataforma</li>
                    <li>• Cancelamento após 7 dias</li>
                    <li>• Suspensão por violação dos termos</li>
                    <li>• Mudança de estratégia do usuário</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Alterações de Preço</h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
              <p className="text-blue-800">
                Reservamo-nos o direito de alterar preços com aviso prévio de 30 dias. 
                Clientes ativos mantêm preço atual até a próxima renovação. 
                Não concordando com o novo valor, o cancelamento pode ser feito sem ônus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Liability and Warranties */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Limitações de Responsabilidade</h2>
            
            <div className="bg-white rounded-lg p-8 border border-gray-200 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Disponibilidade do Serviço</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-700">
                    <strong>SLA Garantido:</strong> 99.9% de uptime mensal, excluindo manutenções programadas
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-700">
                    <strong>Manutenções:</strong> Comunicadas com 24h de antecedência, preferencialmente madrugada
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-700">
                    <strong>Backup:</strong> Dados protegidos com backup automático diário e replicação
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Exclusões de Responsabilidade</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <p className="text-yellow-800 mb-4 font-semibold">
                A MercaFlow não se responsabiliza por:
              </p>
              <ul className="space-y-2 text-yellow-800">
                <li>• Políticas e mudanças dos marketplaces (Mercado Livre, etc.)</li>
                <li>• Resultados de vendas ou performance comercial</li>
                <li>• Decisões comerciais baseadas nos dados fornecidos</li>
                <li>• Interrupções causadas por terceiros ou força maior</li>
                <li>• Uso inadequado ou violação destes termos</li>
                <li>• Perda de dados por ação do usuário</li>
              </ul>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-6">
              <h4 className="font-semibold text-red-900 mb-2">Limitação de Danos</h4>
              <p className="text-red-800 text-sm">
                Em nenhuma hipótese nossa responsabilidade excederá o valor pago pelo usuário 
                nos 12 meses anteriores ao evento que deu origem à reclamação, limitado ao 
                máximo de R$ 10.000,00 (dez mil reais).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Termination */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Cancelamento e Término</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancelamento pelo Usuário</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>A qualquer momento pela área do cliente</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Acesso mantido até fim do período pago</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Exportação de dados disponível por 30 dias</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Sem multa ou penalidade</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancelamento pela MercaFlow</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Violação dos termos de uso</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Inadimplência superior a 30 dias</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Atividades fraudulentas ou ilegais</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Aviso prévio de 15 dias (exceto fraude)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
              <h4 className="font-semibold text-blue-900 mb-2">Após o Término</h4>
              <p className="text-blue-800 text-sm">
                Dados e configurações serão mantidos por 90 dias para possível reativação. 
                Após esse período, informações serão permanentemente excluídas, 
                exceto dados necessários para cumprimento de obrigações legais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Terms */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Disposições Gerais</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Lei Aplicável e Foro</h3>
                <p className="text-gray-700">
                  Estes termos são regidos pelas leis brasileiras. Qualquer controvérsia será 
                  dirimida no foro da Comarca de São Paulo - SP, com renúncia expressa a 
                  qualquer outro, por mais privilegiado que seja.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Modificações dos Termos</h3>
                <p className="text-gray-700 mb-4">
                  Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                  Alterações significativas serão comunicadas com antecedência mínima de 30 dias.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">
                    <strong>Versão atual:</strong> 2.1 • <strong>Vigência:</strong> 08/10/2025 • 
                    <strong>Próxima revisão:</strong> 08/04/2026
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Contato</h3>
                <p className="text-gray-700 mb-4">
                  Dúvidas sobre estes termos podem ser esclarecidas através dos canais oficiais:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> juridico@mercaflow.com.br</p>
                  <p><strong>Telefone:</strong> +55 (11) 3000-0000</p>
                  <p><strong>Endereço:</strong> Av. Paulista, 1374 - 8º andar, São Paulo - SP, CEP 01310-100</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agreement CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Aceita os Termos?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Comece seu teste gratuito agora e experimente todos os recursos 
            da plataforma por 14 dias, sem compromisso.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Aceitar e Começar Teste Grátis</span>
            </Link>
            
            <Link
              href="/contato"
              className="border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Falar com Jurídico
            </Link>
          </div>

          <div className="mt-8 text-blue-200 text-sm">
            ✓ 14 dias grátis ✓ Sem cartão ✓ Cancelamento fácil ✓ Suporte incluído
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}