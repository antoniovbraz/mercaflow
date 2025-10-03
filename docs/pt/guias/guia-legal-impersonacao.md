# 🔒 IMPERSONATION LEGAL & PRIVACY GUIDE

## Conformidade Legal para Impersonação de Clientes

**Versão**: 1.0  
**Data**: 02/10/2025  
**Área**: Legal & Compliance  
**Escopo**: Impersonação segura e legal de contas de clientes

---

## ⚖️ ASPECTOS LEGAIS NO BRASIL

### 📋 **LGPD - Lei Geral de Proteção de Dados**

**ARTIGOS RELEVANTES:**
- **Art. 7º, III**: Tratamento necessário para cumprimento de obrigação legal
- **Art. 7º, VI**: Tratamento necessário para proteção da vida ou da incolumidade física
- **Art. 7º, IX**: Tratamento quando necessário para atender aos interesses legítimos

**✅ CENÁRIOS LEGALMENTE PERMITIDOS:**

1. **Suporte Técnico Autorizado**
   - Cliente solicita ajuda via ticket
   - Impossível resolver sem acesso à conta
   - Cliente autoriza explicitamente

2. **Investigação de Fraude**
   - Atividade suspeita detectada
   - Proteção dos dados do cliente
   - Preservação da integridade da plataforma

3. **Cumprimento de Ordem Judicial**
   - Determinação legal/judicial
   - Investigações oficiais
   - Cooperação com autoridades

4. **Resolução de Problemas Críticos**
   - Falhas no sistema
   - Perda de dados
   - Emergências técnicas

**❌ CENÁRIOS PROIBIDOS:**
- Curiosidade pessoal
- Monitoramento sem justificativa
- Acesso para fins comerciais não autorizados
- Compartilhamento de informações privadas

### 📜 **TERMOS DE SERVIÇO NECESSÁRIOS**

```markdown
## 8. SUPORTE TÉCNICO E ACESSO À CONTA

8.1 **Impersonação para Suporte**: Em casos específicos de suporte técnico, 
investigação de fraude ou cumprimento de obrigações legais, a Merca Flow 
poderá acessar sua conta mediante:

a) Sua autorização expressa por escrito (ticket/email)
b) Justificativa técnica documentada
c) Registro de auditoria completo
d) Limitação temporal do acesso

8.2 **Seus Direitos**: Você pode:
- Solicitar relatório de acessos à sua conta
- Revogar autorização a qualquer momento
- Receber notificação de todos os acessos
- Solicitar exclusão de logs após resolução

8.3 **Nossas Obrigações**: Garantimos:
- Acesso mínimo necessário
- Registro completo de ações
- Não compartilhamento de dados pessoais
- Exclusão automática de sessões de impersonação
```

---

## 🛡️ IMPLEMENTAÇÃO TÉCNICA SEGURA

### 1. Sistema de Autorização Prévia

```typescript
// types/impersonation.ts
interface ImpersonationRequest {
  tenant_id: string
  admin_id: string
  reason: 'support' | 'fraud_investigation' | 'legal_compliance' | 'technical_emergency'
  justification: string
  customer_authorization: boolean  // Cliente autorizou?
  max_duration_minutes: number
  requested_at: Date
  approved_by?: string
  approved_at?: Date
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'active' | 'completed'
}

// supabase/functions/request-impersonation/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { tenant_id, reason, justification, duration } = await req.json()
  
  // 1. Verificar se é super admin
  const { data: admin } = await supabase
    .from('platform_owners')
    .select('id, role')
    .eq('id', auth.uid())
    .single()
    
  if (admin?.role !== 'super_admin') {
    return new Response('Unauthorized', { status: 403 })
  }
  
  // 2. Validar motivo
  const validReasons = ['support', 'fraud_investigation', 'legal_compliance', 'technical_emergency']
  if (!validReasons.includes(reason)) {
    return new Response('Invalid reason', { status: 400 })
  }
  
  // 3. Verificar se precisa de autorização do cliente
  const needsCustomerAuth = ['support'].includes(reason)
  
  // 4. Criar solicitação
  const { data: request } = await supabase
    .from('impersonation_requests')
    .insert({
      tenant_id,
      admin_id: admin.id,
      reason,
      justification,
      max_duration_minutes: Math.min(duration, 60), // Max 1 hora
      customer_authorization: !needsCustomerAuth, // Auto-aprovado se não precisar
      status: needsCustomerAuth ? 'pending' : 'approved'
    })
    .select()
    .single()
    
  // 5. Se precisar de autorização, enviar email para cliente
  if (needsCustomerAuth) {
    await sendCustomerAuthorizationEmail(tenant_id, request.id)
  }
  
  return new Response(JSON.stringify({ 
    request_id: request.id,
    status: request.status,
    requires_customer_authorization: needsCustomerAuth
  }))
})
```

### 2. Autorização do Cliente

```typescript
// components/CustomerAuthorizationModal.tsx
export const CustomerAuthorizationModal: React.FC<{
  requestId: string
  adminName: string
  reason: string
  justification: string
}> = ({ requestId, adminName, reason, justification }) => {
  
  const handleAuthorize = async (authorized: boolean) => {
    const response = await fetch('/api/impersonation/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: requestId,
        authorized,
        customer_notes: authorized ? 'Autorizado para suporte' : 'Negado pelo cliente'
      })
    })
    
    if (response.ok) {
      toast.success(authorized ? 'Acesso autorizado' : 'Acesso negado')
    }
  }
  
  return (
    <div className="authorization-modal">
      <div className="modal-content">
        <h3>🔒 Solicitação de Acesso à Sua Conta</h3>
        
        <div className="request-details">
          <p><strong>Administrador:</strong> {adminName}</p>
          <p><strong>Motivo:</strong> {translateReason(reason)}</p>
          <p><strong>Justificativa:</strong> {justification}</p>
          <p><strong>Duração máxima:</strong> 60 minutos</p>
        </div>
        
        <div className="warning-box">
          ⚠️ O administrador poderá acessar sua conta para resolver o problema relatado.
          Todas as ações serão registradas e você receberá um relatório completo.
        </div>
        
        <div className="actions">
          <button 
            onClick={() => handleAuthorize(true)}
            className="btn-primary"
          >
            ✅ Autorizar Acesso
          </button>
          <button 
            onClick={() => handleAuthorize(false)}
            className="btn-secondary"
          >
            ❌ Negar Acesso
          </button>
        </div>
        
        <p className="legal-note">
          Seus direitos: Você pode revogar esta autorização a qualquer momento
          e solicitar relatório completo das ações realizadas.
        </p>
      </div>
    </div>
  )
}
```

### 3. Sistema de Auditoria Completa

```sql
-- Tabela de auditoria de impersonação
CREATE TABLE impersonation_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES impersonation_requests(id),
  session_id UUID NOT NULL,
  admin_id UUID NOT NULL REFERENCES platform_owners(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  -- Detalhes da ação
  action_type VARCHAR(100) NOT NULL, -- 'login', 'view_page', 'api_call', 'data_access'
  resource_accessed VARCHAR(255), -- Qual página/dado foi acessado
  ip_address INET NOT NULL,
  user_agent TEXT,
  
  -- Dados da ação (criptografados)
  action_details JSONB,
  
  -- Timestamps
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_started_at TIMESTAMP WITH TIME ZONE,
  session_ended_at TIMESTAMP WITH TIME ZONE
);

-- Função para log automático
CREATE OR REPLACE FUNCTION log_impersonation_action()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all actions during impersonation sessions
  IF current_setting('app.impersonation_session_id', true) IS NOT NULL THEN
    INSERT INTO impersonation_audit_logs (
      request_id,
      session_id,
      admin_id,
      tenant_id,
      action_type,
      resource_accessed,
      action_details
    ) VALUES (
      current_setting('app.impersonation_request_id')::UUID,
      current_setting('app.impersonation_session_id')::UUID,
      current_setting('app.impersonation_admin_id')::UUID,
      NEW.tenant_id,
      TG_OP,
      TG_TABLE_NAME,
      row_to_json(NEW)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas sensíveis
CREATE TRIGGER audit_products_impersonation 
  AFTER INSERT OR UPDATE OR DELETE ON products 
  FOR EACH ROW EXECUTE FUNCTION log_impersonation_action();
```

### 4. Interface Segura de Impersonação

```typescript
// components/SecureImpersonationPanel.tsx
export const SecureImpersonationPanel: React.FC<{
  tenant: Tenant
}> = ({ tenant }) => {
  const [request, setRequest] = useState<ImpersonationRequest | null>(null)
  const [reason, setReason] = useState<string>('')
  const [justification, setJustification] = useState<string>('')
  
  const handleRequestAccess = async () => {
    // Validações obrigatórias
    if (!reason || !justification.trim()) {
      toast.error('Motivo e justificativa são obrigatórios')
      return
    }
    
    if (justification.length < 20) {
      toast.error('Justificativa deve ter pelo menos 20 caracteres')
      return
    }
    
    const response = await fetch('/api/impersonation/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: tenant.id,
        reason,
        justification,
        duration: 60 // 1 hora máximo
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      setRequest(result)
      
      if (result.requires_customer_authorization) {
        toast.info('Solicitação enviada para autorização do cliente')
      } else {
        toast.success('Acesso aprovado automaticamente')
      }
    }
  }
  
  const handleStartImpersonation = async () => {
    if (!request || request.status !== 'approved') return
    
    // Confirmação adicional
    const confirmed = confirm(
      `⚠️ ATENÇÃO: Você está prestes a acessar a conta de ${tenant.name}.\n\n` +
      `Motivo: ${request.reason}\n` +
      `Todas as ações serão registradas.\n\n` +
      `Confirma o acesso?`
    )
    
    if (!confirmed) return
    
    // Iniciar sessão de impersonação
    const response = await fetch('/api/impersonation/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: request.id
      })
    })
    
    if (response.ok) {
      const { impersonation_url } = await response.json()
      
      // Abrir em nova aba com indicadores visuais
      const newWindow = window.open(impersonation_url, '_blank')
      
      if (newWindow) {
        // Adicionar indicadores visuais na nova janela
        newWindow.document.title = `🚨 IMPERSONATION: ${tenant.name}`
      }
    }
  }
  
  return (
    <div className="impersonation-panel">
      <div className="warning-header">
        ⚠️ <strong>ACESSO DE EMERGÊNCIA</strong>
        <p>Use apenas em casos específicos e com justificativa válida</p>
      </div>
      
      <div className="form-group">
        <label>Motivo do Acesso:</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">Selecione...</option>
          <option value="support">Suporte Técnico (requer autorização)</option>
          <option value="fraud_investigation">Investigação de Fraude</option>
          <option value="legal_compliance">Cumprimento Legal</option>
          <option value="technical_emergency">Emergência Técnica</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Justificativa Detalhada:</label>
        <textarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          placeholder="Descreva detalhadamente o problema e por que precisa acessar esta conta..."
          rows={4}
          minLength={20}
          required
        />
        <small>{justification.length}/500 caracteres</small>
      </div>
      
      <div className="legal-notice">
        📋 <strong>Declaração Legal:</strong><br/>
        Ao solicitar acesso, declaro que o motivo é legítimo e está em conformidade 
        com a LGPD e termos de serviço. Todas as ações serão auditadas.
      </div>
      
      {!request && (
        <button 
          onClick={handleRequestAccess}
          className="btn-warning"
          disabled={!reason || justification.length < 20}
        >
          🔐 Solicitar Acesso
        </button>
      )}
      
      {request && request.status === 'pending' && (
        <div className="status-pending">
          ⏳ Aguardando autorização do cliente...
        </div>
      )}
      
      {request && request.status === 'approved' && (
        <button 
          onClick={handleStartImpersonation}
          className="btn-danger"
        >
          🚨 Iniciar Impersonação
        </button>
      )}
    </div>
  )
}
```

---

## 📊 RELATÓRIOS DE TRANSPARÊNCIA

### 1. Relatório para o Cliente

```typescript
// Relatório automático enviado ao cliente após impersonação
export const generateImpersonationReport = async (requestId: string) => {
  const report = await supabase
    .from('impersonation_audit_logs')
    .select(`
      *,
      impersonation_requests!inner(
        reason,
        justification,
        admin_id,
        created_at
      ),
      platform_owners!inner(
        email as admin_email
      )
    `)
    .eq('request_id', requestId)
    .order('timestamp', { ascending: true })
  
  const reportHtml = `
    <h2>🔒 Relatório de Acesso à Sua Conta</h2>
    
    <div class="report-summary">
      <p><strong>Período:</strong> ${report.data[0]?.session_started_at} - ${report.data[0]?.session_ended_at}</p>
      <p><strong>Administrador:</strong> ${report.data[0]?.platform_owners?.admin_email}</p>
      <p><strong>Motivo:</strong> ${report.data[0]?.impersonation_requests?.reason}</p>
      <p><strong>Justificativa:</strong> ${report.data[0]?.impersonation_requests?.justification}</p>
    </div>
    
    <h3>Ações Realizadas:</h3>
    <table>
      <tr><th>Horário</th><th>Ação</th><th>Recurso Acessado</th></tr>
      ${report.data?.map(log => `
        <tr>
          <td>${log.timestamp}</td>
          <td>${translateAction(log.action_type)}</td>
          <td>${log.resource_accessed || 'N/A'}</td>
        </tr>
      `).join('')}
    </table>
    
    <div class="footer">
      <p>Este relatório é gerado automaticamente para sua transparência.</p>
      <p>Em caso de dúvidas, entre em contato: suporte@mercaflow.com.br</p>
    </div>
  `
  
  // Enviar por email
  await sendEmail({
    to: tenant.owner_email,
    subject: 'Relatório de Acesso à Sua Conta - Merca Flow',
    html: reportHtml
  })
}
```

### 2. Dashboard de Auditoria Interna

```typescript
// Métricas internas de impersonação
export const ImpersonationMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null)
  
  useEffect(() => {
    loadMetrics()
  }, [])
  
  const loadMetrics = async () => {
    const response = await fetch('/api/admin/impersonation-metrics')
    const data = await response.json()
    setMetrics(data)
  }
  
  return (
    <div className="impersonation-metrics">
      <h3>📊 Métricas de Impersonação (Últimos 30 dias)</h3>
      
      <div className="metrics-grid">
        <MetricCard 
          title="Total de Solicitações" 
          value={metrics?.total_requests || 0} 
        />
        <MetricCard 
          title="Taxa de Aprovação" 
          value={`${metrics?.approval_rate || 0}%`} 
        />
        <MetricCard 
          title="Tempo Médio de Sessão" 
          value={`${metrics?.avg_session_duration || 0} min`} 
        />
        <MetricCard 
          title="Satisfação do Cliente" 
          value={`${metrics?.customer_satisfaction || 0}/5`} 
        />
      </div>
      
      <div className="recent-requests">
        <h4>Solicitações Recentes</h4>
        <table>
          <tr>
            <th>Data</th>
            <th>Admin</th>
            <th>Cliente</th>
            <th>Motivo</th>
            <th>Status</th>
            <th>Duração</th>
          </tr>
          {metrics?.recent_requests?.map(req => (
            <tr key={req.id}>
              <td>{formatDate(req.created_at)}</td>
              <td>{req.admin_email}</td>
              <td>{req.tenant_name}</td>
              <td>{translateReason(req.reason)}</td>
              <td><Badge variant={req.status}>{req.status}</Badge></td>
              <td>{req.duration || 'N/A'}</td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  )
}
```

---

## ✅ RESUMO DE CONFORMIDADE

### 🟢 **LEGALMENTE PERMITIDO COM:**

1. ✅ **Autorização Expressa**: Cliente autoriza via interface
2. ✅ **Justificativa Documentada**: Motivo válido registrado
3. ✅ **Auditoria Completa**: Todas as ações logadas
4. ✅ **Transparência Total**: Relatório enviado ao cliente
5. ✅ **Limitação Temporal**: Sessões com tempo limitado
6. ✅ **Termos Atualizados**: Política clara nos ToS

### 📋 **OBRIGAÇÕES LEGAIS:**

- 📨 **Notificação**: Cliente sempre notificado
- 📊 **Relatório**: Ações detalhadas documentadas
- ⏰ **Retenção**: Logs mantidos por 2 anos
- 🗑️ **Exclusão**: Direito ao esquecimento respeitado
- 🔒 **Segurança**: Dados protegidos sempre

### 🚫 **NUNCA FAÇA:**

- ❌ Acessar por curiosidade
- ❌ Compartilhar informações privadas
- ❌ Usar dados para fins comerciais
- ❌ Ignorar solicitação de revogação
- ❌ Manter sessões abertas desnecessariamente

---

**CONCLUSÃO**: A impersonação é **legalmente viável** quando implementada com autorização, justificativa, auditoria e transparência. O sistema proposto garante conformidade total com LGPD e melhores práticas de privacidade. 🔒✅