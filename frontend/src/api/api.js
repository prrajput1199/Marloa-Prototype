import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({ baseURL: `${API_URL}/api` });

export const api = {
  // Calls
  listCalls: (status) => client.get('/calls', { params: status ? { status } : {} }).then((r) => r.data),
  getCall: (id) => client.get(`/calls/${id}`).then((r) => r.data),
  createCall: (payload) => client.post('/calls', payload).then((r) => r.data),
  addMessage: (id, payload) => client.post(`/calls/${id}/messages`, payload).then((r) => r.data),
  updateStatus: (id, status) => client.patch(`/calls/${id}/status`, { status }).then((r) => r.data),
  resolveCall: (id, payload) => client.post(`/calls/${id}/resolve`, payload).then((r) => r.data),

  // Outcomes
  listOutcomes: (type) => client.get('/outcomes', { params: type ? { type } : {} }).then((r) => r.data),

  // Simulator
  listScenarios: () => client.get('/simulator/scenarios').then((r) => r.data),
  runScenario: (scenarioId) => client.post('/simulator/run', scenarioId ? { scenarioId } : {}).then((r) => r.data),
};

export default api;