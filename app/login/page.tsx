"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "@/utils/toast-helper";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Show success/info messages from URL params via toast
  useEffect(() => {
    const successMessage = searchParams.get("success");
    const message = searchParams.get("message");

    if (successMessage) {
      showSuccessToast(successMessage);
    } else if (message) {
      showInfoToast(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validação básica
    if (!email || !password) {
      showErrorToast(new Error("Email e senha são obrigatórios"));
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        showErrorToast(signInError);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Login successful, show toast and redirect
        showSuccessToast("Login realizado com sucesso!", {
          description: "Redirecionando para o dashboard...",
        });

        // Small delay for user to see success message
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      }
    } catch (error) {
      showErrorToast(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-600/10 blur-3xl" />
        <div className="absolute top-80 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-600/10 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-600/10 blur-3xl" />
      </div>

      <div className="relative max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-xl">
            <span className="text-white font-bold text-xl">MF</span>
          </div>

          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-4 py-2 mb-6">
            <span className="text-2xl">🔐</span>
            <span className="text-sm font-medium text-blue-800">
              Login Seguro
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
            Entre na sua{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              conta
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Acesse sua plataforma <strong>MercaFlow</strong> e gerencie seu
            e-commerce
          </p>
        </div>

        <form
          className="space-y-6 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-100/50"
          onSubmit={handleSubmit}
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-800 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-800 mb-2"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
                placeholder="Sua senha"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-6 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
            >
              <span className="relative">
                {isLoading ? "Entrando..." : "Entrar"}
              </span>
            </button>
          </div>

          <div className="text-center">
            <span className="text-gray-600">Não tem conta? </span>
            <Link
              href="/register"
              className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Criar conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
