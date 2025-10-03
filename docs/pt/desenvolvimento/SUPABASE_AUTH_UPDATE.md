# 🔐 Sistema de Autenticação - Atualização para Padrões Supabase 2024

## 📋 Rotas de Confirmação de Email

O MercaFlow agora suporta **duas rotas** para confirmação de email, seguindo as melhores práticas:

### 1. `/auth/confirm` (Recomendada - Padrão Supabase)
- **Formato**: `token_hash` + `type`  
- **Método**: `supabase.auth.verifyOtp()`
- **URL exemplo**: `/auth/confirm?token_hash=ABC123&type=email`
- **Status**: ✅ Ativa e configurada

### 2. `/auth/callback` (Compatibilidade)
- **Formato**: `code` (legacy) ou `token_hash` + `type`
- **Método**: `supabase.auth.exchangeCodeForSession()` ou `verifyOtp()`
- **URL exemplo**: `/auth/callback?code=XYZ789`
- **Status**: ✅ Mantida para compatibilidade

## 🚀 Configuração no Dashboard Supabase

### Template de Email Recomendado

No [Dashboard do Supabase](https://supabase.com/dashboard/project/_/auth/templates) > Auth > Templates > **Confirm signup**:

```html
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

### URLs de Redirecionamento

No [Dashboard do Supabase](https://supabase.com/dashboard/project/_/auth/url-configuration) > Auth > URL Configuration:

- **Site URL**: `https://mercaflow.vercel.app`
- **Redirect URLs**: 
  - `https://mercaflow.vercel.app/auth/confirm`
  - `https://mercaflow.vercel.app/auth/callback` (compatibilidade)

## 🔧 Implementação Técnica

### Route Handler `/auth/confirm` (Padrão)

```typescript
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  if (token_hash && type) {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      redirect('/dashboard?message=Email%20confirmado%20com%20sucesso!')
    }
  }

  redirect('/login?message=Erro%20ao%20confirmar%20email.')
}
```

### Route Handler `/auth/callback` (Híbrido)

Suporta tanto o formato novo (`token_hash`) quanto o legacy (`code`):

```typescript
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | null
  const code = searchParams.get('code') // Legacy support

  if (token_hash && type) {
    // New format - using verifyOtp (recommended)
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    // Handle success/error...
  } else if (code) {
    // Legacy format - using exchangeCodeForSession
    const { error } = await supabase.auth.exchangeCodeForSession(code)  
    // Handle success/error...
  }
}
```

## 📧 Configuração de Signup

### Registro com Redirect Correto

```typescript
const { data, error } = await supabase.auth.signUp({
  email: email.toLowerCase().trim(),
  password,
  options: {
    data: { full_name: fullName.trim() },
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`
  }
})
```

### Reenvio de Confirmação

```typescript  
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: email.toLowerCase().trim(),
  options: {
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`
  }
})
```

## ✅ Vantagens da Implementação Atual

1. **Compatibilidade Total**: Suporta ambos os formatos
2. **Futuro-Proof**: Usa o método recomendado (`verifyOtp`)
3. **Backward Compatible**: Mantém suporte ao formato antigo
4. **Redundância**: Duas rotas funcionais para maior confiabilidade
5. **Documentação Oficial**: Segue exatamente os padrões Supabase

## 🔍 Como Testar

1. **Registro**: Vá para `/register` e crie uma conta
2. **Email**: Receba email com link no formato: `/auth/confirm?token_hash=...&type=email`
3. **Confirmação**: Clique no link e seja redirecionado para dashboard
4. **Fallback**: Se houver problemas, `/auth/callback` ainda funciona

## 📊 Status das Implementações

| Recurso | Status | Padrão Supabase | Implementado |
|---------|--------|-----------------|--------------|
| `/auth/confirm` | ✅ | ✅ Recomendado | ✅ Sim |
| `/auth/callback` | ✅ | ⚠️ Compatibilidade | ✅ Sim |
| `verifyOtp()` | ✅ | ✅ Recomendado | ✅ Sim |
| `exchangeCodeForSession()` | ✅ | ⚠️ Legacy | ✅ Sim |
| Template config | ✅ | ✅ Necessário | ⚠️ Manual |
| Redirect URLs | ✅ | ✅ Necessário | ⚠️ Manual |

## 🎯 Próximos Passos

1. **Configurar template** no dashboard Supabase (manual)
2. **Adicionar redirect URLs** no dashboard (manual)  
3. **Testar ambas as rotas** em produção
4. **Monitorar logs** para verificar qual rota é mais usada
5. **Deprecar `/auth/callback`** após transição completa (futuro)

---

**Atualização**: Outubro 2025 - Sistema otimizado seguindo documentação oficial Supabase
**Responsável**: Antonio Braz