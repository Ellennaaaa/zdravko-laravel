import api from './axios';

export const getEmergencyContactInvitations = () => api.get('/emergency-contact-invitations');
export const sendEmergencyContactInvitation = (data) => api.post('/emergency-contact-invitations', data);
export const getEmergencyContacts = () => api.get('/emergency-contacts');
export const deleteEmergencyContact = (id) => api.delete(`/emergency-contacts/${id}`);
export const acceptContactInvitation = (data) => api.post('/contact-invitations/accept', data);