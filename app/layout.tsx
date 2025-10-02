import '@/app/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Merca Flow - Intelligence Comercial para MercadoLibre',
  description: 'Plataforma de análise e automação para vendedores do MercadoLibre Brasil',
  keywords: 'mercadolibre, ecommerce, vendas, automação, inteligência comercial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}