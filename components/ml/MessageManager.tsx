/**
 * MLMessageManager Component
 * 
 * Comprehensive message management system for MercadoLivre integrations.
 * Handles conversation viewing, message sending, template management, and auto-responses.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  MessageSquare, 
  Send, 
  RefreshCcw, 
  Plus, 
  Edit,
  Trash2,

  User,
  Bot,
  Paperclip
} from 'lucide-react';

interface MLMessage {
  id: string;
  integration_id: string;
  integration_name: string;
  ml_message_id: string;
  ml_pack_id: string;
  ml_order_id?: string;
  from_user_id: string;
  from_user_name?: string;
  to_user_id: string;
  to_user_name?: string;
  subject?: string;
  text_content: string;
  status: string;
  moderation_status: string;
  is_read: boolean;
  is_seller_message: boolean;
  attachments?: Record<string, string | number | boolean>;
  ml_date_created: string;
  created_at: string;
}

interface MLMessageTemplate {
  id: string;
  integration_id: string;
  name: string;
  content: string;
  keywords: string[];
  is_active: boolean;
  priority: number;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
}

interface MLIntegration {
  id: string;
  integration_name: string;
  ml_user_id: string;
  status: string;
  is_active: boolean;
}

export default function MLMessageManager() {
  const [integrations, setIntegrations] = useState<MLIntegration[]>([]);
  const [messages, setMessages] = useState<MLMessage[]>([]);
  const [templates, setTemplates] = useState<MLMessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  
  // New message form
  const [newMessage, setNewMessage] = useState({
    pack_id: '',
    to_user_id: '',
    message_text: '',
    template_id: ''
  });

  // Template form
  const [templateForm, setTemplateForm] = useState({
    id: '',
    name: '',
    content: '',
    keywords: [] as string[],
    is_active: true,
    priority: 1
  });
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    unread_only: false,
    pack_id: '',
    order_id: ''
  });

  /**
   * Load integrations from API
   */
  const loadIntegrations = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ml/status');
      const data = await response.json();

      if (response.ok && data.integration) {
        setIntegrations([{
          id: data.integration.id,
          integration_name: data.integration.ml_nickname || 'MercadoLivre',
          ml_user_id: data.integration.ml_user_id.toString(),
          status: data.integration.status,
          is_active: data.integration.status === 'active'
        }]);
      } else {
        setIntegrations([]);
      }
    } catch (error) {
      console.error('❌ Error loading integrations:', error);
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load integrations on component mount
  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  // Load messages and templates on integration selection
  useEffect(() => {
    if (integrations.length > 0 && !selectedIntegration) {
      setSelectedIntegration(integrations[0].id);
    }
  }, [integrations, selectedIntegration]);

  /**
   * Load messages from API
   */
  const loadMessages = React.useCallback(async (sync = false) => {
    if (!selectedIntegration) return;

    try {
      setLoading(true);
      if (sync) setSyncing(true);

      const params = new URLSearchParams({
        ...(filters.unread_only && { unread_only: 'true' }),
        ...(filters.pack_id && { pack_id: filters.pack_id }),
        ...(filters.order_id && { order_id: filters.order_id }),
        ...(sync && { sync: 'true' })
      });

      const response = await fetch(`/api/ml/messages?${params}`);
      const data = await response.json();

      if (response.ok) {
        const integrationMessages = data.messages.filter(
          (msg: MLMessage) => msg.integration_id === selectedIntegration
        );
        setMessages(integrationMessages);
        console.log(`✅ Loaded ${integrationMessages.length} messages`);
      } else {
        console.error('❌ Failed to load messages:', data.error);
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [selectedIntegration, filters]);

  /**
   * Load message templates from API
   */
  const loadTemplates = React.useCallback(async () => {
    if (!selectedIntegration) return;

    try {
      const response = await fetch(`/api/ml/messages/templates?integration_id=${selectedIntegration}`);
      const data = await response.json();

      if (response.ok) {
        setTemplates(data.templates || []);
        console.log(`✅ Loaded ${data.templates?.length || 0} templates`);
      } else {
        console.error('❌ Failed to load templates:', data.error);
      }
    } catch (error) {
      console.error('❌ Error loading templates:', error);
    }
  }, [selectedIntegration]);

  // Load messages and templates when dependencies change
  useEffect(() => {
    if (selectedIntegration) {
      loadMessages();
      loadTemplates();
    }
  }, [selectedIntegration, filters.unread_only, filters.pack_id, filters.order_id, loadMessages, loadTemplates]);

  /**
   * Send a new message
   */
  const handleSendMessage = async () => {
    if (!selectedIntegration || !newMessage.pack_id || !newMessage.to_user_id || !newMessage.message_text) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/ml/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integration_id: selectedIntegration,
          ...newMessage
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Message sent successfully');
        setNewMessage({ pack_id: '', to_user_id: '', message_text: '', template_id: '' });
        loadMessages(); // Reload messages
      } else {
        console.error('❌ Failed to send message:', data.error);
        alert(`Erro ao enviar mensagem: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create or update template
   */
  const handleSaveTemplate = async () => {
    if (!selectedIntegration || !templateForm.name || !templateForm.content) {
      alert('Por favor, preencha nome e conteúdo do template');
      return;
    }

    try {
      setLoading(true);

      const method = isEditingTemplate ? 'PUT' : 'POST';
      const response = await fetch('/api/ml/messages/templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...templateForm,
          integration_id: selectedIntegration
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Template ${isEditingTemplate ? 'updated' : 'created'} successfully`);
        resetTemplateForm();
        loadTemplates(); // Reload templates
      } else {
        console.error(`❌ Failed to ${isEditingTemplate ? 'update' : 'create'} template:`, data.error);
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Error saving template:', error);
      alert('Erro ao salvar template');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete template
   */
  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/ml/messages/templates?id=${templateId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Template deleted successfully');
        loadTemplates(); // Reload templates
      } else {
        console.error('❌ Failed to delete template:', data.error);
        alert(`Erro ao excluir template: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Error deleting template:', error);
      alert('Erro ao excluir template');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Use template for new message
   */
  const applyTemplate = (template: MLMessageTemplate) => {
    setNewMessage(prev => ({
      ...prev,
      message_text: template.content,
      template_id: template.id
    }));
  };

  /**
   * Edit template
   */
  const editTemplate = (template: MLMessageTemplate) => {
    setTemplateForm({
      id: template.id,
      name: template.name,
      content: template.content,
      keywords: template.keywords || [],
      is_active: template.is_active,
      priority: template.priority
    });
    setIsEditingTemplate(true);
  };

  /**
   * Reset template form
   */
  const resetTemplateForm = () => {
    setTemplateForm({
      id: '',
      name: '',
      content: '',
      keywords: [],
      is_active: true,
      priority: 1
    });
    setIsEditingTemplate(false);
    setKeywordInput('');
  };

  /**
   * Add keyword to template
   */
  const addKeyword = () => {
    if (keywordInput.trim() && !templateForm.keywords.includes(keywordInput.trim())) {
      setTemplateForm(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  /**
   * Remove keyword from template
   */
  const removeKeyword = (keyword: string) => {
    setTemplateForm(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (integrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages do MercadoLivre
          </CardTitle>
          <CardDescription>
            Sistema de mensagens para comunicação com compradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Nenhuma integração ativa encontrada. Configure uma integração primeiro.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages do MercadoLivre
          </CardTitle>
          <CardDescription>
            Gerencie conversas com compradores, envie mensagens e configure respostas automáticas
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">Conversas</TabsTrigger>
          <TabsTrigger value="send">Enviar Mensagem</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Conversas</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadMessages(true)}
                    disabled={syncing}
                  >
                    <RefreshCcw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Sincronizando...' : 'Sincronizar'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Integration and Filters */}
              <div className="mb-4 flex flex-wrap gap-4">
                <div>
                  <Label htmlFor="integration">Integração</Label>
                  <select
                    id="integration"
                    value={selectedIntegration}
                    onChange={(e) => setSelectedIntegration(e.target.value)}
                    className="mt-1 block rounded-md border border-gray-300 px-3 py-2"
                  >
                    {integrations.map(integration => (
                      <option key={integration.id} value={integration.id}>
                        {integration.integration_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="pack_id">Pack ID</Label>
                  <Input
                    id="pack_id"
                    placeholder="Filtrar por Pack ID"
                    value={filters.pack_id}
                    onChange={(e) => setFilters(prev => ({ ...prev, pack_id: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="unread_only"
                    checked={filters.unread_only}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, unread_only: checked }))}
                  />
                  <Label htmlFor="unread_only">Apenas não lidas</Label>
                </div>
              </div>

              {/* Messages List */}
              <div className="space-y-4">
                {loading && messages.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Carregando mensagens...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Nenhuma mensagem encontrada. Clique em &quot;Sincronizar&quot; para buscar novas mensagens.
                  </p>
                ) : (
                  messages.map(message => (
                    <Card key={message.id} className={`${!message.is_read ? 'border-blue-200 bg-blue-50/50' : ''}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {message.is_seller_message ? (
                              <User className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Bot className="h-4 w-4 text-green-600" />
                            )}
                            <span className="font-medium">
                              {message.is_seller_message ? 'Você' : message.from_user_name || 'Comprador'}
                            </span>
                            {message.attachments && (
                              <Paperclip className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(message.status)}>
                              {message.status}
                            </Badge>
                            {!message.is_read && (
                              <Badge variant="secondary">Nova</Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
                          {message.text_content}
                        </p>

                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Pack: {message.ml_pack_id}</span>
                          <span>{formatDate(message.ml_date_created)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Nova Mensagem</CardTitle>
              <CardDescription>
                Envie uma mensagem para um comprador específico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="send_integration">Integração</Label>
                <select
                  id="send_integration"
                  value={selectedIntegration}
                  onChange={(e) => setSelectedIntegration(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  {integrations.map(integration => (
                    <option key={integration.id} value={integration.id}>
                      {integration.integration_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pack_id_send">Pack ID *</Label>
                  <Input
                    id="pack_id_send"
                    placeholder="Ex: 2000000012345"
                    value={newMessage.pack_id}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, pack_id: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="to_user_id">ID do Usuário *</Label>
                  <Input
                    id="to_user_id"
                    placeholder="Ex: 123456789"
                    value={newMessage.to_user_id}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, to_user_id: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message_text">Mensagem *</Label>
                <Textarea
                  id="message_text"
                  placeholder="Digite sua mensagem aqui..."
                  value={newMessage.message_text}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, message_text: e.target.value }))}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo 350 caracteres
                </p>
              </div>

              {templates.length > 0 && (
                <div>
                  <Label>Templates Disponíveis</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {templates.filter(t => t.is_active).map(template => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(template)}
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleSendMessage}
                disabled={loading || !newMessage.pack_id || !newMessage.to_user_id || !newMessage.message_text}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Templates de Mensagem</CardTitle>
                  <CardDescription>
                    Crie templates para respostas rápidas e consistentes
                  </CardDescription>
                </div>
                <Button onClick={resetTemplateForm} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Form */}
              <Card className="border-2 border-dashed">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template_name">Nome do Template *</Label>
                      <Input
                        id="template_name"
                        placeholder="Ex: Confirmação de Pagamento"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="template_priority">Prioridade</Label>
                      <Input
                        id="template_priority"
                        type="number"
                        min="1"
                        max="10"
                        value={templateForm.priority}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="template_content">Conteúdo *</Label>
                    <Textarea
                      id="template_content"
                      placeholder="Digite o conteúdo do template..."
                      value={templateForm.content}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Palavras-chave</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        placeholder="Adicionar palavra-chave"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      />
                      <Button variant="outline" onClick={addKeyword}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {templateForm.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {templateForm.keywords.map(keyword => (
                          <Badge key={keyword} variant="secondary" className="cursor-pointer">
                            {keyword}
                            <button
                              onClick={() => removeKeyword(keyword)}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="template_active"
                      checked={templateForm.is_active}
                      onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="template_active">Template ativo</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveTemplate}
                      disabled={loading || !templateForm.name || !templateForm.content}
                    >
                      {loading ? 'Salvando...' : isEditingTemplate ? 'Atualizar' : 'Criar Template'}
                    </Button>
                    {isEditingTemplate && (
                      <Button variant="outline" onClick={resetTemplateForm}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Templates List */}
              <div className="space-y-3">
                {templates.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Nenhum template criado ainda
                  </p>
                ) : (
                  templates.map(template => (
                    <Card key={template.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {template.name}
                              {!template.is_active && (
                                <Badge variant="secondary">Inativo</Badge>
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Prioridade: {template.priority} • Usado {template.usage_count} vezes
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editTemplate(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
                          {template.content}
                        </p>

                        {template.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {template.keywords.map(keyword => (
                              <Badge key={keyword} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Criado em {formatDate(template.created_at)}</span>
                          {template.last_used_at && (
                            <span>Último uso: {formatDate(template.last_used_at)}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}