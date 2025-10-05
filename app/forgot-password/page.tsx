'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Get message from URL params
  const message = searchParams.get('message')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    // Validação básica
    if (!email) {
      setError('Email é obrigatório')
      setIsLoading(false)
      return
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (resetError) {
        console.error('Erro ao enviar email de recuperação:', resetError)
        setError(resetError.message)
        setIsLoading(false)
        return
      }

      setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.')
      setIsLoading(false)
    } catch (err) {
      console.error('Erro inesperado:', err)
      setError('Erro ao enviar email de recuperação. Tente novamente.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Esqueceu sua senha?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite seu email para receber instruções de recuperação
          </p>
        </div>

        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Enviando...' : 'Enviar instruções'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-gray-600">Lembrou sua senha? </span>
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Fazer login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  )
}