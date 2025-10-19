"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";

export function ConnectMLContent() {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      logger.info("Initiating ML OAuth flow");

      // Redirect to ML OAuth authorization
      const response = await fetch("/api/ml/oauth/authorize", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to initiate OAuth flow");
      }

      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      logger.error("Error connecting to ML", { error });
      alert("Erro ao conectar com Mercado Livre. Tente novamente.");
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mb-4">
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mb-4">
            Conecte sua Conta do Mercado Livre
          </CardTitle>
          <CardDescription className="text-lg">
            Para sincronizar seus produtos e pedidos, precisamos conectar sua
            conta
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Security Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  Conexão 100% Segura
                </h3>
                <p className="text-sm text-green-700">
                  Utilizamos o protocolo OAuth 2.0 do Mercado Livre. Suas
                  credenciais nunca são compartilhadas conosco.
                </p>
              </div>
            </div>
          </div>

          {/* What we can do */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              O que você poderá fazer:
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-gray-700">
                  Sincronizar produtos automaticamente
                </p>
              </div>
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-gray-700">Gerenciar pedidos em tempo real</p>
              </div>
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-gray-700">
                  Responder perguntas dos clientes
                </p>
              </div>
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-gray-700">
                  Atualizar preços e estoque em lote
                </p>
              </div>
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-gray-700">
                  Ver relatórios de vendas detalhados
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Como funciona:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <p className="text-gray-700 pt-0.5">
                  Você será redirecionado para o site do Mercado Livre
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <p className="text-gray-700 pt-0.5">
                  Faça login e autorize o acesso do MercaFlow
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <p className="text-gray-700 pt-0.5">
                  Volte automaticamente para o MercaFlow
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push("/onboarding/welcome")}
              className="flex-1"
              disabled={connecting}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Voltar
            </Button>
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
            >
              {connecting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Conectando...
                </>
              ) : (
                <>
                  Conectar com Mercado Livre
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
                </>
              )}
            </Button>
          </div>

          {/* Skip option */}
          <div className="text-center pt-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Pular esta etapa (conectar depois)
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
