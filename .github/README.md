# 📐 Padrões de Código - MercaFlow

## Visão Geral

Este diretório contém os **padrões de código oficiais** do MercaFlow para garantir qualidade, segurança e consistência em toda a base de código.

## 📚 Documentos Disponíveis

### 1. [copilot-standards-general.md](./copilot-standards-general.md)

**Aplica-se a:** Todos os arquivos (`**/*`)

Padrões gerais que se aplicam a todo o projeto:

- ✅ Princípios de segurança
- ✅ Arquitetura multi-tenant
- ✅ Convenções de nomenclatura
- ✅ Estrutura de diretórios
- ✅ Mensagens de commit
- ✅ Variáveis de ambiente
- ✅ Padrões de português brasileiro
- ✅ Git workflow
- ✅ Code review

### 2. [copilot-standards-typescript.md](./copilot-standards-typescript.md)

**Aplica-se a:** Arquivos TypeScript e React (`**/*.ts`, `**/*.tsx`)

Padrões específicos para código TypeScript e React:

- ✅ Type definitions e interfaces
- ✅ Null safety
- ✅ Componentes React funcionais
- ✅ Hooks patterns
- ✅ Server vs Client Components
- ✅ Event handlers
- ✅ Styling com Tailwind
- ✅ Validação de formulários
- ✅ Padrões específicos do MercaFlow (Supabase, ML API)

### 3. [copilot-instructions.md](./copilot-instructions.md)

**Aplica-se a:** Referência técnica completa

Guia técnico abrangente para desenvolvimento:

- ✅ Arquitetura do projeto
- ✅ Padrões críticos de implementação
- ✅ Workflows de integração
- ✅ Debugging e testes

## 🤖 Como o GitHub Copilot Usa Esses Padrões

O GitHub Copilot lê automaticamente os arquivos com frontmatter `applyTo` e aplica os padrões aos arquivos correspondentes:

```markdown
---
applyTo: "**/*.ts,**/*.tsx"
---

# Seus padrões aqui
```

### Quando os Padrões São Aplicados

- ✅ Ao escrever código novo
- ✅ Ao fazer refatoração
- ✅ Ao revisar código existente
- ✅ Ao responder perguntas sobre o projeto

### Exemplo de Uso

Quando você escreve:

```typescript
// Pedir ao Copilot: "Criar componente de produto"
```

O Copilot aplicará automaticamente:

- Padrões gerais de segurança e multi-tenancy
- Padrões TypeScript (interfaces, tipos)
- Padrões React (functional components, hooks)
- Convenções de nomenclatura
- Validação com Zod
- Logging estruturado

## 📖 Lendo os Padrões

### Para Desenvolvedores Iniciantes

1. **Comece com:** `copilot-standards-general.md`

   - Leia as seções: "Core Principles" e "File Organization"
   - Entenda os princípios de segurança e multi-tenancy

2. **Depois leia:** `copilot-standards-typescript.md`

   - Foque na seção "Component Structure"
   - Veja exemplos de ✅ Good vs ❌ Bad

3. **Consulte quando necessário:** `copilot-instructions.md`
   - Use como referência técnica
   - Busque padrões específicos (Ctrl+F)

### Para Desenvolvedores Experientes

- Use como referência rápida
- Revise seções específicas conforme necessário
- Contribua com melhorias via PR

## 🎯 Principais Regras a Memorizar

### Segurança

```typescript
// ❌ NUNCA use service role em operações de usuário
// ❌ NUNCA confie em dados do cliente sem validação
// ✅ SEMPRE valide com Zod schemas
// ✅ SEMPRE respeite RLS policies
```

### Multi-tenancy

```typescript
// ✅ SEMPRE obtenha tenant_id antes de operações
const tenantId = await getCurrentTenantId();

// ✅ SEMPRE valide acesso ao recurso
if (resource.tenant_id !== tenantId) {
  throw new Error("Access denied");
}
```

### Supabase Clients

```typescript
// Server Component
import { createClient } from "@/utils/supabase/server";
const supabase = await createClient(); // Note o await!

// Client Component
import { createClient } from "@/utils/supabase/client";
const supabase = createClient(); // Sem await
```

### TypeScript

```typescript
// ✅ Use interfaces para objetos
interface Product {
  /* ... */
}

// ✅ Use types para unions
type Status = "active" | "inactive";

// ✅ Evite any, prefira unknown
function handleError(error: unknown) {
  /* ... */
}
```

### React

```typescript
// ✅ Componentes funcionais
export function Component({ prop }: Props) {
  /* ... */
}

// ✅ Hooks no topo, sem condicionais
const [state, setState] = useState();

// ✅ Tipagem explícita de eventos
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  /* ... */
};
```

## 🔍 Exemplos Práticos

### Criar um Componente

```typescript
// 1. Defina a interface
interface ProductCardProps {
  product: Product;
  onEdit?: (id: string) => void;
}

// 2. Componente funcional
export function ProductCard({ product, onEdit }: ProductCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      {onEdit && <button onClick={() => onEdit(product.id)}>Editar</button>}
    </div>
  );
}
```

### Criar uma API Route

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/supabase/server";
import { getCurrentTenantId } from "@/utils/supabase/tenancy";
import { logger } from "@/utils/logger";

export async function GET(request: NextRequest) {
  try {
    // 1. Auth check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Tenant context
    const tenantId = await getCurrentTenantId();

    // 3. Business logic
    const products = await getProducts(tenantId);

    // 4. Success response
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    logger.error("API error", { error, endpoint: "/api/products" });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### Integração Mercado Livre

```typescript
import { MLTokenManager } from "@/utils/mercadolivre/token-manager";
import { validateOutput, MLItemSchema } from "@/utils/validation";

async function syncProducts(integrationId: string) {
  const tokenManager = new MLTokenManager();
  const token = await tokenManager.getValidToken(integrationId);

  const response = await fetch("https://api.mercadolibre.com/...", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  return validateOutput(MLItemSchema, data);
}
```

## ✅ Checklist de Code Review

Use este checklist ao revisar PRs:

- [ ] **Segurança**: Service role não usado em frontend?
- [ ] **Multi-tenancy**: Tenant validation implementada?
- [ ] **Types**: TypeScript strict mode respeitado?
- [ ] **Validation**: Zod schemas para inputs externos?
- [ ] **Error Handling**: Try/catch com logging estruturado?
- [ ] **Naming**: Convenções seguidas (PascalCase, kebab-case)?
- [ ] **Imports**: Organizados corretamente?
- [ ] **Portuguese**: Texto do usuário em pt-BR?
- [ ] **Tests**: Testes adicionados/atualizados?
- [ ] **Documentation**: Comentários JSDoc quando necessário?

## 🛠️ Ferramentas de Suporte

### TypeScript

```bash
npm run type-check  # Validar tipos
```

### ESLint

```bash
npm run lint       # Validar código
```

### Prettier

```bash
npm run format     # Formatar código (se configurado)
```

## 📝 Contribuindo

Para melhorar esses padrões:

1. Identifique um problema ou oportunidade de melhoria
2. Crie uma branch: `git checkout -b docs/improve-standards`
3. Edite os arquivos relevantes
4. Faça commit: `git commit -m "docs: improve X standard"`
5. Abra um PR com justificativa

## 🆘 Dúvidas?

- 📖 Leia os documentos completos
- 💬 Pergunte no canal de desenvolvimento
- 🐛 Abra uma issue para ambiguidades
- 📚 Consulte o código existente como referência

---

**Última atualização:** Outubro 2025  
**Versão:** 1.0.0  
**Mantenedor:** Equipe MercaFlow
