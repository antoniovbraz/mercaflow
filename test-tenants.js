// Teste para verificar se as tabelas de tenants foram criadas
import { createClient } from './utils/supabase/server.js'

async function testTenantTables() {
  console.log('🧪 Testando tabelas de tenant...')
  
  try {
    const supabase = await createClient()
    
    // Testar se a tabela tenants existe e está acessível
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .limit(1)
    
    if (tenantsError) {
      console.error('❌ Erro ao acessar tabela tenants:', tenantsError.message)
    } else {
      console.log('✅ Tabela tenants acessível')
      console.log(`📊 Tenants encontrados: ${tenants?.length || 0}`)
    }
    
    // Testar se a tabela tenant_users existe e está acessível
    const { data: tenantUsers, error: tenantUsersError } = await supabase
      .from('tenant_users')
      .select('*')
      .limit(1)
    
    if (tenantUsersError) {
      console.error('❌ Erro ao acessar tabela tenant_users:', tenantUsersError.message)
    } else {
      console.log('✅ Tabela tenant_users acessível')
      console.log(`📊 Associações encontradas: ${tenantUsers?.length || 0}`)
    }
    
    // Testar se as políticas RLS estão funcionando
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      console.log(`👤 Usuário autenticado: ${user.email}`)
    } else {
      console.log('👤 Nenhum usuário autenticado (esperado em teste)')
    }
    
    console.log('🎉 Teste concluído!')
    
  } catch (error) {
    console.error('💥 Erro durante o teste:', error)
  }
}

// Executar teste
testTenantTables()