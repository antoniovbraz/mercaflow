import Link from "next/link";
import {
  ArrowRight,
  Play,
  Brain,
  TrendingUp,
  DollarSign,
  Target,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-600/20 blur-3xl" />
        <div className="absolute top-80 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-600/20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-4 py-2 mb-6">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Inteligência Analítica + IA para E-commerce
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Insights Inteligentes
              </span>{" "}
              + Site Automático para seu E-commerce
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              <strong>Não mostramos apenas dados</strong> - dizemos exatamente{" "}
              <strong>o QUE fazer</strong> usando economia aplicada, análise
              preditiva e IA. + Site profissional sincronizado com marketplaces
              em <strong>&lt; 15 minutos</strong>.
            </p>

            {/* Key Benefits */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center lg:justify-start">
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  Precificação científica
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">
                  Previsão 87% precisa
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <Target className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">
                  Insights acionáveis
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/register"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <span>Começar Grátis por 14 Dias</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button className="group flex items-center justify-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:shadow-xl transition-all">
                  <Play className="w-5 h-5 text-blue-600 ml-1" />
                </div>
                <span>Ver Demo (2 min)</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">
                Mais de 2.500 vendedores aumentaram suas vendas com insights
                acionáveis
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">87%</div>
                  <div className="text-xs text-gray-500">
                    Precisão preditiva
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    +R$ 15k
                  </div>
                  <div className="text-xs text-gray-500">Receita média/mês</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">40%</div>
                  <div className="text-xs text-gray-500">Aumento em vendas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual/Dashboard Preview */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Mock Dashboard Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-12 flex items-center px-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
                </div>
              </div>

              {/* Mock Dashboard Content - INSIGHTS ACIONÁVEIS */}
              <div className="p-6">
                {/* Insight Card 1 - URGENTE */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg p-4 mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🔥</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 mb-1">
                        Aumente preço 8% AGORA
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        Elasticidade favorável detectada
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-green-600">
                          +R$ 1.2k/mês
                        </span>
                        <span className="text-xs text-gray-500">
                          87% confiança
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insight Card 2 - OPORTUNIDADE */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4 mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">💡</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 mb-1">
                        Título fraco em 3 produtos
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        IA sugere otimizações
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-600">
                          +23% conversão
                        </span>
                        <span className="text-xs text-gray-500">
                          92% confiança
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insight Card 3 - PREVISÃO */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">📈</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 mb-1">
                        Previsão: 234 vendas
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        Próximos 30 dias (±15%)
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-purple-600">
                          Estoque mín: 189 un
                        </span>
                        <span className="text-xs text-gray-500">
                          81% confiança
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl px-4 py-2 flex flex-col items-center justify-center font-bold shadow-lg">
              <div className="text-xs opacity-80">IA Ativa</div>
              <div className="text-lg">87%</div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl px-3 py-2 flex items-center space-x-2 shadow-lg">
              <Brain className="w-5 h-5" />
              <span className="text-sm font-semibold">Insights</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
