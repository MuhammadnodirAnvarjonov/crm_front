import http from './http'

export default {
  dashboard: () => http.get('/stats/dashboard'),
  counts: () => http.get('/stats/counts'),
}
