export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Página de Registro
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Esta é uma página de teste simplificada.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p>Registro temporariamente desabilitado.</p>
          <p>Funcionalidade será implementada em breve.</p>
          <div className="mt-4">
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-500"
            >
              Voltar ao login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
