import { redirect } from 'next/navigation'
import { getUserProfileWithRole } from '@/utils/supabase/roles'

export default async function PrivatePage() {
  const profile = await getUserProfileWithRole()
  
  if (!profile) {
    redirect('/login?message=Você%20precisa%20estar%20logado%20para%20acessar%20esta%20página')
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
            <p className="text-gray-900">{profile.email}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Nome:</label>
            <p className="text-gray-900">{profile.full_name || 'Não informado'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Role:</label>
            <p className="text-gray-900 font-medium capitalize">{profile.role}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">ID:</label>
            <p className="text-gray-900 text-xs font-mono">{profile.id}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Criado em:</label>
            <p className="text-gray-900">{new Date(profile.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <form action="/auth/logout" method="post">
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