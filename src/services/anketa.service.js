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
  publicSubmit: (data) => http.post(`${BASE}/public/submit`, data),
  approveSubmission: (id) => http.post(`${BASE}/submission/approve/${id}`),
  rejectSubmission: (id, reason) => http.post(`${BASE}/submission/reject/${id}`, { reason }),
  postFreeAd: (id) => http.post(`${BASE}/free-ad/post/${id}`),
  approveFreeAd: (id) => http.post(`${BASE}/free-ad/approve/${id}`),
  rejectFreeAd: (id, reason) => http.post(`${BASE}/free-ad/reject/${id}`, { reason }),
}
