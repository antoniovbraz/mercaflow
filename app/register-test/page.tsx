'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function RegisterTestPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const supabase = createClient()
      
      console.log('Tentando registrar:', { email, fullName })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      console.log('Resultado do registro:', { data, error })

      setResult({
        success: !error,
        data,
        error: error?.message,
        timestamp: new Date().toISOString()
      })

    } catch (err) {
      console.error('Erro inesperado:', err)
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teste de Registro (Client-Side)</h1>
      
      <form onSubmit={handleTest} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">Nome Completo:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
            minLength={6}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar Registro'}
        </button>
      </form>

      {result && (
        <div className={`p-4 border rounded ${result.success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
          <h2 className="font-semibold mb-2">
            {result.success ? '✅ Sucesso' : '❌ Erro'}
          </h2>
          
          <div className="text-sm space-y-2">
            <div><strong>Timestamp:</strong> {result.timestamp}</div>
            
            {result.error && (
              <div>
                <strong>Erro:</strong>
                <div className="font-mono text-red-700 mt-1">{result.error}</div>
              </div>
            )}
            
            {result.data && (
              <div>
                <strong>Dados:</strong>
                <pre className="font-mono text-xs mt-1 bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Nota:</strong> Este é um teste client-side. Verifique o console do navegador para logs detalhados.
        </p>
      </div>
    </div>
  )
}