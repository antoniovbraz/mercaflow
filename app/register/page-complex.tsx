import { Suspense } from 'react'
import { RegisterFormWithValidation } from '@/components/RegisterFormWithValidation'

async function ErrorDisplay({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  
  if (params.error) {
    return (
      <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-md mx-auto">
        {params.error}
      </div>
    )
  }
  
  return null
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <div>
      <Suspense fallback={<div>Carregando...</div>}>
        <ErrorDisplay searchParams={searchParams} />
      </Suspense>
      <RegisterFormWithValidation />
    </div>
  )
}