import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For this admin operation, we'll use the public client and SQL functions
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function promoteToSuperAdmin() {
  const targetEmail = 'peepers.shop@gmail.com'
  
  console.log('🔍 Verificando usuário:', targetEmail)
  
  // 1. Find user by email
  const { data: users, error: userError } = await supabase.auth.admin.listUsers()
  
  if (userError) {
    console.error('❌ Erro ao buscar usuários:', userError)
    return
  }
  
  const user = users?.users?.find(u => u.email === targetEmail)
  
  if (!user) {
    console.log('❌ Usuário não encontrado:', targetEmail)
    return
  }
  
  console.log('✅ Usuário encontrado:', user.id)
  console.log('📧 Email confirmado:', user.email_confirmed_at ? 'Sim' : 'Não')
  
  // 2. Check existing profile
  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (profileError && profileError.code !== 'PGRST116') {
    console.error('❌ Erro ao verificar profile:', profileError)
    return
  }
  
  if (existingProfile) {
    console.log('📋 Profile existente encontrado, role atual:', existingProfile.role)
    
    // Update existing profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: 'super_admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    if (updateError) {
      console.error('❌ Erro ao atualizar profile:', updateError)
      return
    }
    
    console.log('✅ Profile atualizado para super_admin!')
  } else {
    console.log('📝 Profile não existe, criando...')
    
    // Create new profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        role: 'super_admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (insertError) {
      console.error('❌ Erro ao criar profile:', insertError)
      return
    }
    
    console.log('✅ Profile de super_admin criado!')
  }
  
  // 3. Verify promotion
  const { data: updatedProfile, error: verifyError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (verifyError) {
    console.error('❌ Erro ao verificar promoção:', verifyError)
    return
  }
  
  console.log('\n🎉 PROMOÇÃO CONCLUÍDA!')
  console.log('📧 Email:', targetEmail)
  console.log('🆔 User ID:', user.id)
  console.log('👑 Role:', updatedProfile.role)
  console.log('📅 Profile criado:', updatedProfile.created_at)
  console.log('🔄 Última atualização:', updatedProfile.updated_at)
  
  console.log('\n💡 Instruções:')
  console.log('1. Faça logout do sistema')
  console.log('2. Faça login novamente com', targetEmail)
  console.log('3. Acesse /dashboard para ver o painel de super admin')
  console.log('4. Use o botão "Acessar Admin" para entrar no painel administrativo')
}

// Run the promotion
promoteToSuperAdmin().catch(console.error)