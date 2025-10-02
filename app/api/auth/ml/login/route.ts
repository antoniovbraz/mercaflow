import { NextResponse } from 'next/server'

export async function GET() {
  const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${process.env.ML_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.ML_REDIRECT_URI || '')}&state=${generateRandomState()}`
  
  return NextResponse.redirect(authUrl)
}

function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}