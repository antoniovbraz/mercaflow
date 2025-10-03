// Layout para rotas de desenvolvimento
// Este layout é aplicado a todas as rotas dentro do grupo (development)

export default function DevelopmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Em produção, as rotas são bloqueadas no middleware
  return (
    <div className="min-h-screen bg-gray-50">
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                <strong>MODO DESENVOLVIMENTO</strong> - Esta página só é acessível durante o desenvolvimento.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}