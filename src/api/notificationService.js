import client from './client';

export const notificationService = {
  // Get paged notifications
  getMyNotifications: async (page = 1, pageSize = 10) => {
    const response = await client.get('/api/notifications', {
      params: { page, pageSize },
    });
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const response = await client.get('/api/notifications/unread-count');
    return response.data;
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    const response = await client.post(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await client.post('/api/notifications/read-all');
    return response.data;
  },

  // Get all templates (Staff/Admin)
  getTemplates: async () => {
    const response = await client.get('/api/notifications/templates');
    return response.data;
  },

  // Update a template definition (Staff/Admin)
  updateTemplate: async (code, data) => {
    const response = await client.put(`/api/notifications/templates/${code}`, data);
    return response.data;
  },
};

export default notificationService;
