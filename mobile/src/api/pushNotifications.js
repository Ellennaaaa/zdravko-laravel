import api from './axios'

export const savePushToken = (token) =>
  api.post('/push-token', { token })