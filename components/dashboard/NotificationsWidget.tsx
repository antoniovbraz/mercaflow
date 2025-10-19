"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageCircle, ShoppingBag, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { logger } from "@/utils/logger";

interface NotificationData {
  unansweredQuestions: number;
  pendingOrders: number;
  alerts: number;
  urgentCount: number;
}

interface NotificationItemProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  urgent?: boolean;
  href: string;
  description: string;
  color: string;
}

function NotificationItem({
  icon,
  title,
  count,
  urgent = false,
  href,
  description,
  color,
}: NotificationItemProps) {
  return (
    <Link href={href}>
      <div className="group flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-white hover:bg-gray-50">
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all`}
          >
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                {title}
              </h4>
              {urgent && (
                <Badge
                  variant="destructive"
                  className="animate-pulse text-xs px-2 py-0.5"
                >
                  Urgente
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {count > 0 ? (
            <Badge
              variant={urgent ? "destructive" : "default"}
              className={`text-base font-bold px-3 py-1 ${
                urgent ? "animate-pulse" : ""
              }`}
            >
              {count}
            </Badge>
          ) : (
            <span className="text-xs text-gray-400 font-medium">Nenhum</span>
          )}
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export function NotificationsWidget() {
  const [notifications, setNotifications] = useState<NotificationData>({
    unansweredQuestions: 0,
    pendingOrders: 0,
    alerts: 0,
    urgentCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/notifications");

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setNotifications(data.data);
      } else {
        throw new Error(data.error || "Invalid response format");
      }
    } catch (err) {
      logger.error("Failed to fetch notifications", { error: err });
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);

    return () => clearInterval(interval);
  }, []);

  const totalCount =
    notifications.unansweredQuestions +
    notifications.pendingOrders +
    notifications.alerts;

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl border-2 border-gray-200/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Central de Notificações
              </h3>
              <p className="text-sm text-blue-100">
                Acompanhe suas pendências em tempo real
              </p>
            </div>
          </div>
          {totalCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-white text-blue-600 text-lg font-bold px-4 py-2"
            >
              {totalCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-4">
              Erro ao carregar notificações
            </p>
            <button
              onClick={fetchNotifications}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <NotificationItem
              icon={<MessageCircle className="w-6 h-6 text-white" />}
              title="Perguntas Não Respondidas"
              count={notifications.unansweredQuestions}
              urgent={notifications.unansweredQuestions > 5}
              href="/ml/questions"
              description="Clientes aguardando resposta"
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />

            <NotificationItem
              icon={<ShoppingBag className="w-6 h-6 text-white" />}
              title="Pedidos Pendentes"
              count={notifications.pendingOrders}
              urgent={notifications.pendingOrders > 10}
              href="/pedidos"
              description="Pedidos aguardando processamento"
              color="bg-gradient-to-br from-green-500 to-green-600"
            />

            <NotificationItem
              icon={<AlertTriangle className="w-6 h-6 text-white" />}
              title="Alertas de Anomalias"
              count={notifications.alerts}
              urgent={notifications.alerts > 0}
              href="/dashboard"
              description="Preços ou métricas fora do padrão"
              color="bg-gradient-to-br from-orange-500 to-red-600"
            />

            {/* Summary */}
            {totalCount === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
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
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Tudo em dia! 🎉
                </h4>
                <p className="text-sm text-gray-500">
                  Não há pendências no momento
                </p>
              </div>
            )}

            {notifications.urgentCount > 0 && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900">
                      {notifications.urgentCount}{" "}
                      {notifications.urgentCount === 1 ? "item" : "itens"}{" "}
                      urgente
                      {notifications.urgentCount > 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-red-700">
                      Requer atenção imediata
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Atualizado automaticamente a cada 2 minutos</span>
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Atualizando..." : "Atualizar agora"}
          </button>
        </div>
      </div>
    </Card>
  );
}
