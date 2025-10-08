import { TrendingUp, Users, DollarSign, Target, Zap, Award } from 'lucide-react'

export default function StatsSection() {
  const stats = [
    {
      icon: TrendingUp,
      number: '+127%',
      label: 'Aumento médio em vendas',
      subtitle: 'Primeiros 6 meses',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: DollarSign,
      number: 'R$ 2.8M',
      label: 'Faturamento gerado',
      subtitle: 'Para nossos clientes',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Users,
      number: '2.500+',
      label: 'Vendedores ativos',
      subtitle: 'Em toda plataforma',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Target,
      number: '96%',
      label: 'Taxa de satisfação',
      subtitle: 'NPS Score',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Zap,
      number: '15 min',
      label: 'Setup médio',
      subtitle: 'Da conta à primeira venda',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: Award,
      number: '#1',
      label: 'Melhor avaliação',
      subtitle: 'G2 & Capterra 2025',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Resultados que falam por si só
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mais de <strong>2.500 vendedores</strong> já transformaram seus negócios no Mercado Livre com o MercaFlow. 
            Veja os números que comprovam nossa eficácia.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${stat.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>

              {/* Number */}
              <div className="mb-3">
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-gray-700">
                  {stat.label}
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-gray-500 text-sm">
                {stat.subtitle}
              </p>

              {/* Decorative gradient line */}
              <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${
                stat.color === 'text-green-600' ? 'from-green-400 to-green-600' :
                stat.color === 'text-blue-600' ? 'from-blue-400 to-blue-600' :
                stat.color === 'text-purple-600' ? 'from-purple-400 to-purple-600' :
                stat.color === 'text-orange-600' ? 'from-orange-400 to-orange-600' :
                stat.color === 'text-yellow-600' ? 'from-yellow-400 to-yellow-600' :
                'from-indigo-400 to-indigo-600'
              } rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">
            Junte-se aos milhares de vendedores que já escolheram o MercaFlow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-600 text-sm">
              4.9/5 baseado em 1.247 avaliações
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}