import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('farmdirect_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error.response) return 'The FarmDirect server is unavailable. Please try again.'
  const detail = error.response.data?.detail
  if (error.response.status === 401) return 'Your session has expired. Please sign in again.'
  if (error.response.status === 403) return 'You do not have permission to do that.'
  if (error.response.status === 404) return 'The requested item was not found.'
  if (error.response.status === 409) return detail || 'This request conflicts with the current inventory.'
  if (error.response.status === 422) {
    if (Array.isArray(detail)) return detail.map((item) => item.msg).join(' ')
    return detail || 'Please check the information you entered.'
  }
  return detail || fallback
}

export default api
