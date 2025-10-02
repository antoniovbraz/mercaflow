# MercadoLibre API - Análise Técnica Avançada
*Estudo audacioso e minucioso das APIs do MercadoLibre em todos os países LATAM*

## 🔐 Sistema de Autenticação e Rate Limits

### **OAuth 2.0 - Especificações Técnicas Completas**

#### **Fluxo de Autorização Server-Side (Authorization Code Grant)**
- **Protocolo**: OAuth 2.0 com suporte a PKCE (Proof Key for Code Exchange)
- **Endpoint de Autorização**: `https://auth.mercadolivre.com.br/authorization` (varia por país)
- **Endpoint de Token**: `https://api.mercadolibre.com/oauth/token`
- **Access Token**: Válido por **6 horas** (21600 segundos)
- **Refresh Token**: Válido por **6 meses** (uso único)

#### **Parâmetros de Autorização Obrigatórios**
```
response_type: "code"
client_id: APP_ID da aplicação
redirect_uri: URL registrada (deve ser EXATA)
state: Parâmetro de segurança (recomendado)
```

#### **Parâmetros PKCE (Opcionais mas Recomendados)**
```
code_challenge: Código gerado a partir do code_verifier
code_challenge_method: "S256" (SHA-256) ou "plain" (não recomendado)
code_verifier: String aleatória para validação
```

#### **Invalidação de Tokens**
Os access tokens podem ser invalidados antes das 6 horas por:
- Alteração de senha pelo usuário
- Atualização do Client Secret da aplicação
- Revogação de permissões pelo usuário
- Inatividade de 4 meses sem chamadas à API
- Fluxos internos de segurança (mudança de dispositivos, detecção de fraude)

### **Rate Limits e Throttling**

#### **Erro 429 - local_rate_limited**
- **Descrição**: Bloqueio temporário por excesso de requisições
- **Ação**: Aguardar alguns segundos e tentar novamente
- **Mencionado**: Nas documentações de autenticação

#### **Erro 403 - Forbidden**
- **IP Blocking**: Solicitações de IPs não autorizados
- **Aplicação Bloqueada**: Por violação dos Termos e Condições
- **Permissões Insuficientes**: Scopes inadequados
- **Access Token Incorreto**: Token de outro usuário

#### **IPs das Notificações do MercadoLibre**
Para filtros de firewall, as notificações vêm dos IPs:
- `54.88.218.97`
- `18.215.140.160`
- `18.213.114.129`
- `18.206.34.84`

## 📡 Sistema de Webhooks - Especificações Completas

### **Configuração de Callback URLs**
- **URL Pública**: Deve ser acessível via HTTP POST
- **Timeout**: 500 milissegundos máximo para resposta HTTP 200
- **Tentativas**: 8 tentativas durante 1 hora
- **Fallback**: Desativação automática de tópicos após falhas

### **Tópicos Disponíveis - Estrutura Completa**

#### **1. Orders (Modelo Geral + Subtópicos)**
- **orders_v2**: Criação e alterações em vendas confirmadas
- **orders_feedback**: Criação e alterações em feedbacks

#### **2. Messages (Modelo com Subtópicos)**
- **created**: Novas mensagens geradas
- **read**: Leituras de mensagens

#### **3. Items (Modelo Geral)**
- **items**: Qualquer mudança em itens publicados
- **questions**: Perguntas e respostas
- **quotations**: Cotações (apenas Chile - imóveis)
- **items_prices**: Criação, atualização ou exclusão de preços
- **stock-locations**: Modificações em stock_locations de user_products
- **user_products_families**: Modificações em famílias de user_products

#### **4. Prices**
- **price_suggestion**: Sugestões de preços

#### **5. Catalog**
- **catalog_item_competition_status**: Mudanças de status de competição (BR, AR, MX)
- **catalog_suggestions**: Mudanças em sugestões para Brand Central

#### **6. Shipments**
- **shipments**: Criação e alterações em envios
- **fbm_stock_operations**: Operações de estoque FBM
- **flex-handshakes**: Transferências entre transportadoras

#### **7. Promotions**
- **public_offers**: Criação/alteração de ofertas
- **public_candidates**: Itens candidatos a promoções

#### **8. VIS Leads (Modelo com Subtópicos)**
- **vis_leads**: Todos os subtópicos de leads
  - **whatsapp**: Clique no botão WhatsApp
  - **call**: Clique no botão ligar
  - **question**: Perguntas de compradores
  - **contact_request**: Solicitações de contato
  - **reservation**: Reservas
  - **visit_request**: Agendamento de visitas (imóveis)

#### **9. Post Purchase (Modelo com Subtópicos)**
- **claims**: Reclamações sobre vendas
- **claims_actions**: Ações executadas em reclamações

#### **10. Others**
- **payments**: Criação/mudança de status de pagamentos
- **invoices**: Notas fiscais geradas (Mercado Envios Full)
- **leads_credits**: Créditos aprovados/rejeitados (veículos e imóveis)

### **Estrutura de Notificação**

#### **Modelo Geral**
```json
{
   "_id": "id_unico",
   "resource": "/caminho_do_recurso",
   "user_id": "id_do_usuario",
   "topic": "topico",
   "application_id": "id_da_aplicacao",
   "attempts": numero_tentativas,
   "sent": "timestamp_envio",
   "received": "timestamp_recebimento"
}
```

#### **Modelo com Subtópicos**
```json
{
  "id": "aaa123bbbbb",
  "resource": "/api/vis_leads/93a14ee6-0356-4e20-b0c6-f4ad8f80bfff",
  "user_id": 123456789,
  "topic": "vis_leads",
  "actions": ["visit_request"],
  "application_id": 1111111111111111111,
  "attempts": 1,
  "sent": "2017-10-09T13:44:33.006Z",
  "received": "2017-10-09T13:44:32.984Z"
}
```

### **Sistema de Missed Feeds**
- **Endpoint**: `https://api.mercadolibre.com/missed_feeds?app_id=$APP_ID`
- **Retenção**: Apenas 2 dias de histórico
- **Filtros**: Por tópico usando `&topic=$TOPIC`
- **Paginação**: `&offset=1&limit=5`

## 🌎 Variações Regionais das APIs

### **Estrutura Consistente Identificada**
Todos os países LATAM mantêm estrutura idêntica:
- **24 módulos de produtos**
- **9 módulos de veículos** 
- **9 módulos de imóveis**
- **7 módulos Mercado Shops**

### **Diferenças Regionais Específicas**

#### **Brasil (.com.br)**
- Sistema de Nota Fiscal integrado
- Faturamento automático Mercado Envios Full
- DCe (Documento de Compras Eletrônico)
- Regras tributárias (ICMS, IPI, PIS, COFINS, DIFAL)

#### **Argentina (.com.ar)**
- Sistema de percepciones fiscais
- Regulamentações específicas de importação

#### **México (.com.mx)**
- Integração com sistema fiscal mexicano
- Regulamentações específicas de comércio

#### **Chile (.cl)**
- Sistema de quotations para imóveis
- Integração com regulamentações locais

#### **Outros Países**
- Colômbia, Peru, Uruguay mantêm estrutura base
- Adaptações para regulamentações locais específicas

## ⚡ Capacidades Técnicas Avançadas

### **Buscas e Filtros**
- Sistema de busca por categorias hierárquicas
- Filtros por atributos específicos
- Busca por compatibilidade (autopeças)
- Sistema de sugestões automáticas

### **Gestão de Inventário**
- Estoque distribuído em múltiplas origens
- Variações de produtos com preços independentes
- Sistema de reservas automáticas
- Controle de disponibilidade em tempo real

### **Sistema de Qualificações e Métricas**
- Algoritmo de reputação de vendedores
- Métricas de qualidade de publicações
- Sistema de experiência de compra
- Análise de tendências de mercado

### **Integrações Avançadas**
- Mercado Envios (1, 2, Flex, Turbo, Fulfillment)
- Sistema de Catálogo com competição automática
- Brand Central para marcas
- Sistema de promoções e cupons
- Integração WhatsApp Business

## 🚨 Considerações Críticas para Implementação

### **Limitações Identificadas**
1. **Rate Limits**: Não especificados numericamente nas documentações
2. **Timeouts**: 500ms para webhooks é muito restritivo
3. **Retenção**: Apenas 2 dias de missed_feeds
4. **Refresh Token**: Uso único, requer gestão cuidadosa

### **Melhores Práticas Obrigatórias**
1. **Webhook Response**: Sempre HTTP 200 em <500ms
2. **Queue System**: Implementar filas para processamento assíncrono
3. **Token Management**: Renovar access_token proativamente
4. **Error Handling**: Tratar especificamente erros 403, 429
5. **IP Whitelisting**: Configurar IPs das notificações

### **Oportunidades para Merca Flow**
1. **Análise de Competição**: Usar dados de catalog_item_competition_status
2. **Otimização de Preços**: Integrar price_suggestions em tempo real
3. **Gestão de Reputação**: Monitorar feedbacks automaticamente
4. **Análise de Tendências**: Usar dados de visitas e métricas
5. **Automação de Promoções**: Integrar sistema de ofertas inteligentes

---

*Análise baseada no estudo completo das documentações oficiais do MercadoLibre em todos os países LATAM*