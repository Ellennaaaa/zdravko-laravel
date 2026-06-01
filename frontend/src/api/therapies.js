import api from './axios'

export const getTherapies = () => api.get('/therapies')
export const storeTherapy = (data) => api.post('/therapies', data)
export const updateTherapy = (id, data) => api.put(`/therapies/${id}`, data)
export const deleteTherapy = (id) => api.delete(`/therapies/${id}`)

export const getTherapyLogs = () => api.get('/therapy-logs')
export const storeTherapyLog = (data) => api.post('/therapy-logs', data)
export const deleteTherapyLog = (id) => api.delete(`/therapy-logs/${id}`)