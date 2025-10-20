# 🔍 AUDITORIA COMPLETA: MercaFlow vs API Oficial Mercado Livre

**Data**: 19 de Outubro de 2025  
**Versão**: 1.0  
**Escopo**: Comparação total entre implementação atual e documentação oficial da API ML

---

## 📋 SUMÁRIO EXECUTIVO

### Status Geral: ⚠️ **NECESSITA CORREÇÕES CRÍTICAS**

| Categoria | Status | Criticidade | Ações Necessárias |
|-----------|--------|-------------|-------------------|
| **Products/Items** | 🟡 PARCIAL | MÉDIA | Corrigir multiget, adicionar filtros |
| **Orders** | 🟡 PARCIAL | ALTA | Adicionar filtros, packs, discounts |
| **Questions** | 🔴 INCORRETO | CRÍTICA | Mudar para API v4, endpoint correto |
| **Webhooks** | 🟡 PARCIAL | ALTA | Adicionar topics, melhorar resposta |
| **OAuth/Tokens** | 🟢 OK | BAIXA | Otimizações menores |
| **Messages** | 🔴 AUSENTE | MÉDIA | Implementar do zero |

### Métricas de Conformidade

```
✅ Correto e Completo:     20%
🟡 Parcial/Incompleto:     50%
🔴 Incorreto/Ausente:      30%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total de Endpoints:        12
Implementados:             8
Com Problemas:             6
Faltando:                  4
```

---

## 1️⃣ PRODUCTS/ITEMS API

### 📚 Documentação Oficial

**Base URL**: `https://api.mercadolibre.com`

#### Endpoints Principais

| Método | Endpoint | Descrição | Implementado |
|--------|----------|-----------|--------------|
| GET | `/users/{user_id}/items/search` | Lista IDs dos itens | ✅ SIM |
| GET | `/items?ids=ID1,ID2,...` | Multiget (até 20) | ⚠️ PARCIAL |
| GET | `/items/{item_id}` | Detalhes do item | ✅ SIM |
| POST | `/items` | Criar item | ❌ NÃO |
| PUT | `/items/{item_id}` | Atualizar item | ❌ NÃO |
| PUT | `/items/{item_id}/status` | Pausar/ativar | ❌ NÃO |

### 🔍 Análise da Implementação Atual

#### ✅ O que está CORRETO:

```typescript
// ✅ BOM: Usa endpoint correto para listar IDs
GET /users/${userId}/items/search?offset=${offset}&limit=${limit}
// Retorna: { results: ["MLB123", "MLB456"], paging: {...} }

// ✅ BOM: Implementa paginação
while (hasMore) {
  const response = await fetch(`/users/${userId}/items/search?offset=${offset}&limit=${limit}`);
  allProductIds.push(...data.results);
  offset += limit;
  hasMore = data.paging.offset + data.paging.limit < data.paging.total;
}
```

#### ⚠️ O que está INCOMPLETO:

```typescript
// ⚠️ PROBLEMA 1: Multiget não usa todos os campos disponíveis
// ATUAL:
const response = await fetch(`/items?ids=${itemIds.join(',')}`);

// OFICIAL ML: Multiget suporta atributos específicos
const response = await fetch(
  `/items?ids=${itemIds.join(',')}&attributes=id,title,price,status,pictures,variations`
);
```

```typescript
// ⚠️ PROBLEMA 2: Não usa filtros disponíveis no /search
// DISPONÍVEL NA ML:
GET /users/{user_id}/items/search?status=active
GET /users/{user_id}/items/search?listing_type_id=gold_pro
GET /users/{user_id}/items/search?orders=last_updated_desc
GET /users/{user_id}/items/search?sku={SELLER_CUSTOM_FIELD}
GET /users/{user_id}/items/search?seller_sku={SELLER_SKU}
GET /users/{user_id}/items/search?missing_product_identifiers=true

// IMPLEMENTAÇÃO ATUAL: Não usa nenhum filtro!
```

#### 🔴 O que está INCORRETO/AUSENTE:

```typescript
// ❌ AUSENTE: Busca por mais de 1000 itens (scroll)
// OFICIAL ML: Para mais de 1000 resultados, usar search_type=scan
GET /users/{user_id}/items/search?search_type=scan
// Retorna scroll_id para continuar paginação

// ❌ AUSENTE: CRUD de produtos
// POST /items - Criar novo produto
// PUT /items/{item_id} - Atualizar produto  
// PUT /items/{item_id}/status - Pausar/ativar

// ❌ AUSENTE: Busca na plataforma (listings públicas)
// GET /sites/{site_id}/search?seller_id={SELLER_ID}
// GET /sites/{site_id}/search?nickname={NICKNAME}
```

### 🎯 Recomendações - PRODUCTS

#### 🔴 CRÍTICO (Fazer Agora)

1. **Implementar scroll para + 1000 produtos**
   ```typescript
   // Se total > 1000, usar search_type=scan
   if (data.paging.total > 1000) {
     const response = await fetch(
       `/users/${userId}/items/search?search_type=scan`
     );
     const scrollId = data.scroll_id;
     // Continuar com scroll_id...
   }
   ```

2. **Adicionar filtros no endpoint de sincronização**
   ```typescript
   // Permitir sync filtrado por status, tipo, etc.
   async function syncProducts(filters: {
     status?: 'active' | 'paused' | 'closed';
     listing_type_id?: string;
     orders?: string;
   }) {
     const params = new URLSearchParams(filters);
     const response = await fetch(
       `/users/${userId}/items/search?${params}`
     );
   }
   ```

#### 🟡 IMPORTANTE (Próximos Sprint)

3. **Otimizar multiget com seleção de campos**
   ```typescript
   // Reduz tamanho da resposta
   const essentialFields = 'id,title,price,status,available_quantity,thumbnail';
   const response = await fetch(
     `/items?ids=${ids.join(',')}&attributes=${essentialFields}`
   );
   ```

4. **Implementar CRUD de produtos**
   ```typescript
   // POST /api/ml/items - Criar produto
   // PUT /api/ml/items/{id} - Atualizar
   // PUT /api/ml/items/{id}/status - Pausar/ativar
   ```

#### 🟢 NICE TO HAVE

5. **Busca por SKU**
   ```typescript
   GET /users/{user_id}/items/search?sku={SELLER_CUSTOM_FIELD}
   GET /users/{user_id}/items/search?seller_sku={SELLER_SKU}
   ```

6. **Itens com perda de exposição**
   ```typescript
   GET /users/{user_id}/items/search?reputation_health_gauge=unhealthy
   ```

---

## 2️⃣ ORDERS API

### 📚 Documentação Oficial

#### Endpoints Principais

| Método | Endpoint | Descrição | Implementado |
|--------|----------|-----------|--------------|
| GET | `/orders/search` | Buscar pedidos | ✅ SIM |
| GET | `/orders/{order_id}` | Detalhes do pedido | ✅ SIM |
| GET | `/orders/{order_id}/discounts` | Descontos aplicados | ❌ NÃO |
| GET | `/packs/{pack_id}` | Pedidos em carrinho | ❌ NÃO |

### 🔍 Análise da Implementação Atual

#### ✅ O que está CORRETO:

```typescript
// ✅ BOM: Endpoint correto
GET /orders/search?seller=${sellerId}&sort=date_desc&limit=50

// ✅ BOM: Campos essenciais capturados
{
  id, status, date_created, date_closed,
  total_amount, paid_amount,
  buyer: { id, nickname },
  order_items: [...],
  payments: [...],
  shipping: { id }
}
```

#### ⚠️ O que está INCOMPLETO:

```typescript
// ⚠️ PROBLEMA 1: Não usa todos os filtros disponíveis
// DISPONÍVEL NA ML:
GET /orders/search?seller={id}&order.status=paid
GET /orders/search?seller={id}&order.status=paid,cancelled // Múltiplos
GET /orders/search?seller={id}&tags=delivered
GET /orders/search?seller={id}&tags.not=fraud_risk_detected
GET /orders/search?seller={id}&q={ORDER_ID ou ITEM_ID ou TITLE ou NICKNAME}
GET /orders/search?seller={id}&order.date_created.from=2025-01-01T00:00:00.000Z
GET /orders/search?seller={id}&order.date_created.to=2025-12-31T23:59:59.999Z
GET /orders/search?seller={id}&feedback.status=pending
GET /orders/search?seller={id}&feedback.sale.rating=negative

// IMPLEMENTAÇÃO ATUAL: Só usa seller e sort básico!
```

#### 🔴 O que está INCORRETO/AUSENTE:

```typescript
// ❌ AUSENTE: Descontos e cupons
// OFICIAL ML: Endpoint para ver descontos aplicados
GET /orders/{order_id}/discounts
// Retorna: { details: [{ type: "coupon", items: [...] }] }

// ❌ AUSENTE: Packs (carrinhos com múltiplos pedidos)
// OFICIAL ML: Quando pack_id != null, buscar detalhes
GET /packs/{pack_id}

// ❌ AUSENTE: Cálculo correto de total com envio
// OFICIAL ML: Formula específica
// total_with_shipping = total_amount + shipping_cost + taxes.amount
// (com conversão de moeda se necessário)

// ❌ AUSENTE: Detalhes de produtos nos pedidos
// OFICIAL ML: Endpoint para atributos IMEI, serial, etc.
GET /orders/{order_id}/product
// Retorna: { attributes: [{ name: "IMEI", value: "123" }] }

// ❌ AUSENTE: Tags importantes não tratadas
// Tags ML: "fraud_risk_detected", "delivered", "not_delivered", "test_order"
// Implementação: Armazena mas não processa
```

### 🎯 Recomendações - ORDERS

#### 🔴 CRÍTICO (Fazer Agora)

1. **Implementar filtros de busca completos**
   ```typescript
   interface OrderFilters {
     status?: string | string[]; // 'paid', 'cancelled', etc.
     tags?: string | string[];
     tags_not?: string | string[];
     q?: string; // Busca genérica
     date_created_from?: string;
     date_created_to?: string;
     date_closed_from?: string;
     date_closed_to?: string;
     feedback_status?: string;
   }
   
   async function searchOrders(filters: OrderFilters) {
     const params = new URLSearchParams();
     if (filters.status) {
       params.append('order.status', 
         Array.isArray(filters.status) ? filters.status.join(',') : filters.status
       );
     }
     // ... outros filtros
     return fetch(`/orders/search?${params}`);
   }
   ```

2. **Detectar e alertar fraudes**
   ```typescript
   // Verificar tag "fraud_risk_detected" e alertar
   if (order.tags.includes('fraud_risk_detected')) {
     await notifyUser({
       type: 'fraud_alert',
       orderId: order.id,
       message: 'Possível fraude detectada. NÃO ENVIE o produto!'
     });
     
     // Marcar no banco para ação manual
     await supabase
       .from('ml_orders')
       .update({ 
         status: 'fraud_suspected',
         fraud_detected_at: new Date()
       })
       .eq('ml_order_id', order.id);
   }
   ```

#### 🟡 IMPORTANTE (Próximos Sprint)

3. **Implementar endpoint de descontos**
   ```typescript
   // GET /api/ml/orders/{id}/discounts
   export async function GET(
     request: NextRequest,
     { params }: { params: { id: string } }
   ) {
     const response = await fetch(
       `https://api.mercadolibre.com/orders/${params.id}/discounts`
     );
     const discounts = await response.json();
     
     // Salvar informação de desconto no banco
     await supabase
       .from('ml_orders')
       .update({ 
         discounts: discounts.details,
         total_discounts: calculateTotalDiscounts(discounts)
       })
       .eq('ml_order_id', params.id);
     
     return NextResponse.json(discounts);
   }
   ```

4. **Suporte a Packs (carrinhos)**
   ```typescript
   // Se order.pack_id existe, buscar detalhes do pack
   if (order.pack_id) {
     const packResponse = await fetch(
       `https://api.mercadolibre.com/packs/${order.pack_id}`
     );
     const pack = await packResponse.json();
     
     // Pack contém múltiplos orders
     for (const orderId of pack.orders) {
       // Sincronizar cada order individual
       await syncOrder(orderId);
     }
   }
   ```

#### 🟢 NICE TO HAVE

5. **Atributos de produtos (IMEI, serial)**
   ```typescript
   GET /orders/{order_id}/product
   // Armazenar IMEIs e seriais para rastreamento
   ```

6. **Cálculo correto de total com envio e impostos**
   ```typescript
   async function calculateTotalWithShipping(order: MLOrder) {
     // Buscar detalhes do envio
     const shipping = await fetch(
       `https://api.mercadolibre.com/shipments/${order.shipping.id}`
     );
     const shippingData = await shipping.json();
     
     // Total = pedido + envio + impostos
     let total = order.total_amount;
     
     if (shippingData.lead_time?.cost) {
       total += shippingData.lead_time.cost;
     }
     
     if (order.taxes?.amount) {
       // Converter moeda se necessário
       if (order.taxes.currency_id !== order.currency_id) {
         const rate = await getCurrencyRate(
           order.taxes.currency_id,
           order.currency_id
         );
         total += order.taxes.amount * rate;
       } else {
         total += order.taxes.amount;
       }
     }
     
     return total;
   }
   ```

---

## 3️⃣ QUESTIONS API

### 📚 Documentação Oficial

**⚠️ MUDANÇA CRÍTICA**: API v4 é obrigatória!

#### Endpoints Principais

| Método | Endpoint | Descrição | Implementado |
|--------|----------|-----------|--------------|
| GET | `/my/received_questions/search?api_version=4` | Perguntas recebidas (v4) | 🔴 NÃO |
| GET | `/questions/search?item={id}&api_version=4` | Por item | ⚠️ USA V3 |
| GET | `/questions/{id}` | Detalhes da pergunta | ✅ SIM |
| POST | `/questions` | Fazer pergunta | ❌ NÃO |
| POST | `/answers` | Responder pergunta | ❌ NÃO |

### 🔍 Análise da Implementação Atual

#### 🔴 PROBLEMA CRÍTICO:

```typescript
// ❌ ERRADO: Usa endpoint ANTIGO sem api_version=4
// IMPLEMENTAÇÃO ATUAL:
GET /questions/search?item=${itemId}

// ✅ CORRETO (Documentação oficial):
GET /my/received_questions/search?api_version=4
GET /questions/search?item=${itemId}&api_version=4

// 📖 DIFERENÇAS API v3 vs v4:
// v3: { questions: [...] }
// v4: { 
//   questions: [...],
//   filters: {...},  // ← NOVO
//   available_filters: [...],  // ← NOVO  
//   paging: {...}
// }
```

### 🎯 Recomendações - QUESTIONS

#### 🔴 CRÍTICO (Fazer AGORA)

1. **MIGRAR PARA API v4 IMEDIATAMENTE**
   ```typescript
   // ❌ REMOVER:
   const response = await fetch(
     `https://api.mercadolibre.com/questions/search?item=${itemId}`
   );
   
   // ✅ SUBSTITUIR POR:
   const response = await fetch(
     `https://api.mercadolibre.com/my/received_questions/search?api_version=4`
   );
   
   // OU para item específico:
   const response = await fetch(
     `https://api.mercadolibre.com/questions/search?item=${itemId}&api_version=4`
   );
   ```

2. **Usar filtros disponíveis**
   ```typescript
   // API v4 oferece filtros avançados
   interface QuestionFilters {
     status?: 'UNANSWERED' | 'ANSWERED';
     from_id?: number; // User que perguntou
     sort?: 'date_asc' | 'date_desc';
     offset?: number;
     limit?: number;
   }
   
   async function getQuestions(filters: QuestionFilters) {
     const params = new URLSearchParams({
       api_version: '4',
       ...filters
     });
     
     return fetch(
       `https://api.mercadolibre.com/my/received_questions/search?${params}`
     );
   }
   ```

3. **Implementar resposta automática**
   ```typescript
   // POST /api/ml/questions/{id}/answer
   export async function POST(
     request: NextRequest,
     { params }: { params: { id: string } }
   ) {
     const { answer } = await request.json();
     
     const response = await fetch(
       'https://api.mercadolibre.com/answers',
       {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${accessToken}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           question_id: parseInt(params.id),
           text: answer
         })
       }
     );
     
     const data = await response.json();
     
     // Atualizar no banco local
     await supabase
       .from('ml_questions')
       .update({
         status: 'ANSWERED',
         answer_text: answer,
         answer_date: new Date()
       })
       .eq('ml_question_id', params.id);
     
     return NextResponse.json(data);
   }
   ```

#### 🟡 IMPORTANTE (Próximos Sprint)

4. **Implementar bloqueio de usuários abusivos**
   ```typescript
   // GET /block-api/search/users/{user_id}?type=blocked_by_questions
   // POST /block-api/users/{user_id}?type=blocked_by_questions
   
   async function blockUser(userId: number) {
     const response = await fetch(
       `https://api.mercadolibre.com/block-api/users/${userId}?type=blocked_by_questions`,
       {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${accessToken}` }
       }
     );
     
     if (response.ok) {
       await supabase
         .from('ml_blocked_users')
         .insert({
           user_id: userId,
           blocked_at: new Date(),
           reason: 'questions_abuse'
         });
     }
   }
   ```

#### 🟢 NICE TO HAVE

5. **IA para sugestões de respostas**
   ```typescript
   // Usar OpenAI para sugerir respostas baseadas em histórico
   async function suggestAnswer(question: string) {
     const previousAnswers = await getAnswersHistory();
     
     const completion = await openai.chat.completions.create({
       model: "gpt-4",
       messages: [
         { role: "system", content: "Você é um assistente que ajuda vendedores..." },
         { role: "user", content: `Pergunta: ${question}\n\nSugerir resposta baseada no histórico` }
       ]
     });
     
     return completion.choices[0].message.content;
   }
   ```

---

## 4️⃣ WEBHOOKS SYSTEM

### 📚 Documentação Oficial

#### Topics Disponíveis

| Topic | Descrição | Implementado | Prioridade |
|-------|-----------|--------------|------------|
| `orders_v2` | Pedidos | ✅ SIM | 🔴 CRÍTICO |
| `items` | Produtos | ✅ SIM | 🔴 CRÍTICO |
| `questions` | Perguntas | ⚠️ PARCIAL | 🔴 CRÍTICO |
| `messages` (created) | Mensagens criadas | ❌ NÃO | 🟡 IMPORTANTE |
| `messages` (read) | Mensagens lidas | ❌ NÃO | 🟢 OPCIONAL |
| `shipments` | Envios | ❌ NÃO | 🟡 IMPORTANTE |
| `payments` | Pagamentos | ❌ NÃO | 🟡 IMPORTANTE |
| `invoices` | Notas fiscais | ❌ NÃO | 🟢 OPCIONAL |
| `claims` | Reclamações | ❌ NÃO | 🟡 IMPORTANTE |
| `price_suggestion` | Sugestão de preço | ❌ NÃO | 🟢 OPCIONAL |

### 🔍 Análise da Implementação Atual

#### ✅ O que está CORRETO:

```typescript
// ✅ BOM: Usa service role para inserir
const supabase = createServiceRoleClient();

// ✅ BOM: Valida payload
const webhook = MLWebhookNotificationSchema.parse(await request.json());

// ✅ BOM: Responde rapidamente
return NextResponse.json({ received: true }, { status: 200 });
```

#### ⚠️ O que está INCOMPLETO:

```typescript
// ⚠️ PROBLEMA 1: Não responde em < 500ms
// DOCUMENTAÇÃO ML: Retornar HTTP 200 em até 500ms
// IMPLEMENTAÇÃO ATUAL: Faz insert síncrono, pode demorar

// ✅ CORRETO:
export async function POST(request: NextRequest) {
  // RESPONDER IMEDIATAMENTE
  const response = NextResponse.json({ received: true }, { status: 200 });
  
  // PROCESSAR EM BACKGROUND
  (async () => {
    try {
      const webhook = await request.json();
      await processWebhook(webhook);
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  })();
  
  return response;
}
```

```typescript
// ⚠️ PROBLEMA 2: Topics com subtópicos não tratados
// DOCUMENTAÇÃO ML: Messages tem actions: ["created"], ["read"]
// IMPLEMENTAÇÃO ATUAL: Não verifica campo "actions"

// Estrutura webhook com subtópicos:
{
  "_id": "...",
  "resource": "/api/vis_leads/...",
  "user_id": 123456789,
  "topic": "messages",
  "actions": ["created"], // ← CAMPO IMPORTANTE
  "application_id": 111111,
  "attempts": 1,
  "sent": "2025-01-21T13:44:33.006Z",
  "received": "2025-01-21T13:44:32.984Z"
}
```

#### 🔴 O que está INCORRETO/AUSENTE:

```typescript
// ❌ AUSENTE: Processamento assíncrono robusto
// RECOMENDADO: Usar fila (Redis Queue ou Vercel Queue)

// ❌ AUSENTE: Retry logic para falhas
// ML: Tenta 8x em 1h, depois descarta

// ❌ AUSENTE: Idempotência
// ML: Pode enviar duplicados, deve tratar

// ❌ AUSENTE: Validação de origem
// ML: Envia de IPs específicos (54.88.218.97, 18.215.140.160, ...)
// Deve validar IP de origem

// ❌ AUSENTE: Muitos topics importantes
// messages, shipments, payments, invoices, claims
```

### 🎯 Recomendações - WEBHOOKS

#### 🔴 CRÍTICO (Fazer Agora)

1. **Responder em < 500ms sempre**
   ```typescript
   export async function POST(request: NextRequest) {
     // STEP 1: Responder IMEDIATAMENTE
     const response = NextResponse.json(
       { received: true, timestamp: new Date().toISOString() },
       { status: 200 }
     );
     
     // STEP 2: Processar em background (não await!)
     processWebhookAsync(request).catch(error => {
       console.error('Background webhook processing failed:', error);
       // Log to Sentry but don't fail response
     });
     
     return response;
   }
   
   async function processWebhookAsync(request: NextRequest) {
     const webhook = await request.json();
     
     // Log recebimento
     await logWebhook(webhook);
     
     // Processar baseado no topic
     await processWebhook(webhook);
   }
   ```

2. **Implementar idempotência**
   ```typescript
   async function processWebhook(webhook: MLWebhookNotification) {
     // STEP 1: Verificar se já processado (por _id)
     const { data: existing } = await supabase
       .from('ml_webhook_logs')
       .select('id')
       .eq('webhook_id', webhook._id)
       .eq('processed', true)
       .maybeSingle();
     
     if (existing) {
       console.log('Webhook already processed, skipping', webhook._id);
       return; // ← Idempotência garantida
     }
     
     // STEP 2: Processar...
     const result = await processWebhookByTopic(webhook);
     
     // STEP 3: Marcar como processado
     await supabase
       .from('ml_webhook_logs')
       .update({
         processed: true,
         processed_at: new Date().toISOString(),
         processing_result: result
       })
       .eq('webhook_id', webhook._id);
   }
   ```

3. **Validar IP de origem**
   ```typescript
   const ALLOWED_ML_IPS = [
     '54.88.218.97',
     '18.215.140.160',
     '18.213.114.129',
     '18.206.34.84'
   ];
   
   export async function POST(request: NextRequest) {
     // Validar origem
     const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip');
     
     if (ip && !ALLOWED_ML_IPS.includes(ip)) {
       console.warn('Webhook from unauthorized IP:', ip);
       return NextResponse.json(
         { error: 'Unauthorized' },
         { status: 403 }
       );
     }
     
     // ... resto do código
   }
   ```

#### 🟡 IMPORTANTE (Próximos Sprint)

4. **Adicionar topics críticos faltantes**
   ```typescript
   // Messages (comunicação pós-venda)
   case 'messages':
     if (webhook.actions?.includes('created')) {
       await processNewMessage(webhook);
     }
     break;
   
   // Shipments (rastreamento)
   case 'shipments':
     await processShipmentUpdate(webhook);
     break;
   
   // Payments (confirmação)
   case 'payments':
     await processPaymentUpdate(webhook);
     break;
   
   // Claims (reclamações)
   case 'claims':
     await processClaimUpdate(webhook);
     await notifyUserAboutClaim(webhook);
     break;
   ```

5. **Implementar fila para processamento**
   ```typescript
   // Usar Redis Queue ou similar
   import Queue from 'bull';
   
   const webhookQueue = new Queue('ml-webhooks', process.env.REDIS_URL);
   
   export async function POST(request: NextRequest) {
     const webhook = await request.json();
     
     // Adicionar à fila (rápido)
     await webhookQueue.add(webhook, {
       attempts: 3,
       backoff: {
         type: 'exponential',
         delay: 2000
       }
     });
     
     // Responder imediatamente
     return NextResponse.json({ received: true }, { status: 200 });
   }
   
   // Worker separado processa a fila
   webhookQueue.process(async (job) => {
     await processWebhook(job.data);
   });
   ```

#### 🟢 NICE TO HAVE

6. **Dashboard de webhooks**
   ```typescript
   // Visualizar webhooks recebidos, taxa de sucesso, latência
   GET /api/ml/webhooks/stats
   
   {
     "last_24h": {
       "total": 1523,
       "success": 1520,
       "failed": 3,
       "avg_latency_ms": 234,
       "by_topic": {
         "orders_v2": 523,
         "items": 890,
         "questions": 110
       }
     }
   }
   ```

---

## 5️⃣ MESSAGES API (AUSENTE!)

### 📚 Documentação Oficial

**Status**: 🔴 **NÃO IMPLEMENTADO**

#### Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/messages/packs/{pack_id}` | Lista mensagens de um pack |
| POST | `/messages/packs/{pack_id}/sellers/{seller_id}` | Enviar mensagem |
| PUT | `/messages/{message_id}` | Marcar como lida |
| GET | `/messages/packs/{pack_id}/unread` | Mensagens não lidas |

### 🎯 Recomendações - MESSAGES

#### 🟡 IMPORTANTE (Implementar em Sprint 3-4)

1. **Endpoint para listar mensagens**
   ```typescript
   // GET /api/ml/messages
   export async function GET(request: NextRequest) {
     const searchParams = request.nextUrl.searchParams;
     const packId = searchParams.get('pack_id');
     
     const response = await fetch(
       `https://api.mercadolibre.com/messages/packs/${packId}`,
       {
         headers: { 'Authorization': `Bearer ${accessToken}` }
       }
     );
     
     const messages = await response.json();
     
     // Sincronizar com banco local
     for (const message of messages) {
       await supabase
         .from('ml_messages')
         .upsert({
           ml_message_id: message.id,
           pack_id: packId,
           from_user_id: message.from.user_id,
           to_user_id: message.to.user_id,
           text: message.text,
           message_date: message.message_date.received,
           status: message.message_moderation.status
         });
     }
     
     return NextResponse.json(messages);
   }
   ```

2. **Endpoint para enviar mensagens**
   ```typescript
   // POST /api/ml/messages
   export async function POST(request: NextRequest) {
     const { pack_id, text } = await request.json();
     const sellerId = await getSellerIdFromIntegration();
     
     const response = await fetch(
       `https://api.mercadolibre.com/messages/packs/${pack_id}/sellers/${sellerId}`,
       {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${accessToken}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           from: { user_id: sellerId },
           to: { user_id: await getBuyerIdFromPack(pack_id) },
           text: text
         })
       }
     );
     
     return NextResponse.json(await response.json());
   }
   ```

3. **Notificar mensagens não lidas**
   ```typescript
   // Chamar periodicamente ou via webhook
   async function checkUnreadMessages() {
     const packs = await getActivePacks();
     
     for (const pack of packs) {
       const response = await fetch(
         `https://api.mercadolibre.com/messages/packs/${pack.id}/unread`
       );
       
       const unread = await response.json();
       
       if (unread.total > 0) {
         await notifyUser({
           type: 'unread_messages',
           count: unread.total,
           pack_id: pack.id
         });
       }
     }
   }
   ```

---

## 6️⃣ OAUTH & TOKEN MANAGEMENT

### 📚 Documentação Oficial

#### Flow Completo

```
1. Autorização:
   GET /authorization?response_type=code&client_id=...&redirect_uri=...&code_challenge=...&code_challenge_method=S256

2. Troca do code por token:
   POST /oauth/token
   grant_type=authorization_code
   code=...
   client_id=...
   client_secret=...
   redirect_uri=...
   code_verifier=...

3. Refresh token:
   POST /oauth/token
   grant_type=refresh_token
   refresh_token=...
   client_id=...
   client_secret=...

Response:
{
  "access_token": "APP_USR-...",
  "token_type": "bearer",
  "expires_in": 21600, // 6 horas
  "scope": "offline_access read write",
  "user_id": 123456,
  "refresh_token": "TG-..."
}
```

### 🔍 Análise da Implementação Atual

#### ✅ O que está CORRETO:

```typescript
// ✅ BOM: Usa PKCE
const codeVerifier = generateCodeVerifier();
const codeChallenge = await generateCodeChallenge(codeVerifier);

// ✅ BOM: Armazena state para validação
await supabase.from('ml_oauth_states').insert({
  state,
  code_verifier,
  redirect_uri
});

// ✅ BOM: Refresh automático
async getValidToken(integrationId: string) {
  const integration = await getIntegration(integrationId);
  
  if (isTokenExpired(integration.token_expires_at)) {
    return this.refreshToken(integration);
  }
  
  return integration.access_token;
}

// ✅ BOM: Criptografa tokens
const encrypted = encrypt(accessToken, process.env.ENCRYPTION_KEY);
```

#### ⚠️ O que está INCOMPLETO:

```typescript
// ⚠️ PROBLEMA 1: Não valida eventos que invalidam token
// DOCUMENTAÇÃO ML: Token é invalidado quando:
// - Usuário muda senha
// - Client secret é atualizado
// - Usuário revoga permissões
// - 4 meses sem uso

// IMPLEMENTAÇÃO ATUAL: Não detecta essas situações proativamente

// ⚠️ PROBLEMA 2: Não trata erro invalid_grant adequadamente
// DOCUMENTAÇÃO ML: invalid_grant = token expirado/revogado
// SOLUÇÃO: Forçar novo fluxo OAuth completo

// ⚠️ PROBLEMA 3: Não valida redirect_uri estritamente
// DOCUMENTAÇÃO ML: redirect_uri deve ser EXATAMENTE igual ao cadastrado
// IMPLEMENTAÇÃO: Valida, mas pode melhorar erro handling
```

### 🎯 Recomendações - OAUTH

#### 🔴 CRÍTICO (Fazer Agora)

1. **Tratar invalid_grant forçando re-autenticação**
   ```typescript
   async refreshToken(integration: MLIntegration) {
     try {
       const response = await fetch(
         'https://api.mercadolibre.com/oauth/token',
         {
           method: 'POST',
           body: new URLSearchParams({
             grant_type: 'refresh_token',
             refresh_token: decrypt(integration.refresh_token),
             client_id: process.env.ML_CLIENT_ID,
             client_secret: process.env.ML_CLIENT_SECRET
           })
         }
       );
       
       if (!response.ok) {
         const error = await response.json();
         
         // Se invalid_grant, marcar integração como expirada
         if (error.error === 'invalid_grant') {
           await supabase
             .from('ml_integrations')
             .update({
               status: 'expired',
               expired_at: new Date(),
               error_details: error
             })
             .eq('id', integration.id);
           
           // Notificar usuário para re-autorizar
           await notifyUserToReauthorize(integration);
           
           throw new Error('Token expired. User must re-authorize.');
         }
         
         throw new Error(`Refresh failed: ${error.error}`);
       }
       
       // ... atualizar tokens
     } catch (error) {
       // Log to Sentry
       throw error;
     }
   }
   ```

2. **Validar usuário não é operador/colaborador**
   ```typescript
   // Durante OAuth callback
   export async function GET(request: NextRequest) {
     const code = searchParams.get('code');
     
     // Trocar code por token
     const tokenResponse = await exchangeCodeForToken(code);
     
     // Buscar info do usuário
     const userResponse = await fetch(
       'https://api.mercadolibre.com/users/me',
       {
         headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
       }
     );
     
     const user = await userResponse.json();
     
     // ⚠️ VALIDAÇÃO CRÍTICA
     if (user.user_type === 'operator') {
       return NextResponse.redirect(
         new URL(
           '/dashboard/ml?error=invalid_user_type&message=Operadores não podem autorizar. Use a conta principal.',
           request.url
         )
       );
     }
     
     // ... continuar fluxo
   }
   ```

#### 🟡 IMPORTANTE (Próximos Sprint)

3. **Detector de tokens próximos da expiração**
   ```typescript
   // Rodar diariamente via cron
   async function checkTokensExpiringCron() {
     const expiringIn24h = await supabase
       .from('ml_integrations')
       .select('*')
       .eq('status', 'active')
       .lt('token_expires_at', new Date(Date.now() + 24 * 60 * 60 * 1000))
       .gte('token_expires_at', new Date());
     
     for (const integration of expiringIn24h.data || []) {
       // Tentar refresh preventivo
       try {
         await tokenManager.refreshToken(integration);
         console.log('Preventive refresh successful:', integration.id);
       } catch (error) {
         console.error('Preventive refresh failed:', integration.id, error);
         // Notificar usuário
         await notifyUserTokenExpiring(integration);
       }
     }
   }
   ```

4. **Dashboard de integrações ativas**
   ```typescript
   // GET /api/ml/integrations/status
   export async function GET() {
     const integrations = await supabase
       .from('ml_integrations')
       .select(`
         id,
         status,
         ml_user_id,
         created_at,
         token_expires_at,
         last_sync_at,
         error_details
       `)
       .eq('tenant_id', await getCurrentTenantId());
     
     const status = integrations.data.map(int => ({
       ...int,
       token_status: getTokenStatus(int.token_expires_at),
       days_until_expiration: calculateDaysUntil(int.token_expires_at)
     }));
     
     return NextResponse.json(status);
   }
   ```

---

## 7️⃣ PRIORIZAÇÃO DE CORREÇÕES

### 🔴 SPRINT 1 (CRÍTICO - 1-2 semanas)

#### 1. Questions API v4 Migration
- **Impacto**: CRÍTICO
- **Esforço**: 4h
- **Arquivos**: 
  - `app/api/ml/questions/route.ts`
  - `utils/mercadolivre/api/MLApiClient.ts`

```typescript
// Mudanças necessárias:
1. Adicionar api_version=4 em todos os requests
2. Atualizar tipos para incluir filters/available_filters
3. Migrar de /questions/search para /my/received_questions/search
4. Atualizar testes
```

#### 2. Webhooks: Resposta < 500ms
- **Impacto**: CRÍTICO
- **Esforço**: 6h
- **Arquivos**:
  - `app/api/ml/webhooks/route.ts`

```typescript
// Mudanças necessárias:
1. Separar resposta de processamento
2. Implementar processamento assíncrono
3. Adicionar validação de IP de origem
4. Implementar idempotência por webhook._id
```

#### 3. Orders: Detecção de Fraude
- **Impacto**: CRÍTICO
- **Esforço**: 4h
- **Arquivos**:
  - `app/api/ml/orders/route.ts`
  - Database: add column `fraud_detected_at`

```typescript
// Mudanças necessárias:
1. Verificar tag "fraud_risk_detected"
2. Bloquear envio automático
3. Notificar usuário urgentemente
4. Marcar pedido no banco
```

### 🟡 SPRINT 2 (IMPORTANTE - 2-3 semanas)

#### 4. Products: Scroll para +1000 itens
- **Impacto**: ALTO (vendedores grandes)
- **Esforço**: 8h

#### 5. Orders: Filtros Avançados
- **Impacto**: MÉDIO
- **Esforço**: 6h

#### 6. Webhooks: Topics Faltantes
- **Impacto**: ALTO
- **Esforço**: 12h
- Topics: messages, shipments, payments, claims

#### 7. Questions: Resposta Automática
- **Impacto**: MÉDIO
- **Esforço**: 8h

### 🟢 SPRINT 3-4 (MELHORIAS - 3-4 semanas)

#### 8. Messages API (Completa)
- **Impacto**: MÉDIO
- **Esforço**: 16h

#### 9. Products: CRUD Completo
- **Impacto**: BAIXO (frontend faz direto)
- **Esforço**: 12h

#### 10. Orders: Descontos e Packs
- **Impacto**: BAIXO
- **Esforço**: 8h

---

## 📊 RESUMO DE IMPACTO

### Por Criticidade

```
🔴 CRÍTICO (Bloqueia funcionalidade):
- Questions API v4                    [4h]
- Webhook resposta <500ms             [6h]
- Detecção de fraude                  [4h]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL CRÍTICO:                       14h

🟡 IMPORTANTE (Degrada experiência):
- Scroll +1000 produtos               [8h]
- Orders filtros avançados            [6h]
- Webhooks topics faltantes          [12h]
- Questions resposta automática       [8h]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL IMPORTANTE:                    34h

🟢 OPCIONAL (Nice to have):
- Messages API completa              [16h]
- Products CRUD                      [12h]
- Orders descontos/packs              [8h]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL OPCIONAL:                      36h

TOTAL GERAL:                         84h (≈ 2-3 sprints)
```

### Por Área

```
Products/Items:        🟡 20h
Orders:                🔴 18h
Questions:             🔴 12h
Webhooks:              🔴 18h
Messages:              🟢 16h
━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:                    84h
```

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

### Esta Semana

1. **[2h] Revisar este documento com time**
   - Discutir prioridades
   - Validar estimativas
   - Definir sprint 1

2. **[4h] Migrar Questions para API v4**
   - Endpoint correto
   - api_version=4
   - Testes

3. **[6h] Corrigir Webhooks**
   - Resposta < 500ms
   - Processamento async
   - Validação IP

4. **[4h] Detecção de Fraude em Orders**
   - Verificar tag
   - Notificar usuário
   - Bloquear envio

### Próxima Semana

5. **[8h] Implementar Scroll para +1000 produtos**
6. **[6h] Adicionar filtros em Orders**
7. **[4h] Iniciar Messages API**

---

## 📚 REFERÊNCIAS

### Documentação Oficial ML

1. **Items & Search**: https://developers.mercadolivre.com.br/pt_br/itens-e-buscas
2. **Orders Management**: https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas
3. **Questions**: https://developers.mercadolivre.com.br/pt_br/perguntas-e-respostas
4. **Webhooks**: https://developers.mercadolivre.com.br/pt_br/produto-receba-notificacoes
5. **OAuth**: https://developers.mercadolivre.com.br/pt_br/autenticacao-e-autorizacao
6. **Messages**: https://developers.mercadolivre.com.br/pt_br/mensagens-post-venda

### Arquivos do Projeto

```
app/api/ml/
  ├── products/sync-all/route.ts    ← Corrigir multiget
  ├── orders/route.ts                ← Adicionar filtros + fraude
  ├── questions/route.ts             ← MIGRAR para API v4
  └── webhooks/route.ts              ← Corrigir resposta + topics

utils/mercadolivre/
  ├── services/MLProductService.ts   ← Adicionar scroll
  ├── api/MLApiClient.ts             ← Atualizar endpoints
  └── token-manager.ts               ← Melhorar error handling
```

---

## ✅ CHECKLIST DE CONFORMIDADE

Use esta checklist para validar cada correção:

### Products/Items
- [ ] Usa `/users/{id}/items/search` para IDs ✅
- [ ] Usa `/items?ids=...` para multiget ✅
- [ ] Implementa paginação ✅
- [ ] Suporta +1000 itens com scroll ❌
- [ ] Usa filtros (status, tipo, SKU) ❌
- [ ] Otimiza multiget com attributes ❌

### Orders
- [ ] Usa `/orders/search` correto ✅
- [ ] Implementa filtros básicos ⚠️
- [ ] Detecta fraude (tag) ❌
- [ ] Busca descontos `/orders/{id}/discounts` ❌
- [ ] Suporta packs `/packs/{id}` ❌
- [ ] Calcula total com envio/impostos ❌

### Questions
- [ ] Usa API v4 ❌ **CRÍTICO**
- [ ] Endpoint `/my/received_questions/search` ❌
- [ ] Parametro `api_version=4` ❌
- [ ] Implementa filtros v4 ❌
- [ ] POST `/answers` para responder ❌
- [ ] Bloqueio de usuários ❌

### Webhooks
- [ ] Responde < 500ms ❌ **CRÍTICO**
- [ ] Processamento assíncrono ❌
- [ ] Validação de IP de origem ❌
- [ ] Idempotência por `_id` ❌
- [ ] Topic: orders_v2 ✅
- [ ] Topic: items ✅
- [ ] Topic: questions ⚠️
- [ ] Topic: messages ❌
- [ ] Topic: shipments ❌
- [ ] Topic: payments ❌
- [ ] Topic: claims ❌

### OAuth/Tokens
- [ ] PKCE implementado ✅
- [ ] Refresh automático ✅
- [ ] Detecta invalid_grant ⚠️
- [ ] Valida usuário não é operador ⚠️
- [ ] Tokens criptografados ✅
- [ ] Notifica expiração ❌

---

**FIM DA AUDITORIA**

*Documento gerado em: 19/10/2025*  
*Próxima revisão: Após Sprint 1 (correções críticas)*
