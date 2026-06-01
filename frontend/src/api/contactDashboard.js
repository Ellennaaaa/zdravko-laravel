import api from './axios'

export const getContactPatients = () => {
  return api.get('/contact/patients')
}

export const getContactDashboard = (patientId) => {
  return api.get(`/contact/dashboard/${patientId}`)
}