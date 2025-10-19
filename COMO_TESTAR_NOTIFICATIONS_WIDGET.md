# Como Testar o NotificationsWidget

**Arquivo**: `components/dashboard/NotificationsWidget.tsx`  
**Endpoint**: `/api/notifications`  
**Página**: `/dashboard`

---

## 🚀 Passo a Passo

### 1. Iniciar o Servidor

```powershell
# PowerShell (Windows)
npm run dev
```

Aguarde até ver:
```
▲ Next.js 15.5.4
- Local:        http://localhost:3000
✓ Ready in 2.5s
```

### 2. Fazer Login

1. Abra `http://localhost:3000/login`
2. Faça login com suas credenciais
3. Será redirecionado para `/dashboard`

### 3. Visualizar o Widget

O NotificationsWidget aparecerá **logo após as stats cards** no dashboard.

**Localização visual**:
```
┌─────────────────────────────────────┐
│ DashboardStats (cards de métricas)  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 🔔 Central de Notificações          │ ← AQUI!
│                                     │
│ [Perguntas] [Pedidos] [Alertas]    │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Main Action Cards (ML, Produtos...) │
└─────────────────────────────────────┘
```

---

## 🧪 Cenários de Teste

### Cenário 1: Sem Integração ML
**Estado esperado**: Widget mostra zeros

**Visual**:
```
🔔 Central de Notificações               [0]

💬 Perguntas Não Respondidas       Nenhum →
🛍️ Pedidos Pendentes                Nenhum →
⚠️ Alertas de Anomalias             Nenhum →

       ✓ Tudo em dia! 🎉
   Não há pendências no momento
```

**Como testar**:
- Faça login com usuário sem integração ML ativa
- Widget deve aparecer com todas as contagens zeradas
- Mensagem "Tudo em dia!" deve estar visível

---

### Cenário 2: Com Perguntas Pendentes (< 5)
**Estado esperado**: Badge normal (azul)

**Visual**:
```
🔔 Central de Notificações               [2]

💬 Perguntas Não Respondidas         [2] →
🛍️ Pedidos Pendentes                Nenhum →
⚠️ Alertas de Anomalias             Nenhum →
```

**Como testar**:
1. Certifique-se de ter perguntas com `status = 'UNANSWERED'` na tabela `ml_questions`
2. Quantidade deve ser < 5 para não ativar alerta urgente
3. Badge azul normal sem animação

---

### Cenário 3: Muitas Perguntas (>5) - URGENTE
**Estado esperado**: Badge vermelho piscando

**Visual**:
```
🔔 Central de Notificações               [8]

💬 Perguntas Não Respondidas  🔴URGENTE [8] → (piscando)
🛍️ Pedidos Pendentes                Nenhum →
⚠️ Alertas de Anomalias             Nenhum →

⚠️ 1 item urgente
   Requer atenção imediata
```

**Como testar**:
1. Insira >5 perguntas não respondidas no banco
2. Badge deve ficar vermelho
3. Texto "URGENTE" deve piscar (animate-pulse)
4. Card vermelho de urgência aparece no final

---

### Cenário 4: Muitos Pedidos (>10) - URGENTE
**Estado esperado**: Badge vermelho piscando

**Visual**:
```
🔔 Central de Notificações               [15]

💬 Perguntas Não Respondidas       Nenhum →
🛍️ Pedidos Pendentes        🔴URGENTE [15] → (piscando)
⚠️ Alertas de Anomalias             Nenhum →

⚠️ 1 item urgente
   Requer atenção imediata
```

**Como testar**:
1. Insira >10 pedidos com status pendente no banco
2. Status válidos: 'confirmed', 'payment_required', 'paid', 'ready_to_ship'
3. Badge verde se torna vermelho urgente

---

### Cenário 5: Estado de Loading
**Estado esperado**: 3 skeleton bars animados

**Visual**:
```
🔔 Central de Notificações

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ (animado)
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ (animado)
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ (animado)
```

**Como testar**:
1. Abra DevTools (F12)
2. Network tab → Throttling → "Slow 3G"
3. Recarregue a página
4. Observe skeletons aparecerem antes dos dados

---

### Cenário 6: Estado de Erro
**Estado esperado**: Ícone de erro + botão retry

**Visual**:
```
🔔 Central de Notificações

       ⚠️
  Erro ao carregar notificações

    [Tentar novamente]
```

**Como testar**:
1. Pare o servidor Supabase (se local)
2. Ou modifique temporariamente o endpoint para URL inválida
3. Recarregue a página
4. Botão "Tentar novamente" deve aparecer

---

### Cenário 7: Auto-refresh
**Estado esperado**: Dados atualizados a cada 2 minutos

**Como testar**:
1. Abra o dashboard
2. Abra o console do navegador (F12)
3. Observe logs: "🔍 ML Questions GET request received" a cada 2 minutos
4. Ou clique no botão "Atualizar agora" no footer

---

### Cenário 8: Cache Redis
**Estado esperado**: Primeira chamada demora mais, próximas instantâneas

**Como testar**:
1. Abra DevTools → Network tab
2. Recarregue a página (primeira chamada)
3. Observe tempo de resposta (ex: 150ms)
4. Recarregue novamente dentro de 1 minuto (cache hit)
5. Tempo deve ser <20ms (dados servidos do Redis)

---

## 🔍 Debug no Console

### Verificar Requisição
```javascript
// Console do navegador
fetch('/api/notifications')
  .then(r => r.json())
  .then(console.log)
```

**Resposta esperada**:
```json
{
  "success": true,
  "data": {
    "unansweredQuestions": 2,
    "pendingOrders": 1,
    "alerts": 0,
    "urgentCount": 0
  }
}
```

### Verificar Erros
```javascript
// Se houver erro na API
{
  "error": "Failed to fetch notifications",
  "details": "Tenant not found"
}
```

---

## 📊 Testar Backend Diretamente

### PowerShell (Windows)
```powershell
# Com autenticação (cookie necessário)
Invoke-WebRequest -Uri http://localhost:3000/api/notifications `
  -Method GET `
  -Headers @{"Cookie"="sb-access-token=YOUR_TOKEN"} | 
  Select-Object -Expand Content | 
  ConvertFrom-Json | 
  ConvertTo-Json -Depth 10
```

### cURL (Git Bash/WSL)
```bash
curl -X GET http://localhost:3000/api/notifications \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  | jq '.'
```

---

## 🗄️ Verificar Dados no Banco

### Via Supabase Studio
```sql
-- Contar perguntas não respondidas
SELECT COUNT(*) as unanswered_count
FROM ml_questions
WHERE status = 'UNANSWERED';

-- Contar pedidos pendentes
SELECT COUNT(*) as pending_count
FROM ml_orders
WHERE status IN ('confirmed', 'payment_required', 'paid', 'ready_to_ship');
```

### Via SQL Editor (local)
```bash
npx supabase db sql
```

```sql
-- Ver todas as perguntas
SELECT id, ml_question_id, status, text
FROM ml_questions
LIMIT 10;

-- Ver todos os pedidos
SELECT id, ml_order_id, status, total_amount
FROM ml_orders
LIMIT 10;
```

---

## ✅ Checklist de Validação

### Visual
- [ ] Widget aparece no dashboard após DashboardStats
- [ ] Header com gradiente azul-indigo
- [ ] Ícone Bell (🔔) visível
- [ ] Badge de contagem total no header
- [ ] 3 itens de notificação visíveis
- [ ] Ícones corretos (MessageCircle, ShoppingBag, AlertTriangle)
- [ ] Links funcionando (/ml/questions, /pedidos, /dashboard)

### Funcional
- [ ] Contagem de perguntas correta
- [ ] Contagem de pedidos correta
- [ ] Badge urgente aparece quando >5 perguntas
- [ ] Badge urgente aparece quando >10 pedidos
- [ ] Auto-refresh funciona (2 minutos)
- [ ] Botão "Atualizar agora" funciona
- [ ] Estado de loading aparece
- [ ] Estado de erro aparece (se API falhar)
- [ ] Estado vazio aparece (sem notificações)

### Performance
- [ ] Cache Redis funciona (resposta <20ms após primeira chamada)
- [ ] Queries otimizadas (count-only, sem fetch de dados)
- [ ] Sem memory leaks (useEffect cleanup correto)
- [ ] Auto-refresh não sobrecarrega servidor

### TypeScript
- [ ] `npm run type-check` passa sem erros
- [ ] Nenhum erro no console do navegador
- [ ] Nenhum warning no terminal de desenvolvimento

---

## 🐛 Troubleshooting

### Widget não aparece
**Causa**: Import ou posicionamento incorreto

**Solução**:
```tsx
// Verificar em app/dashboard/page.tsx
import { NotificationsWidget } from "@/components/dashboard/NotificationsWidget";

// Deve estar após DashboardStats
<DashboardStats />
<div className="mb-8">
  <NotificationsWidget />
</div>
```

---

### Contagem sempre zero
**Causa 1**: Sem integração ML ativa

**Solução**:
```sql
-- Verificar integrações
SELECT * FROM ml_integrations WHERE status = 'active';
```

**Causa 2**: Sem dados nas tabelas

**Solução**:
```sql
-- Inserir dados de teste
INSERT INTO ml_questions (integration_id, ml_question_id, ml_item_id, status, text, date_created, ml_data)
VALUES (
  'UUID_DA_INTEGRACAO',
  123456,
  'MLB123',
  'UNANSWERED',
  'Quanto tempo demora a entrega?',
  NOW(),
  '{}'::jsonb
);
```

---

### Cache não funciona
**Causa**: Redis não configurado

**Solução**:
1. Verificar `UPSTASH_REDIS_REST_URL` em `.env.local`
2. Se não tiver Redis, o código funciona em "degraded mode" (sem cache)
3. Cache é opcional mas recomendado

---

### Erro 401 Unauthorized
**Causa**: Não autenticado

**Solução**:
1. Fazer login primeiro em `/login`
2. Verificar cookie `sb-access-token` existe
3. Token não expirado

---

### Erro 400 Tenant not found
**Causa**: Perfil do usuário sem `tenant_id`

**Solução**:
```sql
-- Verificar perfil
SELECT id, tenant_id, role FROM profiles WHERE id = 'USER_ID';

-- Se tenant_id for NULL, atualizar:
UPDATE profiles SET tenant_id = id WHERE tenant_id IS NULL;
```

---

## 📝 Notas Importantes

### Cache Redis
- TTL: 1 minuto
- Key format: `dashboard:notifications:{tenantId}`
- Opcional (funciona sem Redis em degraded mode)

### Auto-refresh
- Intervalo: 2 minutos (120000ms)
- Cleanup automático ao desmontar component
- Não sobrecarrega servidor (cache + TTL)

### Badges Urgentes
- >5 perguntas = urgente
- >10 pedidos = urgente
- Qualquer alerta = urgente (sempre)

### Performance
- Count-only queries (rápido!)
- Usa indexes existentes
- Cache reduz DB load em 60x

---

**Happy Testing!** 🚀

Se tudo funcionar conforme esperado, a Fase 1 está oficialmente 100% completa! ✅✅✅
