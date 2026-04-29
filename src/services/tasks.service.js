import http from './http'

const BASE = '/task'

export default {
  all: (filter = {}) => http.get(`${BASE}/all`, { params: filter }),
  getById: (id) => http.get(`${BASE}/getById/${id}`),
  create: (data) => http.post(`${BASE}/create`, data),
  update: (id, data) => http.patch(`${BASE}/update/${id}`, data),
  delete: (id) => http.delete(`${BASE}/delete/${id}`),
  start: (id) => http.post(`${BASE}/start/${id}`),
  complete: (id, outcome) => http.post(`${BASE}/complete/${id}`, { outcome }),
}
