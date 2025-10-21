# 🚀 Guia Completo: Testando APIs do Mercado Livre com Postman

## 📋 Índice
1. [Instalação do Postman](#instalação)
2. [Obtendo o Token ML](#obtendo-token)
3. [Configurando o Postman](#configurando-postman)
4. [Testando APIs Principais](#testando-apis)
5. [Criando Coleção de Testes](#coleção)
6. [Troubleshooting](#troubleshooting)

---

## 1. 📥 Instalação do Postman {#instalação}

### **Opção A: Download Desktop App (Recomendado)**

1. **Acesse:** https://www.postman.com/downloads/
2. **Baixe** a versão para Windows
3. **Instale** o aplicativo
4. **Crie uma conta** (gratuita) ou faça login

### **Opção B: Postman Web**

1. **Acesse:** https://web.postman.co/
2. **Faça login** com Google/GitHub
3. **Use diretamente** no navegador

---

## 2. 🔑 Obtendo o Token ML {#obtendo-token}

### **Método Mais Fácil: Via Admin Page**

1. **Acesse:** https://mercaflow.vercel.app/admin/ml-token

2. **Copie o token** clicando no botão "Copiar Token"

3. O token será algo como:
   ```
   TG-67351d82e4b0ca001d002c95a10f90-669073070
   ```

4. **Guarde esse token** - você vai usar em todas as requisições!

---

## 3. ⚙️ Configurando o Postman {#configurando-postman}

### **Passo 1: Criar uma Collection**

1. **Abra o Postman**

2. **Clique em "Collections"** no menu lateral esquerdo

3. **Clique no botão "+"** ou "New Collection"

4. **Nomeie:** "Mercado Livre API"

5. **Descrição:** "Testes de integração com Mercado Livre"

---

### **Passo 2: Configurar Variáveis de Ambiente**

Isso facilita reutilizar o token em múltiplas requisições.

#### **Criar Environment:**

1. **Clique no ícone de engrenagem** ⚙️ (canto superior direito)

2. **Clique em "Add"** para criar novo environment

3. **Nome:** "ML Production"

4. **Adicione as variáveis:**

| Variable | Type | Initial Value | Current Value |
|----------|------|---------------|---------------|
| `ml_token` | default | `SEU_TOKEN_AQUI` | `SEU_TOKEN_AQUI` |
| `ml_base_url` | default | `https://api.mercadolibre.com` | `https://api.mercadolibre.com` |
| `ml_user_id` | default | `669073070` | `SEU_USER_ID` |

5. **Clique em "Save"**

6. **Selecione o environment** "ML Production" no dropdown (canto superior direito)

---

### **Passo 3: Criar a Primeira Requisição**

#### **3.1 - User Info (Informações do Usuário)**

1. **Dentro da collection** "Mercado Livre API", clique em "Add request"

2. **Nome da request:** `GET User Info`

3. **Método:** `GET`

4. **URL:**
   ```
   {{ml_base_url}}/users/me
   ```

5. **Headers:**
   - Clique na aba "Headers"
   - Adicione:
     - **Key:** `Authorization`
     - **Value:** `Bearer {{ml_token}}`

6. **Clique em "Send"** 🚀

---

### **Resultado Esperado:**

```json
{
  "id": 669073070,
  "nickname": "PEEPERSSHOP",
  "registration_date": "2020-01-01T00:00:00.000-04:00",
  "first_name": "Antonio",
  "last_name": "Henrique",
  "email": "peepers.shop@gmail.com",
  "seller_reputation": {
    "level_id": "5_green",
    "power_seller_status": "platinum",
    "transactions": {
      "total": 15234,
      "completed": 15100
    }
  },
  "address": {
    "city": "São Paulo",
    "state": "BR-SP"
  }
}
```

**Status esperado:** `200 OK` ✅

---

## 4. 🧪 Testando APIs Principais {#testando-apis}

Vou te mostrar como criar requisições para as **5 APIs mais importantes**.

---

### **API 1: User Info (Dados do Usuário)**

✅ **Já criamos acima!**

**Para que serve:** Ver informações da sua conta ML, reputação, vendas totais.

---

### **API 2: Items/Produtos Ativos**

#### **Configuração:**

1. **New Request** na collection

2. **Nome:** `GET Items - Active Products`

3. **Método:** `GET`

4. **URL:**
   ```
   {{ml_base_url}}/users/me/items/search?status=active&limit=20
   ```

5. **Headers:**
   - **Key:** `Authorization`
   - **Value:** `Bearer {{ml_token}}`

6. **Params** (já incluídos na URL acima):
   - `status` = `active`
   - `limit` = `20`

7. **Send** 🚀

#### **Resultado:**

```json
{
  "results": [
    "MLB2015713558",
    "MLB1984568597",
    "MLB2015719431"
  ],
  "paging": {
    "total": 95,
    "offset": 0,
    "limit": 20
  }
}
```

**Explicação:**
- `results`: IDs dos produtos ativos
- `total`: Total de produtos ativos (95 no seu caso!)
- Para ver detalhes, use `/items/{id}` depois

---

### **API 3: Product Details (Detalhes de um Produto)**

#### **Configuração:**

1. **New Request**

2. **Nome:** `GET Item Details`

3. **Método:** `GET`

4. **URL:**
   ```
   {{ml_base_url}}/items/MLB2015713558
   ```
   *(Substitua pelo ID de um dos seus produtos)*

5. **Headers:**
   - **Key:** `Authorization`
   - **Value:** `Bearer {{ml_token}}`

6. **Send** 🚀

#### **Resultado:**

```json
{
  "id": "MLB2015713558",
  "title": "Cabo Usb Tipo C - Carregador Rápido 1m",
  "price": 24.90,
  "available_quantity": 999,
  "sold_quantity": 10028,
  "status": "active",
  "pictures": [...],
  "attributes": [...]
}
```

**Uso:** Ver título, preço, estoque, vendas de cada produto.

---

### **API 4: Orders (Pedidos Recentes)**

#### **Configuração:**

1. **New Request**

2. **Nome:** `GET Orders - Recent`

3. **Método:** `GET`

4. **URL:**
   ```
   {{ml_base_url}}/orders/search?seller={{ml_user_id}}&sort=date_desc&limit=10
   ```

5. **Headers:**
   - **Key:** `Authorization`
   - **Value:** `Bearer {{ml_token}}`

6. **Params:**
   - `seller` = `{{ml_user_id}}`
   - `sort` = `date_desc`
   - `limit` = `10`

7. **Send** 🚀

#### **Resultado:**

```json
{
  "results": [
    {
      "id": 12345678901,
      "status": "paid",
      "date_created": "2025-10-20T10:30:00.000-03:00",
      "total_amount": 49.80,
      "order_items": [
        {
          "item": {
            "id": "MLB2015713558",
            "title": "Cabo Usb Tipo C"
          },
          "quantity": 2,
          "unit_price": 24.90
        }
      ],
      "buyer": {
        "id": 123456789,
        "nickname": "COMPRADOR123"
      }
    }
  ],
  "paging": {
    "total": 1234,
    "limit": 10
  }
}
```

**Uso:** Ver pedidos recentes, status de pagamento, itens vendidos.

---

### **API 5: Questions (Perguntas Recebidas)**

#### **Configuração:**

1. **New Request**

2. **Nome:** `GET Questions - Unanswered`

3. **Método:** `GET`

4. **URL:**
   ```
   {{ml_base_url}}/my/received_questions/search?api_version=4&status=UNANSWERED&limit=10
   ```

5. **Headers:**
   - **Key:** `Authorization`
   - **Value:** `Bearer {{ml_token}}`

6. **Params:**
   - `api_version` = `4` (importante!)
   - `status` = `UNANSWERED`
   - `limit` = `10`

7. **Send** 🚀

#### **Resultado:**

```json
{
  "total": 5,
  "questions": [
    {
      "id": 9876543210,
      "text": "Tem garantia?",
      "status": "UNANSWERED",
      "date_created": "2025-10-20T14:25:00.000-03:00",
      "item_id": "MLB2015713558",
      "from": {
        "id": 987654321,
        "answered_questions": 234
      }
    }
  ]
}
```

**Uso:** Ver perguntas não respondidas para responder.

---

### **API 6: Answer Question (Responder Pergunta)**

#### **Configuração:**

1. **New Request**

2. **Nome:** `POST Answer Question`

3. **Método:** `POST`

4. **URL:**
   ```
   {{ml_base_url}}/answers
   ```

5. **Headers:**
   - **Key:** `Authorization`
   - **Value:** `Bearer {{ml_token}}`
   - **Key:** `Content-Type`
   - **Value:** `application/json`

6. **Body:**
   - Selecione **"raw"**
   - Tipo: **JSON**
   - Conteúdo:
     ```json
     {
       "question_id": 9876543210,
       "text": "Sim, todos os nossos produtos têm 3 meses de garantia!"
     }
     ```

7. **Send** 🚀

#### **Resultado:**

```json
{
  "id": 11111111111,
  "question_id": 9876543210,
  "text": "Sim, todos os nossos produtos têm 3 meses de garantia!",
  "status": "ACTIVE",
  "date_created": "2025-10-20T14:30:00.000-03:00"
}
```

**Status esperado:** `201 Created` ✅

---

## 5. 📁 Criando Coleção Completa {#coleção}

### **Estrutura Recomendada:**

```
📁 Mercado Livre API
│
├── 📂 User
│   └── GET User Info
│
├── 📂 Products
│   ├── GET Items - Active
│   ├── GET Items - Paused
│   ├── GET Item Details
│   └── PUT Update Item Price
│
├── 📂 Orders
│   ├── GET Orders - Recent
│   ├── GET Orders - Pending
│   └── GET Order Details
│
├── 📂 Questions
│   ├── GET Questions - Unanswered
│   ├── GET Questions - All
│   └── POST Answer Question
│
└── 📂 Notifications
    └── GET My Feeds
```

---

### **Como Organizar:**

1. **Crie pastas** dentro da collection:
   - Clique com botão direito na collection
   - "Add folder"
   - Nomeie: "User", "Products", etc.

2. **Mova requests** para as pastas correspondentes:
   - Arraste e solte cada request na pasta correta

3. **Adicione descrições** em cada request:
   - Aba "Documentation"
   - Explique o que a API faz

---

## 6. 🎯 Dicas Avançadas do Postman

### **6.1 - Pre-request Scripts (Token Automático)**

Se o token expirar, você pode automatizar a renovação:

```javascript
// Na aba "Pre-request Script" da Collection
pm.sendRequest({
    url: 'https://mercaflow.vercel.app/api/ml/debug-token',
    method: 'GET',
    header: {
        'Cookie': 'sb-access-token=SEU_COOKIE'
    }
}, function (err, response) {
    if (!err) {
        const data = response.json();
        pm.environment.set("ml_token", data.token.access_token);
    }
});
```

---

### **6.2 - Tests (Validação Automática)**

Adicione na aba "Tests" para verificar respostas:

```javascript
// Verificar se retornou 200 OK
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Verificar se tem o campo 'id'
pm.test("Response has id field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
});

// Salvar user_id automaticamente
var jsonData = pm.response.json();
pm.environment.set("ml_user_id", jsonData.id);
```

---

### **6.3 - Coleção Runner (Testes em Batch)**

1. **Clique em "Runner"** (ícone de play no topo)

2. **Selecione** a collection "Mercado Livre API"

3. **Configure:**
   - Environment: ML Production
   - Iterations: 1
   - Delay: 500ms

4. **Run** 🚀

**Resultado:** Testa todas as APIs de uma vez!

---

### **6.4 - Exportar Collection (Backup)**

1. **Clique com botão direito** na collection

2. **Export**

3. **Formato:** Collection v2.1 (recommended)

4. **Salve** como `mercadolibre-api.postman_collection.json`

**Uso:** Compartilhar com time ou fazer backup.

---

## 7. ⚠️ Troubleshooting {#troubleshooting}

### **Erro: 401 Unauthorized**

**Causa:** Token inválido ou expirado

**Solução:**
1. Vá em https://mercaflow.vercel.app/admin/ml-token
2. Copie o novo token
3. Atualize a variável `ml_token` no Postman
4. Tente novamente

---

### **Erro: 404 Not Found**

**Causa:** URL errada ou ID de produto/pedido inválido

**Solução:**
1. Verifique se a URL está correta
2. Confirme se o ID existe (use `/items/search` antes)
3. Veja a documentação: https://developers.mercadolibre.com.br/

---

### **Erro: 429 Too Many Requests**

**Causa:** Excedeu limite de rate (requests por minuto)

**Solução:**
1. Aguarde 1 minuto
2. Adicione delays entre requests (500ms-1s)
3. Use Collection Runner com delay configurado

---

### **Erro: 403 Forbidden**

**Causa:** Sem permissão para acessar esse recurso

**Solução:**
1. Verifique se o token tem os scopes necessários
2. Alguns endpoints exigem permissões especiais
3. Reconecte a integração ML se necessário

---

### **Erro: Network Error / Timeout**

**Causa:** Problema de conexão ou API do ML fora

**Solução:**
1. Verifique sua internet
2. Teste em: https://api.mercadolibre.com/sites/MLB
3. Veja status: https://status.mercadolibre.com/

---

## 8. 📚 Recursos Adicionais

### **Documentação Oficial ML:**
- API Docs: https://developers.mercadolibre.com.br/pt_br/api-docs
- Autenticação: https://developers.mercadolibre.com.br/pt_br/autenticacao-e-autorizacao
- SDKs: https://developers.mercadolibre.com.br/pt_br/suporte

### **Postman Learning:**
- Docs: https://learning.postman.com/docs/
- Tutorials: https://www.youtube.com/@postman
- Community: https://community.postman.com/

### **MercaFlow Docs:**
- ML Integration: `docs/pt/ML_INTEGRATION.md`
- API Testing: `docs/pt/API_TESTING.md`
- Token Guide: `GUIA_ML_TOKEN_TESTER.md`

---

## 9. 🎓 Exercícios Práticos

### **Exercício 1: Buscar Produtos por Categoria**

**Desafio:** Liste seus produtos filtrados por categoria

**Endpoint:** `GET /users/me/items/search?category=MLB1234`

**Dicas:**
1. Primeiro, descubra suas categorias com `/users/me/items/search`
2. Pegue um `category_id` da resposta
3. Filtre usando `?category=CATEGORY_ID`

---

### **Exercício 2: Atualizar Preço de Produto**

**Desafio:** Mudar o preço de um produto

**Endpoint:** `PUT /items/{item_id}`

**Body:**
```json
{
  "price": 29.90
}
```

**Dicas:**
1. Use um ID de produto real
2. Método: PUT
3. Header: `Content-Type: application/json`

---

### **Exercício 3: Buscar Pedidos Pendentes**

**Desafio:** Listar apenas pedidos com pagamento pendente

**Endpoint:** `GET /orders/search?seller=me&order.status=payment_required`

**Dicas:**
1. Use filtro `order.status=payment_required`
2. Veja outros status disponíveis na doc
3. Combine com `sort=date_desc`

---

## 10. ✅ Checklist de Configuração

Antes de começar a testar:

- [ ] Postman instalado e logado
- [ ] Token ML copiado de `/admin/ml-token`
- [ ] Environment "ML Production" criado
- [ ] Variável `ml_token` configurada
- [ ] Variável `ml_base_url` configurada
- [ ] Collection "Mercado Livre API" criada
- [ ] Primeira request "GET User Info" testada
- [ ] Status 200 OK recebido
- [ ] User ID salvo em variável

**Tudo OK?** Você está pronto para testar todas as APIs! 🚀

---

## 11. 🎯 Próximos Passos

Depois de dominar o básico:

1. **Automatize testes** com Collection Runner
2. **Configure monitores** para alertas de falha
3. **Integre com CI/CD** via Newman (CLI do Postman)
4. **Crie mock servers** para desenvolvimento
5. **Documente APIs** com Postman Docs

---

**Última atualização:** 2025-10-20  
**Versão:** 1.0.0  
**Autor:** MercaFlow Team

---

## 📞 Suporte

Dúvidas? Problemas?

- GitHub Issues: https://github.com/antoniovbraz/mercaflow/issues
- Docs: `/docs/pt/`
- Admin Tools: https://mercaflow.vercel.app/admin

**Happy Testing!** 🚀✨
