import api from './axios'

export const getAdminEducativeAdvices = () =>
  api.get('/admin/educative-advices')

export const storeAdminEducativeAdvice = (data) =>
  api.post('/admin/educative-advices', data)

export const deleteAdminEducativeAdvice = (id) =>
  api.delete(`/admin/educative-advices/${id}`)