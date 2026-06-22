import api from './axios';

export const sendSos = () => api.post('/sos');