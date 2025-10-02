export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Oops! Algo deu errado</h2>
          <p className="text-gray-600 mb-6">
            Ocorreu um erro durante o processo de autenticação. 
            Por favor, tente novamente.
          </p>
          <div className="space-y-4">
            <a 
              href="/login"
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Voltar ao Login
            </a>
            <a 
              href="/register"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ml-3"
            >
              Criar Nova Conta
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}