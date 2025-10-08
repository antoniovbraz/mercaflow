# Guia de Deployment - Integração Mercado Livre

## 📋 Pré-requisitos

1. **Conta no Mercado Livre Developers**
   - Acesse: https://developers.mercadolivre.com.br/
   - Faça login com sua conta do Mercado Livre
   - Aceite os termos de desenvolvedor

2. **Projeto MercaFlow**
   - Código completo da integração ML
   - Supabase configurado e funcionando
   - Conta na Vercel ou outra plataforma de deploy

## 🔧 Configuração da Aplicação ML

### 1. Criar Aplicação no Mercado Livre

1. Acesse o [Painel do Desenvolvedor](https://developers.mercadolivre.com.br/console/)
2. Clique em "Criar aplicação"
3. Preencha os dados:
   - **Nome da aplicação**: MercaFlow
   - **Descrição**: Plataforma SaaS para integração com Mercado Livre
   - **Categoria**: E-commerce Tools
   - **Website**: https://seu-dominio.vercel.app
   - **Domínio de callbacks**: seu-dominio.vercel.app

### 2. Configurar URLs de Callback

Na seção "Configurações da aplicação":

- **URL de callback OAuth**: `https://seu-dominio.vercel.app/ml/callback`
- **URL de notificações (Webhooks)**: `https://seu-dominio.vercel.app/api/ml/webhooks/notifications`

### 3. Obter Credenciais

Após criar a aplicação, anote:
- **App ID (Client ID)**: Usado na variável `ML_CLIENT_ID`
- **Secret Key**: Usado na variável `ML_CLIENT_SECRET`

## 🌐 Configuração do Deployment

### Variáveis de Ambiente Obrigatórias

Adicione as seguintes variáveis na sua plataforma de deploy:

```env
# Mercado Livre API
ML_CLIENT_ID=6829614190686807
ML_CLIENT_SECRET=sua_secret_key_aqui

# Criptografia de Tokens (gere uma chave única)
ENCRYPTION_KEY=sua_chave_criptografia_256bits_aqui

# Supabase (já existentes)
NEXT_PUBLIC_SUPABASE_URL=sua_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Next.js
NEXT_PUBLIC_SITE_URL=https://seu-dominio.vercel.app
```

### Gerando a Chave de Criptografia

Execute no terminal para gerar uma chave segura:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python -c "import secrets; print(secrets.token_hex(32))"
```

## 🚀 Deploy na Vercel

### 1. Configurar Projeto

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Inicializar projeto
vercel

# Configurar variáveis de ambiente
vercel env add ML_CLIENT_ID
vercel env add ML_CLIENT_SECRET
vercel env add ENCRYPTION_KEY
```

### 2. Configurar vercel.json

```json
{
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/ml/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

### 3. Deploy

```bash
# Deploy de produção
vercel --prod

# Verificar deploy
vercel ls
```

## ⚙️ Configuração Pós-Deploy

### 1. Verificar Integração

1. Acesse `https://seu-dominio.vercel.app/dashboard/ml`
2. Clique em "Conectar ao Mercado Livre"
3. Autorize a aplicação
4. Verifique se o status mostra "Conectado"

### 2. Testar Endpoints

```bash
# Verificar status da integração
curl -X GET "https://seu-dominio.vercel.app/api/ml/integration/status" \
  -H "Authorization: Bearer seu_token_jwt"

# Listar produtos
curl -X GET "https://seu-dominio.vercel.app/api/ml/items" \
  -H "Authorization: Bearer seu_token_jwt"

# Listar pedidos
curl -X GET "https://seu-dominio.vercel.app/api/ml/orders" \
  -H "Authorization: Bearer seu_token_jwt"
```

### 3. Configurar Webhooks (Opcional)

Para receber notificações em tempo real:

1. Acesse o painel ML Developer
2. Vá para "Configurações" > "Webhooks"
3. Adicione: `https://seu-dominio.vercel.app/api/ml/webhooks/notifications`
4. Selecione os eventos:
   - `orders` - Mudanças em pedidos
   - `items` - Mudanças em produtos
   - `questions` - Novas perguntas

## 🔒 Segurança e Compliance

### Certificações Necessárias

1. **HTTPS Obrigatório**: Mercado Livre exige SSL/TLS
2. **Política de Privacidade**: Adicione link na aplicação ML
3. **Termos de Uso**: Documente o uso dos dados ML

### Boas Práticas

```typescript
// Rate limiting (implementar se necessário)
const rateLimit = {
  maxRequests: 1000,
  windowMs: 60 * 60 * 1000, // 1 hora
};

// Logs de auditoria (já implementado)
await logMLOperation({
  operation: 'get_orders',
  user_id: profile.id,
  success: true,
  timestamp: new Date(),
});

// Validação de dados
const validateMLResponse = (data: any) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid ML response');
  }
  return data;
};
```

## 🧪 Testes de Produção

### Checklist de Verificação

- [ ] OAuth flow completo funciona
- [ ] Tokens são renovados automaticamente
- [ ] Produtos são listados corretamente
- [ ] Pedidos são sincronizados
- [ ] Status da integração é preciso
- [ ] Logs de auditoria são criados
- [ ] Criptografia de tokens funciona
- [ ] Callbacks processam sem erro
- [ ] Rate limiting não é violado
- [ ] Webhooks recebem notificações

### Monitoramento

```bash
# Verificar logs da Vercel
vercel logs

# Monitorar uso da API ML
curl -X GET "https://api.mercadolibre.com/applications/6829614190686807" \
  -H "Authorization: Bearer seu_access_token"
```

## 📊 Métricas e Limites

### Limites da API Mercado Livre

- **Rate Limit**: 5,000 requests/hora por aplicação
- **Burst**: 100 requests/minuto
- **Token Expiry**: 6 horas (renovação automática)
- **Webhook Timeout**: 30 segundos

### Monitorar Performance

```sql
-- Query para verificar uso da integração
SELECT 
  DATE(created_at) as date,
  COUNT(*) as operations,
  COUNT(CASE WHEN success = false THEN 1 END) as errors
FROM ml_sync_logs 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 🆘 Troubleshooting

### Erros Comuns

1. **"Invalid redirect URI"**
   - Verificar configuração no painel ML
   - Confirmar HTTPS na URL de callback

2. **"Invalid client credentials"**
   - Verificar ML_CLIENT_ID e ML_CLIENT_SECRET
   - Confirmar se a aplicação está ativa

3. **"Token expired"**
   - Sistema renova automaticamente
   - Verificar logs de renovação

4. **"Rate limit exceeded"**
   - Implementar cache local
   - Otimizar número de requests

### Logs Importantes

```bash
# Verificar logs de token renewal
grep "Token renewed" /var/log/app.log

# Verificar erros de API
grep "ML API Error" /var/log/app.log

# Monitorar webhook processing
grep "Webhook processed" /var/log/app.log
```

## 📞 Suporte

### Recursos Oficiais

- **Documentação ML**: https://developers.mercadolivre.com.br/pt_br/api-docs
- **Fórum Developers**: https://developers.mercadolivre.com.br/forum
- **Status da API**: https://developers.mercadolivre.com.br/pt_br/status-da-api

### Contatos de Suporte

- **Suporte Técnico ML**: devs@mercadolibre.com
- **Documentação Interna**: `docs/pt/guias/integracao-ml.md`

---

✅ **Integração concluída com sucesso!** 

Sua plataforma MercaFlow agora possui integração completa com o Mercado Livre, incluindo OAuth 2.0, gerenciamento de produtos, pedidos e sistema de auditoria profissional.