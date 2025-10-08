import { getCurrentUser } from '@/utils/supabase/server'
import { getUserRole } from '@/utils/supabase/roles'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DebugMLPage() {
  console.log('=== DEBUG ML PAGE START ===')
  
  try {
    // Step 1: Check if user exists
    const user = await getCurrentUser()
    console.log('User:', user ? `${user.email} (${user.id})` : 'No user')
    
    if (!user) {
      console.log('No user - redirecting to login')
      redirect('/login')
    }

    // Step 2: Check user role
    const userRole = await getUserRole()
    console.log('User role:', userRole)
    
    // Step 3: Test requireRole specifically
    console.log('Testing requireRole...')
    
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-2xl font-bold mb-4 text-green-600">✅ DEBUG: ML Page Loading Successfully</h1>
            
            <div className="space-y-4">
              <div>
                <strong>User:</strong> {user.email} ({user.id})
              </div>
              <div>
                <strong>Role:</strong> {userRole}
              </div>
              <div>
                <strong>Status:</strong> <span className="text-green-600">Page loaded without errors</span>
              </div>
            </div>

            <div className="mt-6 space-x-4">
              <Link 
                href="/dashboard"
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                ← Voltar ao Dashboard
              </Link>
              
              <Link 
                href="/dashboard/ml"
                className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Ir para ML Dashboard Original
              </Link>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-semibold text-yellow-800 mb-2">Test Navigation:</h3>
              <p className="text-yellow-700">
                Se você conseguiu ver esta página, o problema não está no middleware ou autenticação básica.
                O problema pode estar na função requireRole() ou nos componentes ML.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('=== ERROR IN DEBUG ML PAGE ===', error)
    
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4 text-red-600">❌ ERROR: Problem Found!</h1>
            
            <div className="space-y-4">
              <div>
                <strong>Error:</strong> {error instanceof Error ? error.message : String(error)}
              </div>
              <div>
                <strong>Stack:</strong> 
                <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                  {error instanceof Error ? error.stack : 'No stack trace'}
                </pre>
              </div>
            </div>

            <div className="mt-6">
              <Link 
                href="/dashboard"
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                ← Voltar ao Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
}