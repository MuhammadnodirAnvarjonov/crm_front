import axios from 'axios'
import router from '@/router'
import { useErrorStore } from '@/stores/errors'

const baseURL = import.meta.env.VITE_API_BASE_URL

const http = axios.create({ baseURL })

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    config.headers['Accept-Language'] = localStorage.getItem('lang') || 'uz'
    return config
  },
  (error) => Promise.reject(error),
)

http.interceptors.response.use(
  (response) => {
    const errorStore = useErrorStore()
    const body = response.data

    // Backend envelope: { error_code, errors, success, message, data }
    if (body && typeof body === 'object' && 'error_code' in body) {
      if (body.success) return body.data

      // Failure envelope — push message, redirect on 401 / jwt expired
      errorStore.error_text = body.message || "Xatolik yuz berdi"

      if (body.error_code === 401 || body.message === 'jwt expired') {
        localStorage.clear()
        if (router.currentRoute.value.name !== 'Login') {
          router.push({ name: 'Login' })
        }
      }
      return Promise.reject(body)
    }

    return body
  },
  (error) => {
    const errorStore = useErrorStore()
    errorStore.error_text = error.message === 'Network Error'
      ? 'Internet yoki baza bilan aloqa uzildi'
      : (error.response?.data?.message || 'Kutilmagan xatolik yuz berdi')
    return Promise.reject(error)
  },
)

export default http
