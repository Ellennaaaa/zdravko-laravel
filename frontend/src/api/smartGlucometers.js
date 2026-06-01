import api from './axios'

export const getSmartGlucometers = () =>
  api.get('/smart-glucometers')

export const storeSmartGlucometer = (data) =>
  api.post('/smart-glucometers', data)

export const deleteSmartGlucometer = (id) =>
  api.delete(`/smart-glucometers/${id}`)