import api from './axios'

export const getWeeklyGlucose = () =>
  api.get('/dashboard/blood-glucose/weekly')

export const getMonthlyGlucose = () =>
  api.get('/dashboard/blood-glucose/monthly')

export const getWeeklyTherapy = () =>
  api.get('/dashboard/therapy/weekly')

export const getMonthlyTherapy = () =>
  api.get('/dashboard/therapy/monthly')