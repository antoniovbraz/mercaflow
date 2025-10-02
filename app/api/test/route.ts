import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Verificar se super admin foi criado
    let superAdminCheck = null
    
    try {
      const { data: superAdmin, error: superAdminError } = await supabaseAdmin
        .from('platform_owners')
        .select('email, role, personal_tenant_enabled')
        .eq('email', 'peepers.shop@gmail.com')
        .single()

      superAdminCheck = {
        exists: !!superAdmin,
        email: superAdmin?.email,
        role: superAdmin?.role,
        personalTenantEnabled: superAdmin?.personal_tenant_enabled,
        error: superAdminError?.message
      }

    } catch (dbError) {
      superAdminCheck = { error: `Database connection failed: ${dbError}` }
    }

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
      database: {
        superAdmin: superAdminCheck
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