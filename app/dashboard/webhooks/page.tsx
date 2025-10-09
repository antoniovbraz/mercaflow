'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Webhook, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface WebhookLog {
  id: string;
  notification_id: string;
  topic: string;
  resource: string;
  user_id: number;
  application_id?: number;
  attempts: number;
  sent_at?: string;
  received_at?: string;
  processed_at: string;
  status: 'success' | 'error' | 'skipped';
  error_message?: string;
  resource_data?: Record<string, unknown>;
  created_at: string;
}

interface WebhookResponse {
  webhooks: WebhookLog[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function WebhooksMonitor() {
  const [webhooks, setWebhooks] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicFilter, setTopicFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  });

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });

      if (topicFilter !== 'all') {
        params.append('topic', topicFilter);
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/ml/webhooks?${params}`);
      if (!response.ok) throw new Error('Erro ao buscar webhooks');

      const data: WebhookResponse = await response.json();
      setWebhooks(data.webhooks);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Erro ao buscar webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicFilter, statusFilter, pagination.offset]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skipped':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'skipped':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTopicColor = (topic: string) => {
    switch (topic) {
      case 'orders':
      case 'orders_v2':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'items':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'questions':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'claims':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Webhook className="h-8 w-8 text-blue-600" />
            Monitor de Webhooks ML
          </h1>
          <p className="text-gray-600 mt-2">
            Acompanhe notificações em tempo real do Mercado Livre
          </p>
        </div>
        <Button onClick={fetchWebhooks} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tópico</label>
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="orders">Pedidos</SelectItem>
                <SelectItem value="orders_v2">Pedidos v2</SelectItem>
                <SelectItem value="items">Itens</SelectItem>
                <SelectItem value="questions">Perguntas</SelectItem>
                <SelectItem value="claims">Reclamações</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="skipped">Ignorado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {webhooks.filter(w => w.status === 'success').length}
                </p>
                <p className="text-sm text-gray-600">Sucessos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {webhooks.filter(w => w.status === 'error').length}
                </p>
                <p className="text-sm text-gray-600">Erros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {webhooks.filter(w => w.status === 'skipped').length}
                </p>
                <p className="text-sm text-gray-600">Ignorados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Webhook className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {pagination.total}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <CardTitle>Webhooks Recebidos</CardTitle>
          <CardDescription>
            Últimas {webhooks.length} notificações de {pagination.total} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2">Carregando webhooks...</span>
            </div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum webhook encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(webhook.status)}
                        <Badge className={getTopicColor(webhook.topic)}>
                          {webhook.topic}
                        </Badge>
                        <Badge className={getStatusColor(webhook.status)}>
                          {webhook.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Tentativas: {webhook.attempts}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">
                        {webhook.resource}
                      </p>
                      <p className="text-sm text-gray-600">
                        ID: {webhook.notification_id}
                      </p>
                      {webhook.error_message && (
                        <p className="text-sm text-red-600 mt-2">
                          <strong>Erro:</strong> {webhook.error_message}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{formatDate(webhook.created_at)}</p>
                      <p className="text-xs">
                        Processado: {formatDate(webhook.processed_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
            disabled={loading}
          >
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  );
}