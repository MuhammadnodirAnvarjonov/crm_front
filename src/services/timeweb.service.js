import http from './http'

export default {
  getInfo: () => http.get('/timeweb/info'),
}
