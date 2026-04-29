import http from './http'

export default {
  dashboard: () => http.get('/stats/dashboard'),
}
