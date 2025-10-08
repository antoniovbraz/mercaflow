import PublicLayout from '@/components/layout/PublicLayout'
import { 
  Target, 
  Users, 
  Award, 
  Globe,
  Heart,
  Lightbulb,
  Shield,
  TrendingUp,
  Code,
  Rocket,
  Star
} from 'lucide-react'

export default function SobrePage() {
  const stats = [
    { number: '50K+', label: 'Produtos sincronizados', icon: TrendingUp },
    { number: '2.5K+', label: 'Vendedores ativos', icon: Users },
    { number: '180%', label: 'Aumento médio em vendas', icon: Rocket },
    { number: '99.9%', label: 'Uptime garantido', icon: Shield }
  ]

  const values = [
    {
      icon: Target,
      title: 'Foco no Resultado',
      description: 'Cada funcionalidade é pensada para aumentar suas vendas e maximizar seu ROI no Mercado Livre.'
    },
    {
      icon: Heart,
      title: 'Simplicidade',
      description: 'Tecnologia complexa com interface simples. Você não precisa ser técnico para dominar o e-commerce.'
    },
    {
      icon: Lightbulb,
      title: 'Inovação Contínua',
      description: 'Sempre um passo à frente com IA, automações e recursos que seus concorrentes ainda não têm.'
    },
    {
      icon: Shield,
      title: 'Confiabilidade',
      description: 'Infraestrutura de nível enterprise, segurança máxima e suporte que resolve de verdade.'
    }
  ]

  const team = [
    {
      name: 'Carlos Mendes',
      role: 'CEO & Co-fundador',
      bio: 'Ex-Mercado Livre, 12 anos em e-commerce. Criou soluções que processaram R$ 2B+ em vendas.',
      expertise: 'E-commerce Strategy, Product Management',
      image: '/team/carlos.jpg' // Placeholder
    },
    {
      name: 'Ana Rodrigues',
      role: 'CTO & Co-fundadora',
      bio: 'Ex-Google, especialista em IA e machine learning. PhD em Ciência da Computação pela USP.',
      expertise: 'AI/ML, System Architecture, Data Science',
      image: '/team/ana.jpg' // Placeholder
    },
    {
      name: 'Rafael Santos',
      role: 'Head of Growth',
      bio: 'Ex-Shopee, cresceu marketplaces de 0 a 100M+ GMV. Especialista em growth hacking.',
      expertise: 'Growth Marketing, Analytics, Conversion Optimization',
      image: '/team/rafael.jpg' // Placeholder
    },
    {
      name: 'Mariana Costa',
      role: 'Head of Customer Success',
      bio: 'Ex-Vtex, 8 anos ajudando e-commerces a escalarem. Conhece cada dor do vendedor brasileiro.',
      expertise: 'Customer Success, E-commerce Operations, Training',
      image: '/team/mariana.jpg' // Placeholder
    }
  ]

  const timeline = [
    {
      year: '2022',
      title: 'Fundação da MercaFlow',
      description: 'Nascemos da frustração de ver vendedores brasileiros perdendo vendas por limitações técnicas.'
    },
    {
      year: '2023',
      title: 'Primeira IA para E-commerce BR',
      description: 'Lançamos a primeira IA especializada em otimização para o mercado brasileiro.'
    },
    {
      year: '2024',
      title: 'Crescimento Exponencial',
      description: 'Alcançamos 2.500+ vendedores ativos e R$ 500M+ em GMV processado pela plataforma.'
    },
    {
      year: '2025',
      title: 'Expansão Multi-marketplace',
      description: 'Integrando Shopee, Amazon, Magazine Luiza e outros. Nossa visão de ecossistema único se torna realidade.'
    }
  ]

  const achievements = [
    {
      icon: Award,
      title: 'Startup do Ano 2023',
      description: 'Eleita pela ABCOMM como a startup mais promissora do e-commerce brasileiro'
    },
    {
      icon: Globe,
      title: 'Parceria Oficial Mercado Livre',
      description: 'Somos parceiros certificados com acesso privilegiado às APIs mais avançadas'
    },
    {
      icon: Code,
      title: 'Tecnologia Patenteada',
      description: 'Nossa IA de otimização possui 3 patentes registradas no Brasil e Estados Unidos'
    },
    {
      icon: Users,
      title: '98% Satisfação',
      description: 'NPS de 78 pontos, o mais alto do setor de SaaS para e-commerce no Brasil'
    }
  ]

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Transformando o{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                E-commerce Brasileiro
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Nascemos da missão de democratizar o sucesso no e-commerce. 
              Acreditamos que todo vendedor brasileiro merece ferramentas de 
              nível mundial para competir e vencer.
            </p>

            <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-6 py-3">
              <Star className="w-5 h-5 text-green-600 fill-current" />
              <span className="font-medium text-green-800">Fundada por ex-Mercado Livre e Google</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Nossa Missão
              </h2>
              <div className="prose prose-lg text-gray-600">
                <p>
                  <strong>Democratizar o sucesso no e-commerce brasileiro.</strong> 
                  Vemos um país com empreendedores incríveis, mas com acesso limitado 
                  às ferramentas que as grandes empresas usam.
                </p>
                <p>
                  Por isso criamos o MercaFlow: para que qualquer vendedor, 
                  independente do tamanho, tenha acesso à mesma tecnologia de IA, 
                  automação e analytics que os gigantes do varejo usam.
                </p>
                <p>
                  <strong>Nosso objetivo é simples:</strong> fazer você vender mais, 
                  com menos esforço, usando a melhor tecnologia disponível.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Nossa Visão</h3>
              <p className="text-lg text-blue-100 mb-6">
                &ldquo;Ser a plataforma #1 do e-commerce brasileiro até 2027, 
                processando R$ 10 bilhões em vendas e capacitando 100.000 
                empreendedores com tecnologia de ponta.&rdquo;
              </p>
              <div className="bg-white/20 rounded-xl p-4">
                <div className="text-sm text-blue-200 mb-1">Progresso atual:</div>
                <div className="text-2xl font-bold">R$ 500M+ processados</div>
                <div className="text-blue-200">2.500+ vendedores ativos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nossos Valores
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Os princípios que guiam cada decisão e cada linha de código
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{value.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nossa Jornada
            </h2>
            <p className="text-xl text-gray-600">
              De uma ideia à plataforma líder do e-commerce brasileiro
            </p>
          </div>

          <div className="space-y-8">
            {timeline.map((event, index) => (
              <div key={index} className="flex items-center space-x-8">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {event.year}
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Time de Liderança
            </h2>
            <p className="text-xl text-gray-600">
              Veteranos das maiores empresas de tecnologia e e-commerce do mundo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                    <Users className="w-12 h-12 text-gray-500" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <div className="text-blue-600 font-medium mb-3">{member.role}</div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{member.bio}</p>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Especialidades:</div>
                  <div className="text-sm font-medium text-gray-700">{member.expertise}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Reconhecimento
            </h2>
            <p className="text-xl text-gray-600">
              Conquistas que validam nossa excelência e inovação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <achievement.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                    <p className="text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Quer Fazer Parte Desta História?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de empreendedores que estão transformando 
            seus negócios com o MercaFlow
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
              Começar Teste Grátis
            </button>
            
            <button className="border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              Conhecer o Time
            </button>
          </div>

          <div className="mt-8 text-blue-200 text-sm">
            Estamos contratando! Veja nossas vagas em mercaflow.com.br/carreiras
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}