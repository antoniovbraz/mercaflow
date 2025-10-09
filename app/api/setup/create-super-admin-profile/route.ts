import { NextResponse } from 'next/server'
import { getCurrentUser, createClient } from '@/utils/supabase/server'

export async function POST() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const isSuperAdmin = user.email === 'peepers.shop@gmail.com' || user.email === 'antoniovbraz@gmail.com'
    
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: user.email === 'peepers.shop@gmail.com' ? 'Peepers Shop Admin' : 'Antonio Vinicius',
        avatar_url: user.user_metadata?.avatar_url || null
      }, { onConflict: 'id' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.redirect(new URL('/super-admin-setup', process.env.VERCEL_URL || 'http://localhost:3000'))
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}