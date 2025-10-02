# 🤖 AI-FRIENDLY DOCUMENTATION STANDARDS

## Padrões de Documentação para Desenvolvimento com IA - Merca Flow

**Versão**: 1.0  
**Data**: 01/10/2025  
**Objetivo**: Documentação otimizada para desenvolvimento com IA  
**Escopo**: Todos os componentes da plataforma Merca Flow

---

## 🎯 FILOSOFIA DE DOCUMENTAÇÃO

### Princípios Fundamentais

1. **Context-Complete**: Cada documento deve ser autocontido
2. **AI-Parseable**: Estrutura clara e consistente para AIs
3. **Example-Driven**: Sempre mostrar implementação junto com teoria
4. **Relationship-Explicit**: Dependências e conexões claramente definidas
5. **Update-Friendly**: Fácil de manter e evoluir

### Estrutura Hierárquica

```
PROJECT_SOT.md (Visão Geral)
├── SUPER_ADMIN_SETUP.md (Configuração Admin)
├── API_DOCUMENTATION.md (APIs)
├── COMPONENT_LIBRARY.md (Componentes React)
├── DATABASE_SCHEMA.md (Banco de Dados)
└── DEPLOYMENT_GUIDE.md (Deploy e DevOps)
```

---

## 📋 TEMPLATES PARA IA

### 1. Template para Desenvolvimento de Componentes

```markdown
# Component Development Request

## 🎯 CONTEXT
**Project**: Merca Flow SaaS Platform
**Tech Stack**: Next.js 14 + Supabase + TypeScript + Tailwind CSS
**Architecture**: Multi-tenant showcase vitrine for ML sellers
**Component Type**: [React Component | API Route | Edge Function | Database Migration]

## 📋 REQUIREMENTS

### Functional Requirements
1. [Specific functionality requirement]
2. [Another requirement with clear acceptance criteria]
3. [Business rule that must be implemented]

### Non-Functional Requirements
- **Performance**: [specific performance requirement]
- **Security**: [security considerations]
- **Accessibility**: [a11y requirements]
- **Mobile**: [mobile-specific requirements]

## 🔗 DEPENDENCIES

### Database Tables
- `table_name` (columns: id, name, created_at)
- `related_table` (relationship: foreign key)

### External APIs
- **Mercado Libre API**: [specific endpoints used]
- **OpenAI API**: [for AI features]

### Internal Services
- `service_name`: [purpose and interaction]

### React Components
- `ComponentName`: [how it's used]

## 📤 EXPECTED OUTPUT

### Code Requirements
- [ ] Full TypeScript implementation with explicit types
- [ ] Comprehensive error handling with try/catch
- [ ] Loading and empty states handled
- [ ] Responsive design (mobile-first)
- [ ] Accessibility attributes included
- [ ] JSDoc comments for all functions

### Testing Requirements
- [ ] Unit tests with Jest/Testing Library
- [ ] Integration tests for API calls
- [ ] Error scenario testing
- [ ] Performance testing if applicable

### Documentation Requirements
- [ ] Component props documented
- [ ] Usage examples provided
- [ ] API contracts documented
- [ ] Database changes documented

## 🎨 CODE STYLE GUIDE

### TypeScript
```typescript
// Use explicit typing, avoid 'any'
interface ComponentProps {
  /** Description of prop with example */
  propName: string
  /** Optional prop with default */
  optionalProp?: boolean
}

// Use descriptive variable names
const isLoadingUserData = true
const userAccountBalance = 100.50

// Use async/await over promises
const fetchUserData = async (userId: string): Promise<User> => {
  try {
    const response = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (response.error) throw response.error
    return response.data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw new Error('Failed to fetch user data')
  }
}
```

### React Components
```typescript
// Use functional components with hooks
export const ComponentName: React.FC<ComponentProps> = ({
  propName,
  optionalProp = false
}) => {
  // State management
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Effects with dependencies
  useEffect(() => {
    // Side effect logic
  }, [dependency])
  
  // Event handlers
  const handleAction = useCallback(async () => {
    setIsLoading(true)
    try {
      // Action logic
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [dependency])
  
  // Render with conditional states
  return (
    <div className="component-wrapper">
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {/* Main content */}
    </div>
  )
}
```

## 🔒 SECURITY CHECKLIST
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens where needed
- [ ] Rate limiting for APIs
- [ ] Proper authentication checks
- [ ] Data sanitization

## 📱 RESPONSIVE DESIGN
- [ ] Mobile-first approach
- [ ] Breakpoints: 320px, 768px, 1024px, 1440px
- [ ] Touch-friendly interactive elements
- [ ] Readable text sizes on all devices
- [ ] Proper spacing and layout

## 🧪 TESTING STRATEGY
```typescript
// Example test structure
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  })

  it('should render correctly with required props', () => {
    // Test implementation
  })

  it('should handle loading state', () => {
    // Test loading behavior
  })

  it('should handle error state', () => {
    // Test error handling
  })

  it('should call API with correct parameters', () => {
    // Test API integration
  })
})
```
```

### 2. Template para Desenvolvimento de APIs

```markdown
# API Development Request

## 🎯 CONTEXT
**Endpoint**: `[METHOD] /api/endpoint-name`
**Purpose**: [Clear description of what this API does]
**Authentication**: [Required auth level: public, authenticated, admin]
**Rate Limiting**: [Rate limit requirements]

## 📋 REQUEST SPECIFICATION

### HTTP Method & URL
```
POST /api/tenants/{tenantId}/products
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-Tenant-ID: {tenant_id}
```

### Request Body
```typescript
interface CreateProductRequest {
  /** Product title from ML */
  title: string
  /** ML item ID */
  ml_item_id: string
  /** Product price in cents */
  price: number
  /** Available quantity */
  stock: number
  /** Product category */
  category: string
  /** Product images URLs */
  images: string[]
}
```

### Query Parameters
```typescript
interface QueryParams {
  /** Page number for pagination */
  page?: number
  /** Items per page (max 100) */
  limit?: number
  /** Filter by category */
  category?: string
}
```

## 📤 RESPONSE SPECIFICATION

### Success Response (200)
```typescript
interface CreateProductResponse {
  /** Operation success status */
  success: true
  /** Created product data */
  data: {
    id: string
    title: string
    ml_item_id: string
    price: number
    stock: number
    category: string
    images: string[]
    created_at: string
    updated_at: string
  }
  /** Response metadata */
  meta: {
    tenant_id: string
    created_by: string
  }
}
```

### Error Responses
```typescript
// 400 - Bad Request
interface BadRequestResponse {
  success: false
  error: {
    code: 'VALIDATION_ERROR'
    message: 'Invalid request data'
    details: {
      field: string
      message: string
    }[]
  }
}

// 401 - Unauthorized
interface UnauthorizedResponse {
  success: false
  error: {
    code: 'UNAUTHORIZED'
    message: 'Invalid or missing authentication token'
  }
}

// 403 - Forbidden
interface ForbiddenResponse {
  success: false
  error: {
    code: 'FORBIDDEN'
    message: 'Insufficient permissions for this resource'
  }
}

// 500 - Internal Server Error
interface ServerErrorResponse {
  success: false
  error: {
    code: 'INTERNAL_ERROR'
    message: 'An unexpected error occurred'
    request_id: string
  }
}
```

## 🔧 IMPLEMENTATION REQUIREMENTS

### Input Validation
```typescript
import { z } from 'zod'

const createProductSchema = z.object({
  title: z.string().min(3).max(255),
  ml_item_id: z.string().regex(/^MLB\d+$/),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  category: z.string().min(1),
  images: z.array(z.string().url()).max(10)
})
```

### Database Operations
```typescript
// Create product in database
const { data, error } = await supabase
  .from('products')
  .insert({
    ...validatedData,
    tenant_id: tenantId,
    created_by: userId
  })
  .select()
  .single()
```

### Error Handling
```typescript
try {
  // Main logic
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.errors
      }
    }, { status: 400 })
  }
  
  console.error('API Error:', error)
  return NextResponse.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      request_id: crypto.randomUUID()
    }
  }, { status: 500 })
}
```

## 🧪 TESTING REQUIREMENTS

### Unit Tests
```typescript
describe('POST /api/tenants/[tenantId]/products', () => {
  it('should create product with valid data', async () => {
    // Test successful creation
  })
  
  it('should return 400 for invalid data', async () => {
    // Test validation errors
  })
  
  it('should return 401 for missing auth', async () => {
    // Test authentication
  })
  
  it('should return 403 for wrong tenant', async () => {
    // Test authorization
  })
})
```

### Integration Tests
```typescript
describe('Product API Integration', () => {
  it('should create and retrieve product', async () => {
    // Test full flow
  })
  
  it('should sync with ML API', async () => {
    // Test external API integration
  })
})
```

## 📚 DOCUMENTATION REQUIREMENTS

### OpenAPI Specification
```yaml
/api/tenants/{tenantId}/products:
  post:
    summary: Create a new product
    description: Creates a new product for the specified tenant
    parameters:
      - name: tenantId
        in: path
        required: true
        schema:
          type: string
          format: uuid
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/CreateProductRequest'
    responses:
      '200':
        description: Product created successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateProductResponse'
```
```

### 3. Template para Desenvolvimento de Database

```markdown
# Database Development Request

## 🎯 CONTEXT
**Operation**: [CREATE TABLE | ALTER TABLE | CREATE INDEX | CREATE POLICY]
**Purpose**: [Business purpose of this database change]
**Impact**: [Performance, storage, security implications]

## 📋 SCHEMA REQUIREMENTS

### Table Definition
```sql
-- =================================================================
-- TABLE: table_name
-- PURPOSE: [Business purpose and context]
-- RELATIONSHIPS: 
--   - Belongs to: parent_table (foreign_key_column)
--   - Has many: child_table (child_foreign_key)
-- RLS: [Enabled/Disabled] - Row Level Security status
-- POLICIES: [List of RLS policy names]
-- =================================================================

CREATE TABLE table_name (
  -- Primary key (always UUID for multi-tenant)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign keys with explicit relationships and cascading
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Business columns with constraints
  name VARCHAR(255) NOT NULL CHECK (length(name) >= 3),
  email VARCHAR(255) UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  status status_enum NOT NULL DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  
  -- Audit columns (always include)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);
```

### Indexes
```sql
-- =================================================================
-- INDEXES FOR: table_name
-- =================================================================

-- Primary index for tenant isolation (REQUIRED for RLS performance)
CREATE INDEX idx_table_name_tenant_id ON table_name(tenant_id);

-- Composite index for common queries
CREATE INDEX idx_table_name_status_created ON table_name(status, created_at DESC) 
WHERE status = 'active';

-- Partial index for performance optimization
CREATE INDEX idx_table_name_email ON table_name(email) 
WHERE email IS NOT NULL;

-- Full-text search index
CREATE INDEX idx_table_name_search ON table_name 
USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(description, '')));
```

### Row Level Security
```sql
-- =================================================================
-- RLS POLICIES FOR: table_name
-- =================================================================

-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Policy: Tenant isolation (users can only see their tenant's data)
CREATE POLICY "tenant_isolation" ON table_name
  FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_user_id = auth.uid()
      UNION
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

-- Policy: Super admin bypass (platform owners see everything)
CREATE POLICY "super_admin_bypass" ON table_name
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_owners 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Policy: Read-only access for viewers
CREATE POLICY "viewer_read_only" ON table_name
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND role = 'viewer'
    )
  );
```

### Triggers
```sql
-- =================================================================
-- TRIGGERS FOR: table_name
-- =================================================================

-- Trigger: Update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_table_name_updated_at 
  BEFORE UPDATE ON table_name 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Audit log for sensitive operations
CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, operation, old_data, new_data, user_id)
  VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER audit_table_name_changes
  AFTER INSERT OR UPDATE OR DELETE ON table_name
  FOR EACH ROW EXECUTE FUNCTION audit_table_changes();
```

## 🔧 MIGRATION REQUIREMENTS

### Migration File Structure
```typescript
// migrations/YYYYMMDD_HHMMSS_create_table_name.sql

-- Migration: Create table_name
-- Description: [Purpose of this migration]
-- Dependencies: [List of dependent tables/migrations]

BEGIN;

-- Create the table
CREATE TABLE table_name (
  -- Table definition here
);

-- Create indexes
-- Index definitions here

-- Enable RLS and create policies
-- RLS and policy definitions here

-- Create triggers
-- Trigger definitions here

-- Insert seed data if needed
INSERT INTO table_name (id, name, tenant_id) VALUES
  (gen_random_uuid(), 'Default Item', '00000000-0000-0000-0000-000000000000');

COMMIT;
```

### Rollback Strategy
```sql
-- rollback/YYYYMMDD_HHMMSS_rollback_create_table_name.sql

BEGIN;

-- Drop triggers
DROP TRIGGER IF EXISTS audit_table_name_changes ON table_name;
DROP TRIGGER IF EXISTS update_table_name_updated_at ON table_name;

-- Drop policies
DROP POLICY IF EXISTS "tenant_isolation" ON table_name;
DROP POLICY IF EXISTS "super_admin_bypass" ON table_name;

-- Drop indexes
DROP INDEX IF EXISTS idx_table_name_tenant_id;
DROP INDEX IF EXISTS idx_table_name_status_created;

-- Drop table
DROP TABLE IF EXISTS table_name;

COMMIT;
```

## 🧪 TESTING REQUIREMENTS

### Database Tests
```typescript
describe('table_name Database Operations', () => {
  beforeEach(async () => {
    // Setup test data
    await setupTestTenant()
  })

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestData()
  })

  it('should create record with valid data', async () => {
    // Test record creation
  })

  it('should enforce tenant isolation', async () => {
    // Test RLS policies
  })

  it('should update updated_at on changes', async () => {
    // Test triggers
  })

  it('should maintain referential integrity', async () => {
    // Test foreign key constraints
  })
})
```

## 📊 PERFORMANCE CONSIDERATIONS

### Query Optimization
```sql
-- Example of optimized query with proper indexing
EXPLAIN ANALYZE SELECT * FROM table_name 
WHERE tenant_id = $1 AND status = 'active' 
ORDER BY created_at DESC 
LIMIT 20;

-- Should use: Index Scan on idx_table_name_status_created
-- Should NOT use: Seq Scan
```

### Monitoring Queries
```sql
-- Query to monitor table performance
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch
FROM pg_stat_user_tables 
WHERE tablename = 'table_name';
```
```

---

## 🛠️ FERRAMENTAS DE DESENVOLVIMENTO

### 1. Scripts de Geração Automática

```bash
#!/bin/bash
# scripts/generate-component.sh

COMPONENT_NAME=$1
COMPONENT_TYPE=$2  # component|api|database

echo "Generating $COMPONENT_TYPE: $COMPONENT_NAME"

case $COMPONENT_TYPE in
  "component")
    cp templates/component.template.tsx "components/$COMPONENT_NAME.tsx"
    cp templates/component.template.test.tsx "components/__tests__/$COMPONENT_NAME.test.tsx"
    cp templates/component.template.stories.tsx "components/$COMPONENT_NAME.stories.tsx"
    ;;
  "api")
    cp templates/api.template.ts "pages/api/$COMPONENT_NAME.ts"
    cp templates/api.template.test.ts "pages/api/__tests__/$COMPONENT_NAME.test.ts"
    ;;
  "database")
    DATE=$(date +%Y%m%d_%H%M%S)
    cp templates/migration.template.sql "migrations/${DATE}_create_${COMPONENT_NAME}.sql"
    cp templates/rollback.template.sql "rollbacks/${DATE}_rollback_create_${COMPONENT_NAME}.sql"
    ;;
esac

echo "Generated $COMPONENT_TYPE files for $COMPONENT_NAME"
echo "Don't forget to update documentation!"
```

### 2. Linting para Documentação

```json
// .markdownlint.json
{
  "MD013": false,
  "MD033": false,
  "MD036": false,
  "MD041": false,
  "MD034": false
}
```

### 3. VS Code Snippets

```json
// .vscode/snippets.json
{
  "AI Component Request": {
    "prefix": "ai-component",
    "body": [
      "# Component Development Request",
      "",
      "## 🎯 CONTEXT",
      "**Project**: Merca Flow SaaS Platform",
      "**Tech Stack**: Next.js 14 + Supabase + TypeScript + Tailwind CSS",
      "**Component Type**: ${1:React Component}",
      "",
      "## 📋 REQUIREMENTS",
      "1. ${2:Requirement 1}",
      "2. ${3:Requirement 2}",
      "",
      "## 🔗 DEPENDENCIES",
      "- ${4:Dependencies}",
      "",
      "## 📤 EXPECTED OUTPUT",
      "- [ ] TypeScript implementation",
      "- [ ] Error handling",
      "- [ ] Unit tests",
      "- [ ] Documentation"
    ],
    "description": "Template for AI component development request"
  }
}
```

---

## 📈 MÉTRICAS DE QUALIDADE

### Checklist de Documentação

- [ ] **Completude**: Todas as seções preenchidas
- [ ] **Clareza**: Linguagem clara e sem ambiguidade
- [ ] **Exemplos**: Código de exemplo fornecido
- [ ] **Dependências**: Todas as dependências listadas
- [ ] **Testes**: Estratégia de testes documentada
- [ ] **Segurança**: Considerações de segurança incluídas
- [ ] **Performance**: Requisitos de performance especificados
- [ ] **Manutenção**: Como manter e atualizar

### Métricas de Sucesso

1. **Tempo de Desenvolvimento**: Redução de 40% no tempo de desenvolvimento
2. **Qualidade do Código**: Menos bugs em produção
3. **Consistência**: Padrões seguidos em 100% dos componentes
4. **Manutenibilidade**: Facilidade para fazer alterações
5. **Onboarding**: Novos desenvolvedores produtivos em menos tempo

---

## 🚀 IMPLEMENTAÇÃO

### Fase 1: Setup Inicial (Semana 1)
- [ ] Criar templates de documentação
- [ ] Configurar snippets no VS Code
- [ ] Treinar equipe nos novos padrões

### Fase 2: Migração (Semanas 2-4)
- [ ] Migrar documentação existente
- [ ] Atualizar processos de desenvolvimento
- [ ] Implementar automações

### Fase 3: Otimização (Semana 5+)
- [ ] Coletar feedback da equipe
- [ ] Refinar templates baseado no uso
- [ ] Automatizar ainda mais processos

---

*Esta estrutura de documentação garante que qualquer IA possa entender completamente o contexto do projeto e gerar código de alta qualidade de forma consistente.*