import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔧 Starting super admin fix...')

    // Inserir ou atualizar ambos emails como super admin
    const emails = ['peepers.shop@gmail.com', 'antoniovbraz@gmail.com']
    
    for (const email of emails) {
      const { data, error } = await supabaseAdmin
        .from('platform_owners')
        .upsert({
          email,
          role: 'super_admin',
          personal_tenant_enabled: true,
          personal_tenant_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        })

      if (error) {
        console.error(`❌ Error upserting ${email}:`, error)
      } else {
        console.log(`✅ Upserted super admin: ${email}`)
      }
    }

    // Verificar se foram inseridos
    const { data: allPlatformOwners, error: selectError } = await supabaseAdmin
      .from('platform_owners')
      .select('*')
      .in('email', emails)

    if (selectError) {
      console.error('❌ Error selecting platform owners:', selectError)
      return NextResponse.json({ error: selectError.message }, { status: 500 })
    }

    console.log('📋 Current platform owners:', allPlatformOwners)

    return NextResponse.json({
      success: true,
      message: 'Super admin accounts created/updated',
      platformOwners: allPlatformOwners
    })

  } catch (error) {
    console.error('❌ Super admin fix error:', error)
    return NextResponse.json({ 
      error: 'Failed to fix super admin',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET route para verificar status
export async function GET() {
  try {
    const { data: platformOwners, error } = await supabaseAdmin
      .from('platform_owners')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      platformOwners,
      count: platformOwners?.length || 0
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to get platform owners',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}