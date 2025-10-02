import { createClient } from '@/utils/supabase/server'

export default async function SupabaseTestPage() {
  let connectionStatus = 'Testando conexão...'
  let userCount = 'N/A'
  let errorDetails = null

  try {
    const supabase = await createClient()
    
    // Teste básico - contar usuários da tabela auth.users
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (error) {
      connectionStatus = 'Erro na consulta'
      errorDetails = error.message
    } else {
      connectionStatus = '✅ Conectado com sucesso'
      userCount = count?.toString() || '0'
    }
  } catch (error) {
    connectionStatus = '❌ Erro de conexão'
    errorDetails = error instanceof Error ? error.message : 'Erro desconhecido'
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teste de Conexão Supabase</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <strong>Status da Conexão:</strong>
          <div className="mt-2 text-lg">{connectionStatus}</div>
        </div>
        
        <div className="p-4 border rounded">
          <strong>Contagem de Usuários:</strong>
          <div className="mt-2">{userCount}</div>
        </div>

        {errorDetails && (
          <div className="p-4 border border-red-300 rounded bg-red-50">
            <strong>Detalhes do Erro:</strong>
            <div className="mt-2 text-sm text-red-700 font-mono">
              {errorDetails}
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="text-lg font-semibold mb-2">Variáveis de Ambiente:</h2>
          <div className="text-sm space-y-1">
            <div>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ Não encontrado'}</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não encontrado'}</div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> Esta página deve ser removida em produção por motivos de segurança.
          </p>
        </div>
      </div>
    </div>
  )
}