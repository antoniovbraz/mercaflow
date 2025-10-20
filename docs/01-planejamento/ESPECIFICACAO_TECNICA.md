# 🚀 MercaFlow - Especificação Técnica Completa

## 📋 Visão Geral da Arquitetura

**MercaFlow** é uma plataforma SaaS enterprise-grade de gestão completa para Mercado Livre, que combina Next.js 15, Supabase, Vercel e ML API para criar um sistema multi-tenant com RBAC avançado, integração nativa e automação inteligente de processos.

### 🎯 Principais Características

- **Sistema Multi-Tenant** com isolamento completo de dados
- **RBAC Hierárquico** com 5 roles e 64 permissões granulares
- **Integração Nativa ML API** com OAuth 2.0 e webhooks em tempo real
- **IA para Otimização** de preços, títulos e análise competitiva
- **Arquitetura Enterprise** seguindo padrões oficiais mais avançados

---

## 🏗️ Stack Tecnológico

### Frontend & Backend

- **Next.js 15.5.4**: App Router com Server Components e SSR
- **TypeScript**: Strict mode para type safety completo
- **Tailwind CSS**: Styling moderno e responsivo
- **shadcn/ui**: Componentes UI padronizados

### Database & Authentication

- **Supabase**: PostgreSQL + Auth + RLS + Traditional RBAC
- **Row Level Security**: Isolamento automático de dados por tenant
- **Profile-based RBAC**: Sistema de roles robusto baseado em tabela profiles

### Deployment & Infrastructure

- **Vercel**: Deployment automático com GitHub integration
- **Edge Middleware**: Session management e route protection
- **Environment Variables**: Configuração segura multi-ambiente

### External APIs

- **Mercado Livre API**: OAuth 2.0 + Webhooks + REST endpoints
- **Rate Limiting**: Tratamento inteligente de 429 errors
- **Webhook Processing**: Processamento assíncrono de eventos

---

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação Híbrido

**1. Autenticação Supabase (Interna)**

- Email/senha para usuários da plataforma
- JWT tokens padrão com profile lookup para roles
- Session management via middleware

**2. OAuth 2.0 Mercado Livre (Externa)**

- Authorization Code Grant com PKCE
- Access tokens válidos por 6h, refresh tokens por 6 meses
- Scopes: read, write, offline_access

### Estrutura de Roles Hierárquicos

```typescript
enum UserRole {
  SUPER_ADMIN = "super_admin", // Nível 5: Acesso total sistema
  ADMIN = "admin", // Nível 4: Admin da empresa
  MANAGER = "manager", // Nível 3: Gerente departamento
  USER = "user", // Nível 2: Usuário padrão
  VIEWER = "viewer", // Nível 1: Somente visualização
}
```

### Sistema de Permissões (64 Granulares)

```typescript
const PERMISSIONS = {
  // Usuários (8 permissões)
  "users.create": "Criar usuários",
  "users.read": "Visualizar usuários",
  "users.update": "Editar usuários",
  "users.delete": "Deletar usuários",
  "users.list": "Listar usuários",
  "users.invite": "Convidar usuários",
  "users.roles.manage": "Gerenciar roles",
  "users.permissions.view": "Ver permissões",

  // Tenants (8 permissões)
  "tenants.create": "Criar tenants",
  "tenants.read": "Visualizar tenants",
  "tenants.update": "Editar tenants",
  "tenants.delete": "Deletar tenants",
  "tenants.list": "Listar tenants",
  "tenants.settings": "Configurar tenant",
  "tenants.billing": "Gerenciar cobrança",
  "tenants.analytics": "Ver analytics tenant",

  // ML Integration (16 permissões)
  "ml.auth.connect": "Conectar conta ML",
  "ml.auth.disconnect": "Desconectar conta ML",
  "ml.items.read": "Visualizar produtos",
  "ml.items.create": "Criar produtos",
  "ml.items.update": "Editar produtos",
  "ml.items.delete": "Deletar produtos",
  "ml.orders.read": "Visualizar vendas",
  "ml.orders.manage": "Gerenciar vendas",
  "ml.messages.read": "Ver mensagens",
  "ml.messages.send": "Enviar mensagens",
  "ml.analytics.basic": "Analytics básico",
  "ml.analytics.advanced": "Analytics avançado",
  "ml.webhooks.manage": "Gerenciar webhooks",
  "ml.catalog.access": "Acessar catálogo",
  "ml.pricing.suggestions": "Sugestões preço",
  "ml.competition.analysis": "Análise competitiva",

  // Dashboard & Reports (16 permissões)
  "dashboard.view": "Visualizar dashboard",
  "dashboard.customize": "Customizar dashboard",
  "reports.basic": "Relatórios básicos",
  "reports.advanced": "Relatórios avançados",
  "reports.export": "Exportar relatórios",
  "reports.schedule": "Agendar relatórios",
  "analytics.revenue": "Analytics receita",
  "analytics.performance": "Analytics performance",
  "analytics.customers": "Analytics clientes",
  "analytics.products": "Analytics produtos",
  "analytics.competition": "Analytics competição",
  "analytics.forecasting": "Previsões IA",
  "metrics.kpis": "KPIs principais",
  "metrics.custom": "Métricas customizadas",
  "alerts.create": "Criar alertas",
  "alerts.manage": "Gerenciar alertas",

  // System Admin (16 permissões)
  "system.logs.view": "Ver logs sistema",
  "system.logs.export": "Exportar logs",
  "system.health.monitor": "Monitorar saúde",
  "system.settings.global": "Configurações globais",
  "system.maintenance": "Modo manutenção",
  "system.backup.create": "Criar backups",
  "system.backup.restore": "Restaurar backups",
  "system.integrations.manage": "Gerenciar integrações",
  "system.webhooks.global": "Webhooks globais",
  "system.api.limits": "Limites API",
  "system.security.audit": "Auditoria segurança",
  "system.performance.tune": "Tuning performance",
  "system.database.admin": "Admin database",
  "system.cache.manage": "Gerenciar cache",
  "system.monitoring.alerts": "Alertas monitoramento",
  "system.feature.flags": "Feature flags",
};
```

---

## 🗄️ Schema do Banco de Dados

### Tabelas Core (Supabase Auth + Custom)

```sql
-- Profiles (extende auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'manager', 'user', 'viewer')) DEFAULT 'user',
  avatar_url TEXT,
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenants (multi-tenancy)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  settings JSONB DEFAULT '{}',
  subscription_plan TEXT DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ML Users (integração com Mercado Livre)
CREATE TABLE ml_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  ml_user_id BIGINT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  email TEXT,
  site_id TEXT NOT NULL, -- MLA, MLB, MLM, etc.
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT[] DEFAULT ARRAY['read', 'write', 'offline_access'],
  account_type TEXT, -- personal, professional
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, ml_user_id)
);

-- ML Items (produtos sincronizados)
CREATE TABLE ml_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ml_user_id UUID REFERENCES ml_users(id) NOT NULL,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  ml_item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category_id TEXT,
  price DECIMAL(12,2),
  available_quantity INTEGER,
  condition TEXT,
  listing_type_id TEXT,
  permalink TEXT,
  thumbnail TEXT,
  status TEXT, -- active, paused, closed
  sync_status TEXT DEFAULT 'pending', -- pending, synced, error
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, ml_item_id)
);

-- Webhooks Log (eventos do ML)
CREATE TABLE ml_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  ml_user_id UUID REFERENCES ml_users(id),
  topic TEXT NOT NULL,
  resource TEXT NOT NULL,
  application_id BIGINT NOT NULL,
  attempts INTEGER DEFAULT 1,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies (Row Level Security)

```sql
-- Profiles: usuários só veem próprio profile ou do mesmo tenant
CREATE POLICY "profiles_tenant_isolation" ON profiles
FOR ALL USING (
  id = auth.uid() OR
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- ML Users: isolamento por tenant
CREATE POLICY "ml_users_tenant_isolation" ON ml_users
FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- ML Items: isolamento por tenant
CREATE POLICY "ml_items_tenant_isolation" ON ml_items
FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- ML Webhooks: isolamento por tenant
CREATE POLICY "ml_webhooks_tenant_isolation" ON ml_webhooks
FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
```

---

## 🔌 Integração com Mercado Livre API

### OAuth 2.0 Flow Completo

```typescript
// 1. Redirect para autorização
const authUrl = `https://auth.mercadolivre.com.br/authorization?
  response_type=code&
  client_id=${ML_CLIENT_ID}&
  redirect_uri=${ML_REDIRECT_URI}&
  state=${secureState}&
  code_challenge=${codeChallenge}&
  code_challenge_method=S256`;

// 2. Callback handling
export async function POST(request: Request) {
  const { code, state } = await request.json();

  // Trocar code por tokens
  const tokenResponse = await fetch(
    "https://api.mercadolibre.com/oauth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: ML_CLIENT_ID,
        client_secret: ML_CLIENT_SECRET,
        redirect_uri: ML_REDIRECT_URI,
        code,
        code_verifier: codeVerifier,
      }),
    }
  );

  const tokens = await tokenResponse.json();

  // Salvar tokens no banco
  await saveMlUser({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expires_at: new Date(Date.now() + tokens.expires_in * 1000),
  });
}
```

### Webhook Processing System

```typescript
// Route handler para webhooks ML
export async function POST(request: Request) {
  const payload = await request.json();

  // Log webhook para processamento
  await supabase.from("ml_webhooks").insert({
    topic: payload.topic,
    resource: payload.resource,
    application_id: payload.application_id,
    payload,
    tenant_id: await getTenantFromMlUser(payload.user_id),
  });

  // Processar baseado no tópico
  switch (payload.topic) {
    case "orders_v2":
      await processOrderWebhook(payload);
      break;
    case "items":
      await processItemWebhook(payload);
      break;
    case "messages":
      await processMessageWebhook(payload);
      break;
    case "price_suggestion":
      await processPriceSuggestionWebhook(payload);
      break;
    case "catalog_item_competition_status":
      await processCompetitionWebhook(payload);
      break;
  }

  return new Response("OK", { status: 200 });
}
```

### Rate Limiting & Error Handling

```typescript
class MlApiClient {
  private rateLimiter: RateLimiter;

  async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      // Wait for rate limit
      await this.rateLimiter.wait();

      const response = await fetch(`https://api.mercadolibre.com${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (response.status === 429) {
        // Rate limited - exponential backoff
        const backoffMs = Math.pow(2, this.retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        return this.makeRequest(endpoint, options);
      }

      if (response.status === 401) {
        // Token expired - refresh automatically
        await this.refreshToken();
        return this.makeRequest(endpoint, options);
      }

      return response.json();
    } catch (error) {
      await this.logError("ml_api_error", error, { endpoint });
      throw error;
    }
  }
}
```

---

## 🎨 Frontend Architecture

### Server Components Pattern

```typescript
// app/dashboard/page.tsx (Server Component)
import { getCurrentUser, authorize } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Server-side auth check
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Permission check
  const canViewDashboard = await authorize("dashboard.view");
  if (!canViewDashboard) redirect("/unauthorized");

  // Fetch data server-side
  const dashboardData = await getDashboardData(user.tenant_id);

  return (
    <div>
      <DashboardStats data={dashboardData} />
      <RecentOrders userId={user.id} />
    </div>
  );
}
```

### Middleware & Route Protection

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) =>
          response.cookies.set(name, value, options),
      },
    }
  );

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/protected/:path*"],
};
```

### Client Components com Auth Context

```typescript
// components/AuthProvider.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserProfile, getRolePermissions } from "@/utils/supabase/roles";

const AuthContext = createContext<{
  user: User | null;
  profile: UserProfile | null;
  role: string | null;
  permissions: string[];
  loading: boolean;
}>({
  user: null,
  profile: null,
  role: null,
  permissions: [],
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const loadUserProfile = async (userId: string) => {
    try {
      const userProfile = await getUserProfile(userId);
      const userPermissions = await getRolePermissions(userProfile.role);

      setProfile(userProfile);
      setRole(userProfile.role);
      setPermissions(userPermissions);
    } catch (error) {
      console.error("Error loading user profile:", error);
      setProfile(null);
      setRole(null);
      setPermissions([]);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
        setPermissions([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, role, permissions, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## 🚀 Deployment & Environment

### Vercel Configuration

```json
// vercel.json
{
  "version": 2,
  "regions": ["gru1"],
  "functions": {
    "app/api/webhooks/ml/route.ts": {
      "maxDuration": 30
    },
    "app/api/ml/sync/route.ts": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Environment Variables

```env
# Next.js
NEXT_PUBLIC_APP_URL=https://mercaflow.vercel.app
NEXT_PUBLIC_APP_NAME=MercaFlow
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://pnzbnciiokgiadkfgrcn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Mercado Livre
ML_CLIENT_ID=1234567890123456
ML_CLIENT_SECRET=AbCdEf1234567890
ML_REDIRECT_URI=https://mercaflow.vercel.app/api/auth/ml/callback
ML_API_BASE_URL=https://api.mercadolibre.com

# NextAuth (se usado)
NEXTAUTH_URL=https://mercaflow.vercel.app
NEXTAUTH_SECRET=super-secret-jwt-secret-32-chars-min

# Optional Analytics & Monitoring
SENTRY_DSN=https://...
GOOGLE_ANALYTICS_ID=G-...
HOTJAR_ID=...
```

---

## 📊 Business Intelligence Features

### IA-Powered Price Optimization

```typescript
class MlPriceOptimizer {
  async optimizePricing(itemId: string, mlUserId: string) {
    // 1. Get current item data
    const item = await this.mlApi.getItem(itemId);

    // 2. Get competition data
    const competition = await this.mlApi.getCompetitionStatus(itemId);

    // 3. Get price suggestions from ML
    const suggestion = await this.mlApi.getPriceSuggestion(itemId);

    // 4. Apply our ML algorithm
    const optimizedPrice = await this.calculateOptimalPrice({
      currentPrice: item.price,
      competitorPrices: competition.prices,
      mlSuggestion: suggestion.suggested_price,
      historicalData: await this.getHistoricalData(itemId),
      marketTrends: await this.getMarketTrends(item.category_id),
    });

    return {
      currentPrice: item.price,
      suggestedPrice: optimizedPrice,
      expectedImpact: await this.calculateImpact(item, optimizedPrice),
      confidence: this.calculateConfidence(),
      reasons: this.getOptimizationReasons(),
    };
  }
}
```

### Real-time Competition Analysis

```typescript
// Webhook handler para competição
async function processCompetitionWebhook(payload: any) {
  const { resource, user_id } = payload;

  // Extract item ID from resource
  const itemId = resource.split("/").pop();

  // Get competition status
  const competition = await mlApi.get(`/items/${itemId}/price_to_win`);

  // Check if we lost/gained position
  const alerts = await checkCompetitionAlerts(itemId, competition);

  if (alerts.length > 0) {
    // Send real-time notifications
    await sendCompetitionAlerts(user_id, alerts);

    // Update dashboard
    await updateCompetitionDashboard(user_id, competition);

    // Auto-optimize if enabled
    const user = await getMlUser(user_id);
    if (user.auto_optimize_enabled) {
      await autoOptimizePrice(itemId, competition);
    }
  }
}
```

### Advanced Analytics Dashboard

```typescript
// Dashboard data aggregation
async function getDashboardAnalytics(tenantId: string) {
  const analytics = await Promise.all([
    // Revenue metrics
    calculateRevenueMetrics(tenantId),

    // Product performance
    getTopPerformingProducts(tenantId),

    // Competition insights
    getCompetitionInsights(tenantId),

    // Price optimization opportunities
    getPriceOpportunities(tenantId),

    // Market trends
    getMarketTrends(tenantId),

    // ROI calculation
    calculatePlatformROI(tenantId),
  ]);

  return {
    revenue: analytics[0],
    products: analytics[1],
    competition: analytics[2],
    opportunities: analytics[3],
    trends: analytics[4],
    roi: analytics[5],
    generatedAt: new Date().toISOString(),
  };
}
```

---

## 🔒 Security & Monitoring

### Security Headers & CORS

```typescript
// Security middleware
export function securityHeaders() {
  return {
    "Content-Security-Policy": `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      connect-src 'self' https://*.supabase.co https://api.mercadolibre.com;
    `
      .replace(/\s+/g, " ")
      .trim(),
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}
```

### Error Monitoring & Logging

```typescript
// Structured logging
class Logger {
  static async logError(
    error: Error,
    context: Record<string, any> = {},
    userId?: string,
    tenantId?: string
  ) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: "error",
      message: error.message,
      stack: error.stack,
      context,
      userId,
      tenantId,
      environment: process.env.NODE_ENV,
    };

    // Log to database
    await supabase.from("error_logs").insert(logEntry);

    // Send to external monitoring (Sentry, etc.)
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error, { contexts: { custom: context } });
    }
  }

  static async logActivity(
    action: string,
    userId: string,
    tenantId: string,
    metadata: Record<string, any> = {}
  ) {
    await supabase.from("activity_logs").insert({
      action,
      user_id: userId,
      tenant_id: tenantId,
      metadata,
      timestamp: new Date().toISOString(),
      ip_address: await getClientIP(),
      user_agent: await getUserAgent(),
    });
  }
}
```

---

## 📈 Performance & Optimization

### Database Optimization

```sql
-- Indexes para performance
CREATE INDEX CONCURRENTLY idx_ml_items_tenant_status ON ml_items(tenant_id, status);
CREATE INDEX CONCURRENTLY idx_ml_webhooks_processed ON ml_webhooks(processed, created_at);
CREATE INDEX CONCURRENTLY idx_profiles_tenant_role ON profiles(tenant_id, role);
CREATE INDEX CONCURRENTLY idx_ml_users_token_expires ON ml_users(token_expires_at);

-- Partial indexes para consultas específicas
CREATE INDEX CONCURRENTLY idx_ml_items_active ON ml_items(tenant_id, updated_at)
WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_ml_webhooks_unprocessed ON ml_webhooks(created_at)
WHERE processed = false;
```

### Caching Strategy

```typescript
// Redis-like caching com Vercel KV
class CacheManager {
  private static ttl = {
    user_session: 3600, // 1h
    ml_items: 900, // 15min
    dashboard_data: 300, // 5min
    competition_data: 180, // 3min
    price_suggestions: 600, // 10min
  };

  static async get(key: string) {
    try {
      const cached = await kv.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  static async set(key: string, data: any, ttl?: number) {
    const expiry = ttl || this.ttl.dashboard_data;
    await kv.setex(key, expiry, JSON.stringify(data));
  }

  static getCacheKey(type: string, ...identifiers: string[]) {
    return `${type}:${identifiers.join(":")}`;
  }
}
```

---

## 🚦 Monitoring & Health Checks

### Health Check Endpoints

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.allSettled([
    // Database connectivity
    supabase.from("profiles").select("count").single(),

    // ML API connectivity
    fetch("https://api.mercadolibre.com/sites", { method: "HEAD" }),

    // External services
    checkRedisConnection(),
    checkEmailService(),
  ]);

  const status = checks.every((check) => check.status === "fulfilled")
    ? "healthy"
    : "unhealthy";

  return Response.json({
    status,
    timestamp: new Date().toISOString(),
    checks: {
      database: checks[0].status,
      ml_api: checks[1].status,
      redis: checks[2].status,
      email: checks[3].status,
    },
    version: process.env.npm_package_version,
  });
}
```

---

## 🎯 KPIs & Success Metrics

### Technical KPIs

- **Response Time**: < 200ms para dashboard principal
- **Uptime**: 99.9% disponibilidade
- **Error Rate**: < 0.1% das requests
- **JWT Token Refresh**: Automático e transparente
- **Webhook Processing**: < 5s para processar eventos ML

### Business KPIs

- **Customer Acquisition Cost (CAC)**: < R$ 280
- **Lifetime Value (LTV)**: > R$ 4.200
- **Monthly Churn Rate**: < 3.5%
- **Net Promoter Score (NPS)**: > 50
- **Platform ROI for Customers**: 25-40% aumento vendas

### Growth Targets

- **Year 1**: 300 clientes pagantes, R$ 1.32M ARR
- **Year 2**: 1.000 clientes pagantes, R$ 5.61M ARR
- **Market Penetration**: 1% dos 173K sellers profissionais ML

---

Essa especificação técnica serve como blueprint completo para implementar o MercaFlow seguindo as melhores práticas enterprise e integrando todas as tecnologias de forma otimizada.
