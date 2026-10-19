import axios from 'axios'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

// anexa o token em toda requisição, se existir
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const loginFalhou = axios.isAxiosError(error) && error.config?.url?.includes('/auth/login')
    if (axios.isAxiosError(error) && error.response?.status === 401 && !loginFalhou) {
      localStorage.removeItem('token')
      window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)