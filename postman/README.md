# 📬 Postman Collection - Mercado Livre API

Collection completa e pronta para importar no Postman com todos os endpoints do Mercado Livre.

---

## 🚀 Quick Start (3 Passos)

### **1. Importar Collection**

1. **Abra o Postman**
2. **Clique em "Import"** (canto superior esquerdo)
3. **Arraste** o arquivo `MercadoLivre-API.postman_collection.json`
4. **Clique "Import"**

✅ Collection "Mercado Livre API - MercaFlow" criada!

---

### **2. Importar Environment**

1. **Clique no ícone de engrenagem** ⚙️ (Manage Environments)
2. **Clique "Import"**
3. **Arraste** o arquivo `ML-Production.postman_environment.json`
4. **Clique "Import"**

✅ Environment "ML Production" criado!

---

### **3. Configurar Token**

1. **Obtenha seu token:**
   - Acesse: https://mercaflow.vercel.app/admin/ml-token
   - Clique em "Copiar Token"

2. **Configure no Postman:**
   - Selecione environment "ML Production" (dropdown no canto superior direito)
   - Clique no ícone de olho 👁️ ao lado
   - Clique em "Edit"
   - Cole o token no campo `ml_token`
   - Atualize `ml_user_id` com seu ID (se diferente)
   - Salve

✅ Pronto para testar!

---

## 📁 Estrutura da Collection

```
📁 Mercado Livre API - MercaFlow
│
├── 📂 User
│   └── GET User Info
│
├── 📂 Products
│   ├── GET Items - Active
│   ├── GET Item Details
│   └── PUT Update Item Price
│
├── 📂 Orders
│   ├── GET Orders - Recent
│   ├── GET Orders - Pending Payment
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

**Total:** 11 requests prontas para usar!

---

## 🧪 Como Testar

### **Teste Individual:**

1. **Selecione** uma request (ex: "GET User Info")
2. **Clique "Send"** 🚀
3. **Veja o resultado** na aba "Response"

**Status esperado:** 200 OK ✅

---

### **Teste em Batch (Todas de Uma Vez):**

1. **Clique no ícone de play** ▶️ ("Runner")
2. **Selecione** a collection "Mercado Livre API"
3. **Configure:**
   - Environment: ML Production
   - Iterations: 1
   - Delay: 500ms (delay entre requests)
4. **Clique "Run Mercado Livre API"** 🚀

**Resultado:** Testa todos os 11 endpoints automaticamente!

---

## 🔧 Variáveis de Environment

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `ml_base_url` | URL base da API ML | `https://api.mercadolibre.com` |
| `ml_token` | Access token do ML | `TG-67351d82e4b0ca...` |
| `ml_user_id` | Seu user ID no ML | `669073070` |

**Editar:** Environments → ML Production → Edit

---

## 📝 Endpoints Incluídos

### **User**

- ✅ `GET /users/me` - Informações do usuário autenticado

### **Products**

- ✅ `GET /users/me/items/search` - Lista produtos ativos
- ✅ `GET /items/{id}` - Detalhes de produto
- ✅ `PUT /items/{id}` - Atualizar preço/estoque

### **Orders**

- ✅ `GET /orders/search` - Buscar pedidos
- ✅ `GET /orders/search?order.status=payment_required` - Pedidos pendentes
- ✅ `GET /orders/{id}` - Detalhes de pedido

### **Questions**

- ✅ `GET /my/received_questions/search?status=UNANSWERED` - Perguntas não respondidas
- ✅ `GET /my/received_questions/search` - Todas as perguntas
- ✅ `POST /answers` - Responder pergunta

### **Notifications**

- ✅ `GET /myfeeds` - Notificações recentes

---

## 🎯 Tests Automáticos Incluídos

Cada request vem com **tests automáticos** na aba "Tests":

### **User Info:**
```javascript
pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
});

pm.test('Response has id field', function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
});

// Salva user_id automaticamente
var jsonData = pm.response.json();
pm.collectionVariables.set('ml_user_id', jsonData.id);
```

**Resultado:** Valida resposta e salva dados automaticamente!

---

## ⚡ Dicas de Uso

### **1. Usar Variáveis nas URLs**

Em vez de:
```
https://api.mercadolibre.com/users/me
```

Use:
```
{{ml_base_url}}/users/me
```

**Vantagem:** Trocar de ambiente (dev/prod) facilmente.

---

### **2. Copiar como cURL**

1. **Clique com botão direito** na request
2. **"Code"** → **"cURL"**
3. **Copie** o comando

**Uso:** Testar no terminal ou compartilhar com time.

---

### **3. Salvar Responses**

1. **Envie a request**
2. **Clique "Save Response"** (aba Response)
3. **Salve como exemplo**

**Uso:** Documentar respostas esperadas.

---

### **4. Documentar Collection**

1. **Clique na collection**
2. **Aba "Documentation"**
3. **Clique "Publish"**

**Resultado:** Gera documentação pública automaticamente!

---

## 🔄 Atualizando o Token

O token ML expira **a cada 6 horas**. Para renovar:

### **Método Fácil:**

1. Acesse: https://mercaflow.vercel.app/admin/ml-token
2. Copie o novo token
3. No Postman:
   - Environment → ML Production → Edit
   - Cole novo token em `ml_token`
   - Save

### **Método Automático (Advanced):**

Adicione na aba **"Pre-request Script"** da collection:

```javascript
// Auto-refresh token via MercaFlow API
pm.sendRequest({
    url: 'https://mercaflow.vercel.app/api/ml/debug-token',
    method: 'GET',
    header: {
        'Cookie': 'sb-access-token=SEU_COOKIE_SUPABASE'
    }
}, function (err, response) {
    if (!err) {
        const data = response.json();
        pm.environment.set("ml_token", data.token.access_token);
        console.log('✅ Token atualizado automaticamente!');
    }
});
```

**Resultado:** Token renovado automaticamente antes de cada request!

---

## 📚 Recursos

### **Documentação:**
- **Guia Postman Completo:** `docs/POSTMAN_GUIDE.md`
- **ML API Docs:** https://developers.mercadolibre.com.br/pt_br/api-docs
- **Postman Learning:** https://learning.postman.com/

### **Ferramentas MercaFlow:**
- **ML Token Viewer:** https://mercaflow.vercel.app/admin/ml-token
- **API Tester:** https://mercaflow.vercel.app/admin/api-tester
- **Dashboard:** https://mercaflow.vercel.app/dashboard

---

## ⚠️ Troubleshooting

### **Erro: "Could not send request"**

**Solução:** Verifique se o environment "ML Production" está selecionado (dropdown superior direito).

---

### **Erro: 401 Unauthorized**

**Solução:** Token expirado. Renove em `/admin/ml-token`.

---

### **Erro: 404 Not Found**

**Solução:** Verifique se substituiu IDs de exemplo (ex: `MLB2015713558`) pelos seus IDs reais.

---

### **Erro: Variable "ml_token" not found**

**Solução:**
1. Selecione environment "ML Production"
2. Verifique se variável `ml_token` está configurada
3. Clique no ícone de olho 👁️ para verificar

---

## 🎓 Exercícios

### **Exercício 1: Buscar Seus Produtos**

1. Execute: `GET Items - Active`
2. Copie um `item_id` da resposta
3. Execute: `GET Item Details` com esse ID
4. Veja título, preço, vendas

---

### **Exercício 2: Atualizar Preço**

1. Escolha um produto
2. Execute: `PUT Update Item Price`
3. Mude o valor no body
4. Verifique se preço mudou no ML

---

### **Exercício 3: Responder Pergunta**

1. Execute: `GET Questions - Unanswered`
2. Copie um `question_id`
3. Execute: `POST Answer Question`
4. Substitua `question_id` e `text`
5. Verifique se resposta apareceu no ML

---

## 📦 Exportar/Compartilhar

### **Exportar Collection:**

1. Clique com botão direito na collection
2. **"Export"**
3. Formato: Collection v2.1
4. Salve como `.json`

### **Compartilhar com Time:**

1. **Export** collection e environment
2. Envie os 2 arquivos `.json`
3. Time importa no Postman deles
4. Atualizam o `ml_token` com token deles

---

## ✅ Checklist

Antes de testar:

- [ ] Postman instalado
- [ ] Collection importada
- [ ] Environment importado
- [ ] Token ML copiado de `/admin/ml-token`
- [ ] Variável `ml_token` configurada
- [ ] Environment "ML Production" selecionado
- [ ] Request "GET User Info" testada com sucesso (200 OK)

**Tudo OK?** Happy testing! 🚀

---

**Última atualização:** 2025-10-20  
**Versão:** 1.0.0
