import api from './axios'

export const becomePatient = (data) =>
  api.post('/become-patient', data)