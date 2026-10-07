import api from './api';

export const incidentService = {
  async getIncidents(params = {}) {
    const response = await api.get('/incidents', { params });
    return response.data;
  },

  async getIncidentById(id) {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  },

  async createIncident(data) {
    const response = await api.post('/incidents', data);
    return response.data;
  },

  async updateIncident(id, data) {
    const response = await api.patch(`/incidents/${id}`, data);
    return response.data;
  },

  async deleteIncident(id) {
    const response = await api.delete(`/incidents/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/incidents/stats');
    return response.data;
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
