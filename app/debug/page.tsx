'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DebugPage() {
  const { user, isSuperAdmin, platformOwner } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    const checkDebugInfo = async () => {
      if (!user) return

      try {
        const supabase = createClient()
        // Verificar diretamente no banco
        const { data: platformOwnerData, error } = await supabase
          .from('platform_owners')
          .select('*')
          .eq('email', user.email)
          .single()

        console.log('Platform Owner Query:', { platformOwnerData, error })

        setDebugInfo({
          userEmail: user.email,
          userMetadata: user.user_metadata,
          platformOwnerData,
          error: error?.message,
          isSuperAdminFromContext: isSuperAdmin,
          platformOwnerFromContext: platformOwner
        })
      } catch (err) {
        console.error('Debug error:', err)
        setDebugInfo({
          userEmail: user.email,
          error: 'Failed to fetch debug info'
        })
      }
    }

    checkDebugInfo()
  }, [user, isSuperAdmin, platformOwner])

  if (!user) {
    return <div className="p-8">Please login first</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">User Info</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Is Super Admin (Context):</strong> {isSuperAdmin ? 'YES' : 'NO'}</p>
      </div>

      {debugInfo && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Database Query Result</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4">
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}