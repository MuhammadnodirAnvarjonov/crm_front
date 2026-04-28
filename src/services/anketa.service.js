import http from './http'

const BASE = '/anketa'

export default {
  all: (filter = {}) => http.get(`${BASE}/all`, { params: filter }),
  getById: (id) => http.get(`${BASE}/getById/${id}`),
  create: (data) => http.post(`${BASE}/create`, data),
  update: (id, data) => http.patch(`${BASE}/update/${id}`, data),
  delete: (id) => http.delete(`${BASE}/delete/${id}`),
  statuses: () => http.get(`${BASE}/statuses`),
  addToBlacklist: (id, reason) => http.post(`${BASE}/blacklist/${id}`, { reason }),
  removeFromBlacklist: (id) => http.post(`${BASE}/unblacklist/${id}`),
}
