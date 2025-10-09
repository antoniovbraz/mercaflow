import { getCurrentUser, createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DebugUser() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()
  
  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user roles
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug User Information</h1>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">User Authentication</h2>
            <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
{JSON.stringify({
  id: user.id,
  email: user.email,
  created_at: user.created_at,
  app_metadata: user.app_metadata,
  user_metadata: user.user_metadata
}, null, 2)}
            </pre>
          </div>

          {/* Profile Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">User Profile</h2>
            {profileError ? (
              <div className="text-red-600">
                <strong>Error:</strong> {profileError.message}
              </div>
            ) : profile ? (
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
{JSON.stringify(profile, null, 2)}
              </pre>
            ) : (
              <div className="text-yellow-600">No profile found</div>
            )}
          </div>

          {/* Roles Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">User Roles</h2>
            {rolesError ? (
              <div className="text-red-600">
                <strong>Error:</strong> {rolesError.message}
              </div>
            ) : roles && roles.length > 0 ? (
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
{JSON.stringify(roles, null, 2)}
              </pre>
            ) : (
              <div className="text-yellow-600">No roles found</div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Create Missing Data</h2>
            
            {!profile && (
              <form action="/api/debug/create-profile" method="post" className="mb-4">
                <button 
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Create Profile
                </button>
              </form>
            )}
            
            {(!roles || roles.length === 0) && (
              <form action="/api/debug/create-role" method="post" className="mb-4">
                <button 
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Create User Role
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}