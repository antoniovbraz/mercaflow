# Sistema de Autenticação MercaFlow - Guia Completo

## 📋 Visão Geral

O MercaFlow implementa um sistema de autenticação robusto usando Supabase Auth seguindo as melhores práticas da documentação oficial.

## 🔐 Fluxo de Autenticação

### 1. Cadastro de Usuário (Sign Up)

#### Como Funciona:
1. **Usuário preenche o formulário** em `/register`
2. **Validações são executadas**:
   - Campos obrigatórios (nome, email, senha)
   - Formato de email válido
   - Senha com mínimo 6 caracteres
3. **Supabase cria o usuário** mas não autentica imediatamente
4. **Email de confirmação é enviado**
5. **Usuário vê mensagem de sucesso** com instruções

#### Configuração no Supabase:
- **Email Confirmation**: Habilitado (padrão em produção)
- **Redirect URL**: `https://mercaflow.vercel.app/auth/callback`
- **Email Templates**: Configurados para português

### 2. Confirmação de Email

#### Como Funciona:
1. **Usuário recebe email** com link de confirmação
2. **Clica no link** que direciona para `/auth/callback`
3. **Sistema processa o código** de confirmação
4. **Usuário é redirecionado** para dashboard com mensagem de sucesso

#### Tratamento de Erros:
- Link inválido ou expirado
- Código de confirmação inválido
- Falhas na troca de código por sessão

### 3. Login de Usuário (Sign In)

#### Como Funciona:
1. **Usuário insere email/senha** em `/login`
2. **Sistema valida credenciais** no Supabase
3. **Verifica se email foi confirmado**
4. **Autentica e redireciona** para dashboard

#### Tratamento de Erros Específicos:
- `Invalid login credentials` → "Email ou senha incorretos"
- `Email not confirmed` → "Email ainda não foi confirmado" + link para reenvio
- `Too many requests` → "Muitas tentativas, aguarde"

### 4. Reenvio de Confirmação

#### Quando Usar:
- Usuário não recebeu email inicial
- Email foi perdido ou excluído
- Link de confirmação expirou

#### Como Funciona:
1. **Usuário acessa** `/auth/resend`
2. **Insere email da conta**
3. **Sistema reenvia** email de confirmação
4. **Novo email é enviado** com link válido

## 🛠️ Implementação Técnica

### Estrutura de Arquivos

```
app/
├── register/
│   └── page.tsx          # Página de cadastro
├── login/
│   └── page.tsx          # Página de login
└── auth/
    ├── callback/
    │   └── route.ts       # Processa confirmação de email
    └── resend/
        └── page.tsx       # Reenvio de confirmação
```

### Server Actions

Todas as ações de autenticação são implementadas como Server Actions para:
- **Segurança**: Execução no servidor
- **Performance**: Redução de JavaScript no cliente
- **SEO**: Melhor indexação

### Configurações Importantes

```typescript
// Configuração do signup
const { data, error } = await supabase.auth.signUp({
  email: email.toLowerCase().trim(),
  password,
  options: {
    data: { full_name: fullName.trim() },
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
  }
})
```

### Tratamento de Estados

```typescript
// Verifica se precisa confirmar email
if (data.user && !data.session) {
  // Email confirmation necessário
  redirect('/register?message=Conta criada! Verifique seu email...')
} else if (data.session) {
  // Autenticado imediatamente (email confirmation OFF)
  redirect('/dashboard?message=Login realizado com sucesso!')
}
```

## 🎨 Interface do Usuário

### Feedback Visual

- **Mensagens de Sucesso**: Fundo verde, ícone de sucesso
- **Mensagens de Erro**: Fundo vermelho, ícone de alerta
- **Mensagens Informativas**: Fundo azul, ícone de informação

### Instruções Contextuais

- **Na página de registro**: Passos do processo
- **Na página de login**: Links para recuperação
- **Tratamento de erros**: Sugestões de ação

## 🔍 Debugging e Monitoramento

### Páginas de Teste (Remover em Produção)

- `/env-debug` - Verificar variáveis de ambiente
- `/supabase-test` - Testar conexão com Supabase

### Logs Importantes

```typescript
console.log('Attempting signup for email:', email)
console.error('Supabase signup error:', error)
console.log('Signup successful:', data)
```

## 🚀 Configuração de Produção

### Variáveis de Ambiente

```bash
NEXT_PUBLIC_SUPABASE_URL=https://projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_SITE_URL=https://mercaflow.vercel.app
```

### Configurações no Dashboard Supabase

1. **Authentication → Providers → Email**:
   - ✅ Enable email confirmations
   - ✅ Enable sign ups

2. **Authentication → URL Configuration**:
   - Site URL: `https://mercaflow.vercel.app`
   - Redirect URLs: `https://mercaflow.vercel.app/auth/callback`

3. **Authentication → Email Templates**:
   - Personalizar templates em português
   - Configurar SMTP personalizado (recomendado)

## 📊 Métricas e Performance

### Rate Limits Padrão

- **Email sending**: 2 emails/hora (desenvolvimento)
- **Auth requests**: 100 requests/minuto/IP
- **Signup**: 5 tentativas/minuto/IP

### Recomendações de Produção

1. **Configure SMTP personalizado** para melhor deliverability
2. **Monitore métricas** de autenticação no dashboard
3. **Configure alertas** para falhas de autenticação
4. **Implemente CAPTCHA** se necessário

## 🔗 Links Úteis

- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Email Configuration](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Rate Limits](https://supabase.com/docs/guides/auth/rate-limits)
- [Error Codes](https://supabase.com/docs/guides/auth/debugging/error-codes)

## ✅ Checklist de Funcionamento

- [ ] Cadastro cria usuário sem autenticar
- [ ] Email de confirmação é enviado
- [ ] Link de confirmação autentica usuário
- [ ] Login funciona após confirmação
- [ ] Reenvio de email funciona
- [ ] Tratamento de erros está funcionando
- [ ] Mensagens em português estão corretas
- [ ] UI/UX está intuitiva
- [ ] Redirects estão corretos
- [ ] Rate limits estão respeitados

---

**Status**: ✅ Sistema implementado seguindo melhores práticas do Supabase
**Última atualização**: Outubro 2025
**Responsável**: Antonio Braz