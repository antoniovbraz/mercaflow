# 🛍️ Integração Mercado Livre - Guia Técnico Completo

## 📋 **Resumo da Integração**

Este documento detalha a implementação completa da integração OAuth 2.0 com a API do Mercado Livre, baseado na análise abrangente da documentação oficial.

### **Credenciais da Aplicação**
- **Client ID**: `6829614190686807`
- **Scopes**: `read write offline_access`
- **Redirect URI**: Configurado para ambiente de produção
- **Flow**: OAuth 2.0 Authorization Code com PKCE

---

## 🔐 **1. Fluxo OAuth 2.0 Implementation**

### **1.1 Authorization Code Flow**

**Endpoint de Autorização:**
```
https://auth.mercadolivre.com.br/authorization?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&state={STATE}&code_challenge={CODE_CHALLENGE}&code_challenge_method=S256
```

**Parâmetros Obrigatórios:**
- `response_type`: "code" 
- `client_id`: ID da aplicação ML
- `redirect_uri`: Deve ser EXATAMENTE igual ao configurado
- `state`: Token único para validação de segurança
- `code_challenge`: Hash SHA256 do code_verifier (PKCE)
- `code_challenge_method`: "S256"

### **1.2 Token Exchange**

**Endpoint:**
```
POST https://api.mercadolibre.com/oauth/token
Content-Type: application/x-www-form-urlencoded
```

**Body:**
```
grant_type=authorization_code&
client_id={CLIENT_ID}&
client_secret={CLIENT_SECRET}&
code={AUTHORIZATION_CODE}&
redirect_uri={REDIRECT_URI}&
code_verifier={CODE_VERIFIER}
```

**Resposta:**
```json
{
  "access_token": "APP_USR-123456-090515-token",
  "token_type": "bearer",
  "expires_in": 21600,
  "scope": "offline_access read write",
  "user_id": 1234567,
  "refresh_token": "TG-5b9032b4e23464aed1f959f-1234567"
}
```

### **1.3 Refresh Token Flow**

**Endpoint:**
```
POST https://api.mercadolibre.com/oauth/token
Content-Type: application/x-www-form-urlencoded
```

**Body:**
```
grant_type=refresh_token&
client_id={CLIENT_ID}&
client_secret={CLIENT_SECRET}&
refresh_token={REFRESH_TOKEN}
```

---

## 🗄️ **2. Schema do Banco de Dados**

### **Tabela: ml_integrations**

```sql
CREATE TABLE ml_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Dados da integração ML
  ml_user_id BIGINT NOT NULL,
  ml_nickname TEXT,
  
  -- Tokens OAuth
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Configurações
  scopes TEXT[] NOT NULL DEFAULT '{read,write,offline_access}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'error')),
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(tenant_id, ml_user_id)
);

-- RLS Policies
ALTER TABLE ml_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ML integrations" ON ml_integrations
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

### **Tabela: ml_sync_logs**

```sql
CREATE TABLE ml_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES ml_integrations(id) ON DELETE CASCADE,
  
  sync_type TEXT NOT NULL CHECK (sync_type IN ('products', 'orders', 'questions', 'webhooks')),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  
  records_processed INTEGER DEFAULT 0,
  records_success INTEGER DEFAULT 0,
  records_error INTEGER DEFAULT 0,
  
  error_details JSONB,
  sync_data JSONB,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ml_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ML sync logs" ON ml_sync_logs
  FOR SELECT USING (
    integration_id IN (
      SELECT id FROM ml_integrations 
      WHERE tenant_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );
```

---

## 🚀 **3. Implementação da API**

### **3.1 Endpoints de Autenticação**

**`/api/ml/auth/initiate`** - Inicia OAuth Flow
```typescript
// app/api/ml/auth/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireRole } from '@/utils/supabase/roles';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const profile = await requireRole('user');
    
    // Gerar PKCE
    const code_verifier = crypto.randomBytes(128).toString('base64url');
    const code_challenge = crypto
      .createHash('sha256')
      .update(code_verifier)
      .digest('base64url');
    
    const state = crypto.randomBytes(32).toString('hex');
    
    // Salvar no cache/sessão
    const { error } = await supabase
      .from('ml_oauth_states')
      .insert({
        state,
        code_verifier,
        user_id: profile.user_id,
        tenant_id: profile.id,
        expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 min
      });
    
    if (error) throw error;
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.ML_CLIENT_ID!,
      redirect_uri: process.env.ML_REDIRECT_URI!,
      state,
      code_challenge,
      code_challenge_method: 'S256'
    });
    
    const authUrl = `https://auth.mercadolivre.com.br/authorization?${params}`;
    
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('ML Auth Initiate Error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate ML auth' },
      { status: 500 }
    );
  }
}
```

**`/api/ml/auth/callback`** - Callback OAuth
```typescript
// app/api/ml/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (!code || !state) {
      throw new Error('Missing code or state parameter');
    }
    
    const supabase = await createClient();
    
    // Validar state
    const { data: stateRecord, error: stateError } = await supabase
      .from('ml_oauth_states')
      .select('*')
      .eq('state', state)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (stateError || !stateRecord) {
      throw new Error('Invalid or expired state');
    }
    
    // Exchange code for token
    const tokenResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.ML_CLIENT_ID!,
        client_secret: process.env.ML_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.ML_REDIRECT_URI!,
        code_verifier: stateRecord.code_verifier,
      }),
    });
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${error}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    // Buscar dados do usuário ML
    const userResponse = await fetch('https://api.mercadolibre.com/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch ML user data');
    }
    
    const userData = await userResponse.json();
    
    // Salvar integração
    const { error: integrationError } = await supabase
      .from('ml_integrations')
      .upsert({
        user_id: stateRecord.user_id,
        tenant_id: stateRecord.tenant_id,
        ml_user_id: userData.id,
        ml_nickname: userData.nickname,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
        scopes: tokenData.scope.split(' '),
        status: 'active',
        last_sync_at: new Date(),
      });
    
    if (integrationError) throw integrationError;
    
    // Limpar state usado
    await supabase.from('ml_oauth_states').delete().eq('state', state);
    
    return NextResponse.redirect(new URL('/dashboard?ml_connected=true', request.url));
  } catch (error) {
    console.error('ML Auth Callback Error:', error);
    return NextResponse.redirect(new URL('/dashboard?ml_error=true', request.url));
  }
}
```

### **3.2 Token Management**

```typescript
// utils/mercadolivre/token-manager.ts
import { createClient } from '@/utils/supabase/server';

export class MLTokenManager {
  private supabase = createClient();

  async getValidToken(integrationId: string): Promise<string | null> {
    const { data: integration, error } = await this.supabase
      .from('ml_integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('status', 'active')
      .single();

    if (error || !integration) return null;

    // Check if token is expired (with 5min buffer)
    const expiresAt = new Date(integration.token_expires_at);
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes

    if (now.getTime() + bufferTime >= expiresAt.getTime()) {
      // Token expired or will expire soon, refresh it
      return await this.refreshToken(integration);
    }

    return integration.access_token;
  }

  private async refreshToken(integration: any): Promise<string | null> {
    try {
      const response = await fetch('https://api.mercadolibre.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.ML_CLIENT_ID!,
          client_secret: process.env.ML_CLIENT_SECRET!,
          refresh_token: integration.refresh_token,
        }),
      });

      if (!response.ok) {
        // Mark integration as expired
        await this.supabase
          .from('ml_integrations')
          .update({ status: 'expired' })
          .eq('id', integration.id);
        return null;
      }

      const tokenData = await response.json();

      // Update tokens
      await this.supabase
        .from('ml_integrations')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
          updated_at: new Date(),
        })
        .eq('id', integration.id);

      return tokenData.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      await this.supabase
        .from('ml_integrations')
        .update({ status: 'error' })
        .eq('id', integration.id);
      
      return null;
    }
  }
}
```

### **3.3 API Proxy para Mercado Livre**

```typescript
// app/api/ml/items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/utils/supabase/roles';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';
import { createClient } from '@/utils/supabase/server';

const tokenManager = new MLTokenManager();

export async function GET(request: NextRequest) {
  try {
    const profile = await requireRole('user');
    const supabase = await createClient();
    
    // Get user's ML integration
    const { data: integration, error } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('tenant_id', profile.id)
      .eq('status', 'active')
      .single();
    
    if (error || !integration) {
      return NextResponse.json(
        { error: 'No active ML integration found' },
        { status: 404 }
      );
    }
    
    const accessToken = await tokenManager.getValidToken(integration.id);
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Proxy request to ML API
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    const mlResponse = await fetch(
      `https://api.mercadolibre.com/users/${integration.ml_user_id}/items?${searchParams}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    );
    
    if (!mlResponse.ok) {
      throw new Error(`ML API error: ${mlResponse.status}`);
    }
    
    const data = await mlResponse.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('ML Items API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ML items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const profile = await requireRole('user');
    const body = await request.json();
    
    // Validation logic here...
    
    const supabase = await createClient();
    const { data: integration } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('tenant_id', profile.id)
      .eq('status', 'active')
      .single();
    
    if (!integration) {
      return NextResponse.json(
        { error: 'No active ML integration' },
        { status: 404 }
      );
    }
    
    const accessToken = await tokenManager.getValidToken(integration.id);
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Create item on ML
    const mlResponse = await fetch('https://api.mercadolibre.com/items', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!mlResponse.ok) {
      const error = await mlResponse.text();
      return NextResponse.json(
        { error: `ML API error: ${error}` },
        { status: mlResponse.status }
      );
    }
    
    const data = await mlResponse.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Create ML Item Error:', error);
    return NextResponse.json(
      { error: 'Failed to create ML item' },
      { status: 500 }
    );
  }
}
```

---

## 🎯 **4. Componentes React**

### **4.1 ML Connection Status**

```typescript
// components/ml/ConnectionStatus.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface MLIntegration {
  id: string;
  ml_user_id: number;
  ml_nickname: string;
  status: 'active' | 'expired' | 'revoked' | 'error';
  token_expires_at: string;
  last_sync_at: string;
}

export function MLConnectionStatus() {
  const [integration, setIntegration] = useState<MLIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchIntegrationStatus();
  }, []);

  const fetchIntegrationStatus = async () => {
    try {
      const response = await fetch('/api/ml/integration/status');
      if (response.ok) {
        const data = await response.json();
        setIntegration(data.integration);
      }
    } catch (error) {
      console.error('Failed to fetch ML integration status:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectToML = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/ml/auth/initiate', {
        method: 'POST',
      });
      
      if (response.ok) {
        const { authUrl } = await response.json();
        window.location.href = authUrl;
      } else {
        throw new Error('Failed to initiate ML connection');
      }
    } catch (error) {
      console.error('ML connection error:', error);
      setConnecting(false);
    }
  };

  const disconnectML = async () => {
    try {
      const response = await fetch('/api/ml/integration/disconnect', {
        method: 'POST',
      });
      
      if (response.ok) {
        setIntegration(null);
      }
    } catch (error) {
      console.error('Failed to disconnect ML:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-pulse">Carregando status da integração...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img 
            src="/ml-logo.png" 
            alt="Mercado Livre" 
            className="w-6 h-6"
          />
          Mercado Livre Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {integration ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Conectado como</span>
                <Badge variant="secondary">{integration.ml_nickname}</Badge>
              </div>
              <Badge 
                variant={integration.status === 'active' ? 'default' : 'destructive'}
              >
                {integration.status}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>User ID: {integration.ml_user_id}</p>
              <p>Token expira em: {new Date(integration.token_expires_at).toLocaleString('pt-BR')}</p>
              <p>Última sincronização: {new Date(integration.last_sync_at).toLocaleString('pt-BR')}</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(`https://www.mercadolivre.com.br/perfil/${integration.ml_nickname}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Perfil ML
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={disconnectML}
              >
                Desconectar
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="w-5 h-5" />
              <span>Não conectado ao Mercado Livre</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Conecte sua conta do Mercado Livre para sincronizar produtos, 
              gerenciar vendas e receber notificações automáticas.
            </p>
            
            <Button 
              onClick={connectToML} 
              disabled={connecting}
              className="w-full"
            >
              {connecting ? 'Conectando...' : 'Conectar ao Mercado Livre'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 📊 **5. Endpoints Principais da API ML**

### **Produtos e Itens**
- `GET /users/{user_id}/items` - Lista itens do usuário
- `POST /items` - Criar novo item
- `GET /items/{item_id}` - Detalhes do item
- `PUT /items/{item_id}` - Atualizar item
- `PUT /items/{item_id}/status` - Pausar/ativar item

### **Pedidos e Vendas**  
- `GET /orders/search` - Buscar pedidos
- `GET /orders/{order_id}` - Detalhes do pedido
- `POST /orders/{order_id}/feedback` - Adicionar feedback

### **Categorias e Atributos**
- `GET /categories/{category_id}` - Detalhes da categoria
- `GET /categories/{category_id}/attributes` - Atributos obrigatórios
- `GET /sites/MLB/categories` - Todas as categorias Brasil

### **Usuário e Configurações**
- `GET /users/me` - Dados do usuário autenticado
- `GET /users/{user_id}/addresses` - Endereços do usuário

---

## ⚠️ **6. Considerações Importantes**

### **6.1 Rate Limiting**
- **Limite**: Varia por endpoint (geralmente 1000-5000 req/hour)
- **Headers**: `x-ratelimit-*` retornados nas respostas
- **Implementar**: Retry com backoff exponencial

### **6.2 Segurança**
- **HTTPS Obrigatório**: Todos os endpoints
- **State Validation**: Sempre validar parâmetro state
- **Token Storage**: Criptografar tokens no banco
- **PKCE**: Obrigatório para Authorization Code Flow

### **6.3 Erros Comuns**
- `invalid_grant`: Token expirado ou inválido
- `forbidden (403)`: Sem permissão ou IP bloqueado  
- `unauthorized (401)`: Token inválido
- `invalid_client`: Client ID/Secret incorretos

### **6.4 Webhooks (Futuro)**
- **Endpoint**: Configurar webhook URL na app ML
- **Topics**: `orders`, `items`, `questions`, `messages`
- **Validação**: Verificar assinatura do payload

---

## 🚀 **7. Próximas Implementações**

1. **Dashboard de Produtos**: Interface para gerenciar itens ML
2. **Sincronização Automática**: Jobs para sync periódica
3. **Análise de Competitividade**: Monitoramento de preços
4. **Notificações**: Sistema de alertas para vendas/questões
5. **Relatórios**: Métricas de performance de vendas
6. **Multi-conta**: Suporte a múltiplas integrações ML por tenant

---

**Status**: Documentação técnica completa baseada na análise oficial das APIs ✅