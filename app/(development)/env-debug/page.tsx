export default function EnvDebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
          <div className="ml-2 text-sm font-mono bg-gray-100 p-2 rounded mt-1">
            {supabaseUrl ? '✅ Configurado' : '❌ Não encontrado'}
          </div>
          {supabaseUrl && (
            <div className="mt-2 text-xs text-gray-600">
              URL: {supabaseUrl}
            </div>
          )}
        </div>
        
        <div className="p-4 border rounded">
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
          <div className="ml-2 text-sm font-mono bg-gray-100 p-2 rounded mt-1">
            {supabaseAnonKey ? '✅ Configurado' : '❌ Não encontrado'}
          </div>
          {supabaseAnonKey && (
            <div className="mt-2 text-xs text-gray-600">
              Key: {supabaseAnonKey.substring(0, 50)}...
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="text-lg font-semibold mb-2">Environment Info:</h2>
          <div className="text-sm space-y-1">
            <div>NODE_ENV: {process.env.NODE_ENV}</div>
            <div>VERCEL: {process.env.VERCEL ? 'Yes' : 'No'}</div>
            <div>VERCEL_ENV: {process.env.VERCEL_ENV || 'Not set'}</div>
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