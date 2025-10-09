# 🚀 Deploy de Correção - Vercel Environment Variables

## 🔍 Problema Identificado

A URL ainda está incorreta em produção porque o **Vercel usa suas próprias variáveis de ambiente**, não os arquivos `.env` do repositório.

## 📋 Ação Necessária: Atualizar Variáveis no Vercel

### 1. Acessar o Painel Vercel

1. **Acesse**: https://vercel.com/dashboard
2. **Encontre o projeto**: `mercaflow`
3. **Clique em Settings**
4. **Vá para Environment Variables**

### 2. Atualizar ML_REDIRECT_URI

Procure a variável `ML_REDIRECT_URI` e atualize:

```bash
# VALOR ATUAL (❌ ERRADO)
https://mercaflow.vercel.app/ml/callback

# NOVO VALOR (✅ CORRETO)  
https://mercaflow.vercel.app/api/ml/auth/callback
```

### 3. Fazer Redeploy

Após atualizar a variável:
1. **Vá para Deployments**
2. **Clique nos três pontos** do deploy mais recente
3. **Escolha "Redeploy"**
4. **Aguarde o deploy terminar**

## 🔄 Alternativa Rápida: Deploy via CLI

Se preferir, faça um pequeno commit para forçar novo deploy:

```bash
git add CORRECAO_CALLBACK_ML.md
git commit -m "docs: adiciona documentação de correção ML callback"
git push origin main
```

## ✅ Como Testar Após Deploy

1. **Aguarde 2-3 minutos** para o deploy completar
2. **Acesse**: https://mercaflow.vercel.app/dashboard
3. **Clique em "Conectar Mercado Livre"**
4. **Verifique se a URL contém**: `/api/ml/auth/callback`

## 📍 Resumo das URLs Corretas

### Desenvolvimento (Local)
```bash
# Já funcionando ✅
http://localhost:3000/api/ml/auth/callback
```

### Produção (Vercel)  
```bash
# Precisa atualizar no painel Vercel
https://mercaflow.vercel.app/api/ml/auth/callback
```

## 🎯 Próximos Passos

1. [ ] Atualizar `ML_REDIRECT_URI` no Vercel
2. [ ] Fazer redeploy
3. [ ] Testar conexão ML em produção
4. [ ] Limpar URLs antigas do painel Mercado Livre

Após completar estes passos, a integração deve funcionar em ambos os ambientes! 🚀