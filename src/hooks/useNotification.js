import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '../api/notificationService';

export const useMyNotifications = (page = 1, pageSize = 10) =>
  useQuery({
    queryKey: ['notifications', 'my', page, pageSize],
    queryFn: () => notificationService.getMyNotifications(page, pageSize),
    refetchInterval: 15000, // Poll every 15s to simulate real-time push alerts
  });

export const useNotificationUnreadCount = () =>
  useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 15000, // Poll count every 15s
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useNotificationTemplates = () =>
  useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => notificationService.getTemplates(),
  });

export const useUpdateNotificationTemplate = (code) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => notificationService.updateTemplate(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
  });
};
