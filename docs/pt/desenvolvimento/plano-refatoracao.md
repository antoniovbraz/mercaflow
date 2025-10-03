# 🔄 MERCA FLOW - PLANO DE REFATORAÇÃO COMPLETA

## 📋 PROBLEMAS IDENTIFICADOS (baseado na documentação oficial do Supabase)

### ❌ Problemas Críticos:
1. **Arquitetura Antiga**: Usando Context personalizado em vez de @supabase/ssr
2. **Auth Hook Ausente**: Não usa Custom Access Token Hook para roles no JWT  
3. **RLS Bloqueando**: platform_owners query sendo bloqueada por policies
4. **Client/Server Mismatch**: Não segue padrões Server-Side Auth oficiais
5. **Refresh Instável**: Context gerenciando estado que deveria ser do servidor

## 🎯 SOLUÇÃO: SEGUIR BEST PRACTICES OFICIAIS

### FASE 1: MIGRAR PARA @supabase/ssr (30-45 min)
- [ ] Instalar @supabase/ssr
- [ ] Criar utils/supabase/client.ts (browser client)
- [ ] Criar utils/supabase/server.ts (server client)  
- [ ] Criar utils/supabase/middleware.ts
- [ ] Atualizar middleware.ts root
- [ ] Remover AuthContext antigo

### FASE 2: IMPLEMENTAR CUSTOM CLAIMS (20-30 min)
- [ ] Criar tabela user_roles (seguindo padrão oficial)
- [ ] Implementar Custom Access Token Auth Hook
- [ ] Configurar hook no dashboard Supabase
- [ ] Testar JWT com claims

### FASE 3: CORRIGIR RLS POLICIES (15-20 min)
- [ ] Implementar função authorize() oficial
- [ ] Corrigir policies platform_owners
- [ ] Testar acesso com roles

### FASE 4: ATUALIZAR FRONTEND (20-30 min)
- [ ] Usar Server Components para auth
- [ ] Implementar padrão getUser() oficial
- [ ] Remover refreshUserData manual
- [ ] Testar fluxo completo

## 🚀 VANTAGENS DA REFATORAÇÃO:
- ✅ Padrão oficial do Supabase
- ✅ Melhor performance (Server-Side)
- ✅ Refresh automático e estável
- ✅ Roles no JWT (não precisa query)
- ✅ RLS policies corretas
- ✅ Preparado para produção

## ⏱️ TEMPO ESTIMADO: 1.5-2 horas
## 🎯 RESULTADO: Sistema robusto seguindo best practices

---

**PERGUNTA**: Quer que eu implemente essa refatoração completa?
Ou prefere continuar fazendo "band-aids" no sistema atual?