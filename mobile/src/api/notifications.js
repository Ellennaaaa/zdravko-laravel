import api from './axios';

export const getUnreadNotifications = () => api.get('/notifications/unread');
export const markNotificationAsRead = (id) => api.post(`/notifications/${id}/read`);