import api from './axios';

export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = () => api.get('/admin/users');
export const getAdminMeasurements = () => api.get('/admin/measurements');
export const getAdminSmartGlucometers = () => api.get('/admin/smart-glucometers');