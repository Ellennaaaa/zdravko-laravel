import api from './axios'

export const getMeasurements = () => api.get('/measurements')

export const storeMeasurement = (data) => api.post('/measurements', data)

export const updateMeasurement = (id, data) => api.put(`/measurements/${id}`, data)

export const deleteMeasurement = (id) => api.delete(`/measurements/${id}`)