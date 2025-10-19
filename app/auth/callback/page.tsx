"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function AuthCallbackContent() {
  const [message, setMessage] = useState("Processando autenticação...");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          // Removed console.error - errors handled by error boundaries
          setError(error.message);
          setMessage("Erro na autenticação");
          return;
        }

        if (data.session) {
          setMessage("Autenticação bem-sucedida! Redirecionando...");

          // Check if this is a password recovery callback
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1)
          );
          const type = hashParams.get("type");

          if (type === "recovery") {
            // Redirect to update password page
            router.push(
              "/update-password?message=Token de recuperação válido. Digite sua nova senha."
            );
          } else {
            // Regular login/signup callback
            router.push("/dashboard?success=Bem-vindo à MercaFlow!");
          }
        } else {
          // No session found, check for error in URL
          const errorParam = searchParams.get("error");
          const errorDescription = searchParams.get("error_description");

          if (errorParam) {
            setError(errorDescription || errorParam);
            setMessage("Erro na autenticação");
          } else {
            setMessage("Sessão não encontrada. Redirecionando para login...");
            setTimeout(() => {
              router.push(
                "/login?message=Sessão expirada. Faça login novamente."
              );
            }, 2000);
          }
        }
      } catch {
        // Removed console.error - errors handled by error boundaries
        setError("Erro inesperado durante a autenticação");
        setMessage("Erro na autenticação");
      }
    };

    handleAuthCallback();
  }, [router, searchParams, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            MercaFlow
          </h2>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white p-8 rounded-lg shadow">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600">
            Aguarde enquanto processamos sua autenticação...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
