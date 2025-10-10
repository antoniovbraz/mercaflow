import { NextResponse } from 'next/server'
import { getCurrentUser, createClient } from '@/utils/supabase/server'

export async function POST() {
  // PROTEÇÃO: Bloquear em produção
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Setup endpoints are disabled in production' },
      { status: 403 }
    );
  }

  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verificar se é super admin email
    const isSuperAdmin = user.email === 'peepers.shop@gmail.com' || user.email === 'antoniovbraz@gmail.com'
    
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const supabase = await createClient()

    // Criar profile super admin completo
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: user.email === 'peepers.shop@gmail.com' ? 'Peepers Shop Admin' : 'Antonio Vinicius',
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating super admin profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to create profile: ' + profileError.message },
        { status: 500 }
      )
    }

    // Atribuir role super_admin
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: user.id,
        role: 'super_admin',
        created_by: user.id,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,role'
      })

    if (roleError) {
      console.error('Error assigning super admin role:', roleError)
      return NextResponse.json(
        { error: 'Failed to assign role: ' + roleError.message },
        { status: 500 }
      )
    }

    return NextResponse.redirect(new URL('/super-admin-setup?success=complete', process.env.VERCEL_URL || 'http://localhost:3000'))
  } catch (error) {
    console.error('Error in complete setup:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}