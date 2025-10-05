export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Área Protegida - MercaFlow
            </h1>
            <p className="text-gray-600">
              Funcionalidades em desenvolvimento
            </p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}