"use client";

import { trpc } from "@/lib/trpc/client";
import { Bell, X, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCountQuery = trpc.notifications.getUnreadCount.useQuery();
  const listQuery = trpc.notifications.list.useQuery({
    page: 1,
    pageSize: 10,
  });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      unreadCountQuery.refetch();
      listQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      unreadCountQuery.refetch();
      listQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      unreadCountQuery.refetch();
      listQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const notifications = listQuery.data?.items || [];
  const unreadCount = unreadCountQuery.data?.unreadCount || 0;

  type NotificationType =
    | "status_change"
    | "document_processed"
    | "validation_complete"
    | "calculation_complete"
    | "petition_generated"
    | "exception_raised"
    | "system_info"
    | "system_warning"
    | "system_error";

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "status_change":
        return "border-l-4 border-blue-500 bg-blue-50";
      case "document_processed":
        return "border-l-4 border-green-500 bg-green-50";
      case "validation_complete":
        return "border-l-4 border-green-500 bg-green-50";
      case "calculation_complete":
        return "border-l-4 border-purple-500 bg-purple-50";
      case "petition_generated":
        return "border-l-4 border-amber-500 bg-amber-50";
      case "exception_raised":
        return "border-l-4 border-red-500 bg-red-50";
      case "system_warning":
        return "border-l-4 border-yellow-500 bg-yellow-50";
      case "system_error":
        return "border-l-4 border-red-600 bg-red-50";
      default:
        return "border-l-4 border-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notificações</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
                  disabled={markAllAsReadMutation.isPending}
                >
                  Marcar como lido
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {listQuery.isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Carregando...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${getNotificationColor(notification.type as NotificationType)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={() =>
                              markAsReadMutation.mutate({
                                notificationId: notification.id,
                              })
                            }
                            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-white"
                            disabled={markAsReadMutation.isPending}
                            title="Marcar como lido"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            deleteMutation.mutate({
                              notificationId: notification.id,
                            })
                          }
                          className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-white"
                          disabled={deleteMutation.isPending}
                          title="Deletar notificação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
