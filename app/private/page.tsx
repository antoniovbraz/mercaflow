import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUser } from '@/utils/supabase/auth-helpers'

export default async function PrivatePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Área Privada
        </h1>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Email:</label>
            <p className="text-gray-900">{user.email}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">ID:</label>
            <p className="text-gray-900 text-xs font-mono">{user.id}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Criado em:</label>
            <p className="text-gray-900">{new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Email confirmado:</label>
            <p className={`font-medium ${user.email_confirmed_at ? 'text-green-600' : 'text-red-600'}`}>
              {user.email_confirmed_at ? 'Sim' : 'Não'}
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}