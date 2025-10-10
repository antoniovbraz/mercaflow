import { NextResponse } from 'next/server'
import { getCurrentUser, createClient } from '@/utils/supabase/server'

export async function POST() {
  // PROTEÇÃO: Bloquear em produção
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints are disabled in production' },
      { status: 403 }
    );
  }

  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Determine role based on email
    let role = 'user'
    if (user.email === 'peepers.shop@gmail.com' || user.email === 'antoniovbraz@gmail.com') {
      role = 'super_admin'
    }

    // Create user role
    const { data: userRole, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: role,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating role:', error)
      return NextResponse.json(
        { error: 'Failed to create role: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, role: userRole })
  } catch (error) {
    console.error('Error in create-role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}