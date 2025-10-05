import { createClient } from '@/utils/supabase/server'

export default async function TestPage() {
  try {
    const supabase = await createClient()

    // Test basic connection
    const { error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (testError) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">Erro de Conexão</h1>
          <p className="mt-4 text-red-500">{testError.message}</p>
          <pre className="mt-4 bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify(testError, null, 2)}
          </pre>
        </div>
      )
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-green-600">Conexão OK</h1>
        <p className="mt-4">Banco de dados conectado com sucesso!</p>
        <p className="mt-2">Tabelas estão acessíveis.</p>
      </div>
    )
  } catch (err) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Erro Inesperado</h1>
        <p className="mt-4 text-red-500">{err instanceof Error ? err.message : 'Erro desconhecido'}</p>
      </div>
    )
  }
}