import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Merca Flow - Intelligence Comercial para MercadoLibre',
  description: 'Plataforma SaaS de análise e automação para vendedores do MercadoLibre Brasil',
  keywords: 'mercadolibre, ecommerce, vendas, automação, inteligência comercial, saas',
  // Updated: 2025-10-02 - MVP v2.0
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}