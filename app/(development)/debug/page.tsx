import { getCurrentUser, isSuperAdmin } from '@/utils/supabase/auth-helpers'

export default async function DebugPage() {
  const user = await getCurrentUser()
  const isSuper = await isSuperAdmin()

  if (!user) {
    return <div>Not authenticated</div>
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🐛 Debug Info</h1>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">User Info</h2>
          <pre className="bg-gray-100 p-4 rounded mt-2">
            {JSON.stringify({ 
              id: user.id,
              email: user.email,
              isSuperAdmin: isSuper
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}