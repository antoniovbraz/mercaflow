import PublicLayout from "@/components/layout/PublicLayout";
import {
  Target,
  Users,
  Award,
  Globe,
  Lightbulb,
  Shield,
  TrendingUp,
  Code,
  Rocket,
  Star,
} from "lucide-react";

export default function SobrePage() {
  const stats = [
    {
      number: "87%",
      label: "Precisão dos modelos preditivos",
      icon: TrendingUp,
    },
    { number: "2.5K+", label: "Decisões orientadas por IA/dia", icon: Target },
    {
      number: "+R$ 15K",
      label: "Aumento médio de faturamento/mês",
      icon: Rocket,
    },
    { number: "47M+", label: "Insights acionáveis gerados", icon: Lightbulb },
  ];

  const values = [
    {
      icon: Target,
      title: "Ação, Não Dados",
      description:
        'Não mostramos gráficos bonitos. Dizemos exatamente o QUE fazer: "Aumente preço 8% AGORA", "Mude título para X". Insights acionáveis com ROI previsto.',
    },
    {
      icon: Lightbulb,
      title: "Ciência, Não Achismo",
      description:
        "Decisões baseadas em economia aplicada (elasticidade-preço), machine learning (87% precisão) e análise competitiva. Zero feeling, 100% ciência.",
    },
    {
      icon: TrendingUp,
      title: "Inteligência Ativa",
      description:
        "Nossa IA não espera você perguntar. Ela monitora 24/7, detecta oportunidades e envia alertas urgentes quando há dinheiro na mesa.",
    },
    {
      icon: Shield,
      title: "Transparência Total",
      description:
        'Cada insight mostra o raciocínio: "Por quê?", "Qual impacto?", "Quanto vou ganhar?". Nada de caixas-pretas, você entende e confia.',
    },
  ];

  const team = [
    {
      name: "Dr. Ricardo Almeida",
      role: "CEO & Chief Economist",
      bio: "PhD em Economia pela FGV. Ex-Banco Central, criou modelos de elasticidade-preço que movimentaram R$ 50B+. Especialista em microeconomia aplicada.",
      expertise: "Economia Aplicada, Elasticidade-Preço, Modelos Preditivos",
      image: "/team/ricardo.jpg", // Placeholder
    },
    {
      name: "Dra. Ana Rodrigues",
      role: "CTO & Head of AI",
      bio: "PhD em Machine Learning pela USP. Ex-Google DeepMind, publicou 12 papers sobre IA preditiva. Criou modelos com 87%+ de precisão.",
      expertise: "Machine Learning, NLP, Sistemas Preditivos",
      image: "/team/ana.jpg", // Placeholder
    },
    {
      name: "Prof. Carlos Mendes",
      role: "Head of Data Science",
      bio: "Ex-Nubank, liderou time de analytics. Professor de Estatística na UNICAMP. Especialista em análise competitiva e forecasting.",
      expertise: "Data Science, Análise Competitiva, Time Series Forecasting",
      image: "/team/carlos.jpg", // Placeholder
    },
    {
      name: "Mariana Costa",
      role: "Head of Engineering",
      bio: "Ex-iFood, arquitetou sistemas de processamento real-time de 10M+ eventos/dia. Especialista em data engineering e pipelines ML.",
      expertise: "Data Engineering, Real-Time Systems, MLOps",
      image: "/team/mariana.jpg", // Placeholder
    },
  ];

  const timeline = [
    {
      year: "2022",
      title: "O Problema: Dashboards Passivos",
      description:
        'Identificamos que todas as ferramentas só mostravam dados, mas ninguém dizia o QUE fazer. Vendedores perdiam dinheiro por "achismo".',
    },
    {
      year: "2023",
      title: "Primeiro Motor de Elasticidade-Preço",
      description:
        "Lançamos o primeiro sistema de precificação científica do Brasil usando curvas de demanda e elasticidade. 73% de precisão inicial.",
    },
    {
      year: "2024",
      title: "IA Preditiva com 87% de Precisão",
      description:
        "Modelos de machine learning atingem 87% de acurácia em previsão de vendas. Geramos +R$ 180M em faturamento adicional para clientes.",
    },
    {
      year: "2025",
      title: "Plataforma de Inteligência Completa",
      description:
        "6 pilares de análise: elasticidade, previsão, competitiva, NLP, automação e insights acionáveis 24/7. 47M+ insights gerados.",
    },
  ];

  const achievements = [
    {
      icon: Award,
      title: "Melhor Inovação em IA 2024",
      description:
        "Prêmio FIESP de Inovação Tecnológica por modelos preditivos de elasticidade-preço com 87% de precisão",
    },
    {
      icon: Code,
      title: "3 Patentes em Machine Learning",
      description:
        "Algoritmos proprietários de elasticidade-preço, forecasting preditivo e análise competitiva NLP registrados no INPI",
    },
    {
      icon: TrendingUp,
      title: "+R$ 180M Gerados para Clientes",
      description:
        "Decisões orientadas por nossa IA geraram R$ 180M+ em faturamento adicional comprovado via análise A/B",
    },
    {
      icon: Globe,
      title: "Publicações Científicas",
      description:
        "5 papers aceitos em conferências internacionais (NeurIPS, ICML) sobre economia aplicada e ML para e-commerce",
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              De Dashboards Passivos para{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Insights Acionáveis
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Nascemos da frustração com ferramentas que só mostram dados.
              Criamos uma plataforma que combina{" "}
              <strong>
                economia aplicada + IA preditiva + engenharia de dados
              </strong>{" "}
              para dizer exatamente o QUE fazer para aumentar suas vendas.
            </p>

            <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-6 py-3">
              <Star className="w-5 h-5 text-green-600 fill-current" />
              <span className="font-medium text-green-800">
                Fundada por economistas, cientistas de dados e engenheiros de
                software
              </span>
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
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
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
                  <strong>
                    Transformar dados passivos em decisões acionáveis.
                  </strong>
                  Vimos vendedores brasileiros perdendo dinheiro porque suas
                  ferramentas só mostram gráficos e métricas — mas não dizem o
                  QUE fazer.
                </p>
                <p>
                  Por isso criamos o MercaFlow: uma plataforma de{" "}
                  <strong>inteligência analítica</strong> que combina economia
                  aplicada (elasticidade-preço, curvas de demanda), machine
                  learning preditivo (87% de precisão) e engenharia de dados
                  para gerar <strong>insights acionáveis</strong> todos os dias.
                </p>
                <p>
                  <strong>Nosso objetivo é simples:</strong> você não precisa
                  ser economista, cientista de dados ou programador. Nossa IA
                  analisa seus dados e diz exatamente: &ldquo;Aumente o preço 8%
                  AGORA&rdquo; ou &ldquo;Este título está fraco, mude para
                  X&rdquo;.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Nossa Visão</h3>
              <p className="text-lg text-blue-100 mb-6">
                &ldquo;Ser a plataforma #1 de inteligência analítica para
                e-commerce brasileiro até 2027, gerando R$ 1 bilhão em
                faturamento adicional para nossos clientes através de decisões
                orientadas por ciência, não achismo.&rdquo;
              </p>
              <div className="bg-white/20 rounded-xl p-4">
                <div className="text-sm text-blue-200 mb-1">
                  Progresso atual:
                </div>
                <div className="text-2xl font-bold">
                  +R$ 180M gerados para clientes
                </div>
                <div className="text-blue-200">
                  47M+ insights acionáveis entregues
                </div>
                <div className="text-blue-200 mt-2">
                  87% precisão preditiva média
                </div>
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
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-8 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {value.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
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
              Evolução da Inteligência Analítica
            </h2>
            <p className="text-xl text-gray-600">
              De dashboards passivos à IA que diz exatamente o QUE fazer
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>
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
              PhDs em Economia, Machine Learning e Data Science. Publicações em
              NeurIPS, ICML e conferências científicas.
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

                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <div className="text-blue-600 font-medium mb-3">
                  {member.role}
                </div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {member.bio}
                </p>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">
                    Especialidades:
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {member.expertise}
                  </div>
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
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <achievement.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {achievement.title}
                    </h3>
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
            Pare de Adivinhar. Comece a Decidir com Ciência.
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se aos vendedores que trocaram dashboards passivos por
            insights acionáveis. Nossa IA já gerou +R$ 180M em faturamento
            adicional.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
              Testar Inteligência Grátis por 14 Dias
            </button>

            <button className="border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              Ver Modelos Preditivos em Ação
            </button>
          </div>

          <div className="mt-8 text-blue-200 text-sm">
            Contratando: Cientistas de Dados, Economistas e Engenheiros de ML •
            mercaflow.com.br/carreiras
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
