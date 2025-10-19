"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logger } from "@/utils/logger";

export function ConfiguracoesContent() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    notifyNewOrder: true,
    notifyNewQuestion: true,
    notifyLowStock: false,
    autoPrice: false,
    priceMargin: 30,
    syncInterval: 30,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      logger.info("Saving settings", { settings });
      // TODO: Implement API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Configurações salvas com sucesso!");
    } catch (error) {
      logger.error("Error saving settings", { error });
      alert("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Configurações
        </h1>
        <p className="text-gray-600">Gerencie as preferências da sua conta</p>
      </div>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="precificacao">Precificação</TabsTrigger>
          <TabsTrigger value="sincronizacao">Sincronização</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Empresa */}
        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>Dados cadastrais e contato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) =>
                    setSettings({ ...settings, companyName: e.target.value })
                  }
                  placeholder="Minha Loja Ltda"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail">E-mail</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, companyEmail: e.target.value })
                  }
                  placeholder="contato@minhaloja.com.br"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPhone">Telefone</Label>
                <Input
                  id="companyPhone"
                  value={settings.companyPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, companyPhone: e.target.value })
                  }
                  placeholder="(11) 98765-4321"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificações</CardTitle>
              <CardDescription>
                Escolha quais notificações deseja receber
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Novos Pedidos</p>
                  <p className="text-sm text-gray-500">
                    Receber notificações de novos pedidos
                  </p>
                </div>
                <Switch
                  checked={settings.notifyNewOrder}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, notifyNewOrder: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Novas Perguntas</p>
                  <p className="text-sm text-gray-500">
                    Receber notificações de perguntas de clientes
                  </p>
                </div>
                <Switch
                  checked={settings.notifyNewQuestion}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, notifyNewQuestion: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Estoque Baixo</p>
                  <p className="text-sm text-gray-500">
                    Alertas quando produtos estiverem acabando
                  </p>
                </div>
                <Switch
                  checked={settings.notifyLowStock}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, notifyLowStock: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Precificação */}
        <TabsContent value="precificacao">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Precificação</CardTitle>
              <CardDescription>
                Configure margens e regras automáticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Precificação Automática</p>
                  <p className="text-sm text-gray-500">
                    Ajustar preços automaticamente baseado em regras
                  </p>
                </div>
                <Switch
                  checked={settings.autoPrice}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoPrice: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceMargin">Margem de Lucro Padrão (%)</Label>
                <Input
                  id="priceMargin"
                  type="number"
                  value={settings.priceMargin}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      priceMargin: parseInt(e.target.value),
                    })
                  }
                  min="0"
                  max="100"
                />
              </div>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-blue-700">
                      A precificação automática será aplicada apenas a novos
                      produtos. Produtos existentes não serão alterados
                      automaticamente.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sincronização */}
        <TabsContent value="sincronizacao">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Sincronização</CardTitle>
              <CardDescription>
                Configure como os dados são sincronizados com o Mercado Livre
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="syncInterval">
                  Intervalo de Sincronização (minutos)
                </Label>
                <Input
                  id="syncInterval"
                  type="number"
                  value={settings.syncInterval}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      syncInterval: parseInt(e.target.value),
                    })
                  }
                  min="5"
                  max="1440"
                />
                <p className="text-sm text-gray-500">
                  Mínimo: 5 minutos | Máximo: 1440 minutos (24 horas)
                </p>
              </div>
              <div className="pt-4">
                <Button variant="outline">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Sincronizar Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Respostas</CardTitle>
              <CardDescription>
                Mensagens prontas para responder perguntas frequentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template1">Template: Prazo de Entrega</Label>
                <Textarea
                  id="template1"
                  placeholder="Olá! O prazo de entrega para sua região é de..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template2">Template: Produto em Estoque</Label>
                <Textarea
                  id="template2"
                  placeholder="Sim, temos este produto em estoque! Faça seu pedido que..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template3">Template: Formas de Pagamento</Label>
                <Textarea
                  id="template3"
                  placeholder="Aceitamos todas as formas de pagamento disponíveis no Mercado Livre..."
                  rows={3}
                />
              </div>
              <Button variant="outline">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Adicionar Novo Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Salvando...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
