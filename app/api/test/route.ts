import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      status: 'OK',
      version: '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      apis: {
        mercadolibre: {
          connected: !!process.env.ML_CLIENT_ID,
          clientIdConfigured: !!process.env.ML_CLIENT_ID,
          clientSecretConfigured: !!process.env.ML_CLIENT_SECRET,
          redirectUriConfigured: !!process.env.ML_REDIRECT_URI,
        },
        supabase: {
          connected: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          urlConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          anonKeyConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          serviceRoleConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
        nextauth: {
          configured: !!process.env.NEXTAUTH_SECRET,
          urlConfigured: !!process.env.NEXTAUTH_URL,
        }
      },
      message: 'Merca Flow API is running successfully!'
    }

    return NextResponse.json(status, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'ERROR', 
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}