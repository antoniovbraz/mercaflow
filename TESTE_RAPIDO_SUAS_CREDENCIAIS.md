# 🔐 TESTE RÁPIDO - Suas Credenciais
## Execute estes passos para testar com autenticação

### OPÇÃO A: Método Manual (Mais Fácil) ⭐

**1. Faça login no browser:**
```
URL: https://mercaflow.vercel.app/login
Email: peepers.shop@gmail.com
Senha: vGBg9h2axG8Jt4H
```

**2. Capture o cookie:**
- Após login, pressione `F12` (DevTools)
- Vá em: `Application` → `Cookies` → `https://mercaflow.vercel.app`
- Procure o cookie chamado: `sb-access-token` ou similar
- Copie o valor (vai ser algo como: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

**3. Execute o teste:**
```powershell
.\test_with_cookie.ps1 -AccessToken "COLE_O_TOKEN_AQUI"
```

---

### OPÇÃO B: Teste Direto via Supabase Client

Vou criar um script Node.js que usa o mesmo método que o frontend:

**Execute:**
```powershell
node test_auth_supabase.js
```

---

### Por que não funcionou o método anterior?

O MercaFlow usa **Supabase Auth client-side**, não uma API REST de login própria.

O fluxo correto é:
1. ✅ Login via Supabase SDK (`signInWithPassword`)
2. ✅ Supabase retorna cookies de sessão automaticamente
3. ✅ Browser armazena cookies
4. ✅ Próximas requisições usam esses cookies

**Solução:** Usar o cookie do browser (Opção A acima)

---

## 🚀 Execute Agora:

```powershell
# 1. Abra o browser e faça login
start https://mercaflow.vercel.app/login

# 2. Depois de logar, copie o cookie do DevTools (F12)

# 3. Execute este comando com seu token:
.\test_with_cookie.ps1 -AccessToken "SEU_TOKEN_AQUI"
```

Aguardo você colar o token para testarmos! 🎯
