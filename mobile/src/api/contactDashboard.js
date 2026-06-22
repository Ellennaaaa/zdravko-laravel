import api from './axios';

export const getContactPatients = () => api.get('/contact/patients');
export const getContactDashboard = (patientId) => api.get(`/contact/dashboard/${patientId}`);