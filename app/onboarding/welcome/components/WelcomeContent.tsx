"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function WelcomeContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Bem-vindo ao MercaFlow!
          </CardTitle>
          <p className="text-xl text-gray-600">
            Sua plataforma completa para gerenciar vendas no Mercado Livre
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Gestão de Produtos
                </h3>
                <p className="text-sm text-blue-700">
                  Sincronize e gerencie todos os seus produtos em um só lugar
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900 mb-1">
                  Controle de Pedidos
                </h3>
                <p className="text-sm text-indigo-700">
                  Acompanhe todas as vendas em tempo real
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-purple-900 mb-1">
                  Respostas Automáticas
                </h3>
                <p className="text-sm text-purple-700">
                  Responda perguntas rapidamente com templates
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  Relatórios Detalhados
                </h3>
                <p className="text-sm text-green-700">
                  Análises e métricas para impulsionar suas vendas
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="pt-4">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">
              Próximos Passos
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <p>Conectar sua conta do Mercado Livre</p>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-400 text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <p>Sincronizar seus produtos e pedidos</p>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-200 text-gray-700 rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <p>Começar a gerenciar suas vendas</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="flex-1"
            >
              Pular Introdução
            </Button>
            <Button
              onClick={() => router.push("/onboarding/connect-ml")}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Começar Agora
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
