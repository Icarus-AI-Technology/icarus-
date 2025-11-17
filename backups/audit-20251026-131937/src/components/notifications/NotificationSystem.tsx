import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bell,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react";

interface Notification {
  id: string;
  tipo: string;
  severidade: string;
  titulo: string;
  descricao: string;
  criado_em: string;
  lido: boolean;
}

export const NotificationSystem: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Carregar notificações
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("system_alerts")
        .select("*")
        .contains("destinatarios", [user.role || "user"])
        .eq("resolvido", false)
        .order("criado_em", { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.lido).length);
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error as Error);
    }
  }, [user]);

  // Subscrever a notificações em tempo real
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    // Configurar subscription para novos alertas
    const channel = supabase
      .channel("system_alerts_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "system_alerts",
        },
        (payload) => {
          const newAlert = payload.new as Notification;

          // Verificar se o alerta é destinado ao usuário atual
          if (newAlert.destinatarios?.includes(user.role || "user")) {
            setNotifications((prev) => [newAlert, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Mostrar notificação do navegador
            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification(newAlert.titulo, {
                body: newAlert.descricao,
                icon: "/logo.png",
                badge: "/logo.png",
              });
            }
          }
        },
      )
      .subscribe();

    // Solicitar permissão para notificações do navegador
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadNotifications]);

  // Marcar como lida
  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("system_alerts")
        .update({ lido: true })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, lido: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao marcar como lida:", err);
    }
  };

  // Resolver notificação
  const resolveNotification = async (notificationId: string) => {
    try {
      await supabase
        .from("system_alerts")
        .update({ resolvido: true })
        .eq("id", notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      loadNotifications();
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao resolver notificação:", err);
    }
  };

  const getIcon = (severidade: string) => {
    switch (severidade) {
      case "critico":
        return <AlertOctagon className="w-5 h-5 text-red-600" />;
      case "urgente":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case "atencao":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  // getSeverityColor removido (não utilizado)

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notificações</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded transition"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 ${!notification.lido ? "bg-blue-50" : "bg-white"} hover:bg-gray-50 transition`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.severidade)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm text-gray-900">
                            {notification.titulo}
                          </h4>
                          {!notification.lido && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="ml-2 p-1 hover:bg-gray-200 rounded transition"
                              title="Marcar como lida"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {notification.descricao}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.criado_em).toLocaleString(
                              "pt-BR",
                            )}
                          </span>
                          <button
                            onClick={() => resolveNotification(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Resolver
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={loadNotifications}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Atualizar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};
