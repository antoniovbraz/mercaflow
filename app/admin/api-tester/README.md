# 🧪 API Tester - Interface de Testes Interna

## O que é?

Uma página **dentro da aplicação** que permite testar todos os endpoints protegidos sem precisar usar scripts externos, Postman ou curl.

## Acesso

```
URL: https://mercaflow.vercel.app/admin/api-tester
Requisito: Login como super_admin
```

## Como Usar

### 1. Fazer Login

```
1. Acesse: https://mercaflow.vercel.app/login
2. Email: peepers.shop@gmail.com
3. Senha: vGBg9h2axG8Jt4H
```

### 2. Acessar API Tester

```
Navegue para: /admin/api-tester
Ou clique no menu: 🧪 API Tester
```

### 3. Testar APIs

**Opção A: Testar Todas**

- Clique no botão "🚀 Testar Todos"
- Aguarde execução sequencial
- Veja resultados em tempo real

**Opção B: Testar por Categoria**

- Clique em um dos cards:
  - Settings (2 endpoints)
  - Analytics (3 endpoints)
  - Dashboard (1 endpoint)
  - Mercado Livre (3 endpoints)

**Opção C: Filtrar Resultados**

- Todos: Mostra todos os testes
- Sucesso: Apenas respostas 200-299
- Erros: Apenas falhas (401, 403, 500, etc.)

## Endpoints Testados

### Settings (Configurações)

- ✅ GET /api/settings - Buscar configurações
- ✅ PUT /api/settings - Atualizar configurações

### Analytics (Análises)

- ✅ GET /api/analytics/elasticity?days=30
- ✅ GET /api/analytics/forecast?historical_days=30&forecast_days=7
- ✅ GET /api/analytics/competitors?limit=5

### Dashboard

- ✅ GET /api/dashboard/kpis

### Mercado Livre

- ✅ GET /api/ml/auth/status
- ✅ GET /api/ml/products
- ✅ GET /api/ml/orders

## Informações Exibidas

Para cada teste, você vê:

```
✓/✗ Status         | GET | 200 | 245ms
/api/settings
✓ Resposta recebida
{
  "success": true,
  "data": {
    "notifications_enabled": true,
    "auto_reprice": false,
    ...
  }
}
```

### Badges de Status

| Badge    | Significado            |
| -------- | ---------------------- |
| 🟢 200   | Sucesso                |
| 🟡 401   | Não autenticado        |
| 🟡 403   | Sem permissão (tenant) |
| 🔴 500   | Erro do servidor       |
| 🔴 ERROR | Falha de rede          |

## Vantagens

### ✅ Dentro da Aplicação

- Não precisa abrir Postman/Insomnia
- Não precisa copiar tokens manualmente
- Usa automaticamente sua sessão atual

### ✅ Visual e Intuitivo

- Interface amigável com shadcn/ui
- Resultados coloridos e organizados
- Filtragem por sucesso/erro

### ✅ Debugging Rápido

- Vê resposta completa (JSON)
- Tempo de resposta em ms
- Mensagens de erro claras

### ✅ Produção-Ready

- Funciona em dev e produção
- Protegido por autenticação
- Apenas super_admin pode acessar

## Casos de Uso

### 1. Validar Integração ML

```
1. Configure integração com Mercado Livre
2. Acesse /admin/api-tester
3. Teste categoria "Mercado Livre"
4. Veja se produtos/pedidos aparecem
```

### 2. Debugar Settings

```
1. Mude configurações em /dashboard/configuracoes
2. Teste GET /api/settings
3. Veja se valores foram salvos
4. Teste PUT /api/settings para alterar
```

### 3. Verificar Analytics

```
1. Após sincronizar produtos
2. Teste elasticity/forecast/competitors
3. Veja se tem dados suficientes
4. Identifique problemas de cálculo
```

### 4. Testar Após Deploy

```
1. Deploy nova versão
2. Login em produção
3. Teste todos endpoints
4. Valide que nada quebrou
```

## Troubleshooting

### Todos retornam 401

**Problema:** Não está autenticado
**Solução:** Faça login novamente em /login

### Todos retornam 403

**Problema:** Seu usuário não tem tenant
**Solução:** Verifique perfil no Supabase

### ML APIs retornam erro

**Problema:** Integração ML não configurada
**Solução:** Configure em /ml/auth

### Analytics sem dados

**Problema:** Produtos não sincronizados
**Solução:** Aguarde primeira sincronização (24h)

## Código

**Localização:** `app/admin/api-tester/page.tsx`

**Tecnologias:**

- React Client Component ("use client")
- shadcn/ui components (Button, Card, Badge, Tabs)
- Fetch API com cookies automáticos
- TypeScript com interfaces tipadas

## Segurança

✅ **Protegido por:**

- Layout admin (app/admin/layout.tsx)
- Verificação de super_admin
- Redirect se não autenticado

⚠️ **Nota:** Esta página NÃO deve ser removida em produção, pois:

- É útil para debug em prod
- Já está protegida por autenticação
- Apenas super_admin pode acessar

## Próximos Passos

### Melhorias Futuras

- [ ] Salvar histórico de testes
- [ ] Exportar resultados (JSON/CSV)
- [ ] Adicionar testes customizados
- [ ] Métricas de performance ao longo do tempo
- [ ] Alertas se APIs degradarem

### Extensões Possíveis

- [ ] Testar webhooks ML
- [ ] Simular payloads específicos
- [ ] Comparar ambientes (dev vs prod)
- [ ] Testes automatizados agendados

## Demo

### Resultado de Sucesso

```
✓ GET | 200 | 245ms
/api/settings
✓ Resposta recebida
{
  "success": true,
  "data": {
    "notifications_enabled": true,
    "auto_reprice": false,
    "min_margin": 15.5,
    "max_price_change": 10.0
  }
}
```

### Resultado de Erro

```
✗ GET | 401 | 123ms
/api/analytics/elasticity
❌ Not authenticated
```

## Conclusão

Agora você tem uma **interface visual completa** para testar APIs **sem sair da aplicação**!

**Acesse agora:**

1. Login: https://mercaflow.vercel.app/login
2. API Tester: https://mercaflow.vercel.app/admin/api-tester
3. Clique "Testar Todos" e veja a mágica! ✨
