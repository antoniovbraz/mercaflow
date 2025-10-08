import { Star, Quote, TrendingUp, Award } from 'lucide-react'

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Carlos Silva',
      role: 'Loja Tech Premium',
      category: 'Eletrônicos',
      avatar: 'CS',
      rating: 5,
      growth: '+187%',
      quote: 'O MercaFlow transformou completamente meu negócio. Em 4 meses, minhas vendas quase triplicaram. A IA para otimização de preços é simplesmente incrível - sempre me mantém competitivo sem perder margem.',
      metrics: {
        sales: 'R$ 145k/mês',
        products: '2.3k produtos',
        roi: '340% ROI'
      },
      featured: true
    },
    {
      name: 'Ana Martins',
      role: 'Moda & Estilo',
      category: 'Fashion',
      avatar: 'AM',
      rating: 5,
      growth: '+134%',
      quote: 'A vitrine profissional do MercaFlow fez toda diferença. Meus clientes agora me veem como uma marca de verdade, não apenas mais um vendedor. O atendimento é excepcional!',
      metrics: {
        sales: 'R$ 87k/mês',
        products: '890 produtos',
        roi: '280% ROI'
      }
    },
    {
      name: 'Roberto Costa',
      role: 'Casa & Jardim Pro',
      category: 'Casa & Decoração',
      avatar: 'RC',
      rating: 5,
      growth: '+98%',
      quote: 'Implementei o MercaFlow há 6 meses. Os analytics me ajudaram a identificar produtos com maior potencial e a IA otimizou meus títulos automaticamente. Resultados incríveis!',
      metrics: {
        sales: 'R$ 203k/mês',
        products: '1.7k produtos',
        roi: '410% ROI'
      }
    },
    {
      name: 'Lucia Santos',
      role: 'Beauty Essential',
      category: 'Beleza & Cuidados',
      avatar: 'LS',
      rating: 5,
      growth: '+156%',
      quote: 'Como mãe empreendedora, precisava de uma solução que funcionasse sem complicações. O MercaFlow é perfeito - setup rápido, suporte incrível e resultados que falam por si só.',
      metrics: {
        sales: 'R$ 92k/mês',
        products: '650 produtos',
        roi: '295% ROI'
      }
    }
  ]

  const awards = [
    {
      name: 'Melhor SaaS E-commerce',
      org: 'Prêmio ABComm 2025',
      icon: Award
    },
    {
      name: 'Top Rated',
      org: 'G2 Reviews',
      icon: Star
    },
    {
      name: 'Líder Categoria',
      org: 'Capterra Choice',
      icon: TrendingUp
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 text-green-600 fill-current" />
            <span className="text-sm font-medium text-green-800">Casos de Sucesso</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Vendedores reais,
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {' '}resultados extraordinários
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubra como milhares de empreendedores brasileiros estão transformando 
            seus negócios no Mercado Livre com nossa plataforma.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`relative bg-gradient-to-br ${
                testimonial.featured 
                  ? 'from-blue-50 to-indigo-50 border-2 border-blue-200' 
                  : 'from-gray-50 to-white border border-gray-200'
              } rounded-2xl p-8 hover:shadow-xl transition-all duration-300`}
            >
              {/* Featured Badge */}
              {testimonial.featured && (
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-medium">
                  Destaque do Mês
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  
                  {/* Info */}
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-xs text-gray-500">{testimonial.category}</div>
                  </div>
                </div>

                {/* Growth Badge */}
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                  {testimonial.growth}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-200" />
                <p className="text-gray-700 leading-relaxed italic pl-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{testimonial.metrics.sales}</div>
                  <div className="text-xs text-gray-500">Vendas/mês</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{testimonial.metrics.products}</div>
                  <div className="text-xs text-gray-500">Produtos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{testimonial.metrics.roi}</div>
                  <div className="text-xs text-gray-500">ROI Total</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Awards & Recognition */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Reconhecimento da Indústria</h3>
            <p className="text-gray-300">
              Nossa excelência é reconhecida pelos principais órgãos do setor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {awards.map((award, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
                  <award.icon className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="font-semibold mb-1">{award.name}</div>
                <div className="text-gray-400 text-sm">{award.org}</div>
              </div>
            ))}
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-gray-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">4.9/5</div>
              <div className="text-gray-400 text-sm">Avaliação Média</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">2.500+</div>
              <div className="text-gray-400 text-sm">Clientes Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">96%</div>
              <div className="text-gray-400 text-sm">Taxa Retenção</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-gray-400 text-sm">Suporte Premium</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}