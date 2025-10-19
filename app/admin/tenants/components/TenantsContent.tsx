"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { logger } from "@/utils/logger";

interface Tenant {
  id: string;
  name: string;
  created_at: string;
  status: "active" | "inactive" | "suspended";
  user_count: number;
  product_count: number;
  order_count: number;
}

export function TenantsContent() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [creating, setCreating] = useState(false);

  const loadTenants = useCallback(async () => {
    try {
      setLoading(true);
      logger.info("Loading tenants");

      // TODO: Implement API call to fetch tenants
      // Mock data for now
      const mockTenants: Tenant[] = [
        {
          id: "1",
          name: "Loja Exemplo 1",
          created_at: new Date().toISOString(),
          status: "active",
          user_count: 5,
          product_count: 150,
          order_count: 320,
        },
        {
          id: "2",
          name: "Mega Store",
          created_at: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "active",
          user_count: 12,
          product_count: 850,
          order_count: 1250,
        },
      ];

      setTenants(mockTenants);
    } catch (error) {
      logger.error("Error loading tenants", { error });
      alert("Erro ao carregar tenants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const handleCreateTenant = async () => {
    if (!newTenantName.trim()) {
      alert("Por favor, informe o nome do tenant");
      return;
    }

    try {
      setCreating(true);
      logger.info("Creating tenant", { name: newTenantName });

      // TODO: Implement API call to create tenant
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Tenant criado com sucesso!");
      setCreateDialogOpen(false);
      setNewTenantName("");
      loadTenants();
    } catch (error) {
      logger.error("Error creating tenant", { error });
      alert("Erro ao criar tenant");
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: Tenant["status"]) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive",
    } as const;

    const labels = {
      active: "Ativo",
      inactive: "Inativo",
      suspended: "Suspenso",
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Gestão de Tenants
            </h1>
            <p className="text-gray-600">
              Gerenciar todos os tenants da plataforma (Super Admin)
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Novo Tenant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Tenant</DialogTitle>
                <DialogDescription>
                  Adicione um novo tenant à plataforma
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantName">Nome do Tenant</Label>
                  <Input
                    id="tenantName"
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    placeholder="Exemplo: Minha Loja Ltda"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    disabled={creating}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTenant} disabled={creating}>
                    {creating ? "Criando..." : "Criar Tenant"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Tenants</CardDescription>
            <CardTitle className="text-3xl">{tenants.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tenants Ativos</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {tenants.filter((t) => t.status === "active").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Usuários</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {tenants.reduce((sum, t) => sum + t.user_count, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Produtos</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {tenants.reduce((sum, t) => sum + t.product_count, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tenants List */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Tenants</CardTitle>
          <CardDescription>
            Lista completa de tenants cadastrados na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tenants.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <p className="text-gray-500">Nenhum tenant cadastrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Usuários
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Produtos
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Pedidos
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Criado em
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{tenant.name}</td>
                        <td className="py-3 px-4">
                          {getStatusBadge(tenant.status)}
                        </td>
                        <td className="py-3 px-4">{tenant.user_count}</td>
                        <td className="py-3 px-4">{tenant.product_count}</td>
                        <td className="py-3 px-4">{tenant.order_count}</td>
                        <td className="py-3 px-4">
                          {new Date(tenant.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </Button>
                            <Button variant="outline" size="sm">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                              </svg>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Note */}
      <Card className="mt-8 bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-purple-600 mt-0.5"
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
            <div>
              <p className="font-medium text-purple-900 mb-1">
                Área Restrita - Super Admin
              </p>
              <p className="text-sm text-purple-700">
                Esta página é visível apenas para usuários com permissão de
                Super Admin. Todas as ações realizadas aqui afetam diretamente
                os tenants da plataforma.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
