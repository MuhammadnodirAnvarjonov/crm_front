import http from './http'

const BASE = '/users'

export default {
  all: (params = {}) => http.get(`${BASE}/all`, { params }),
  getOne: (id) => http.get(`${BASE}/getByUserId/${id}`),
  getCurrentUser: () => http.get(`${BASE}/getUser`),
  create: (data) => http.post(`${BASE}/create`, data),
  update: (id, data) => http.patch(`${BASE}/update/${id}`, data),
  delete: (id) => http.delete(`${BASE}/delete/${id}`),
  login: (credentials) => http.post(`${BASE}/login`, credentials),
  register: (data) => http.post(`${BASE}/register`, data),
}
