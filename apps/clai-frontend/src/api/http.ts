import axios from 'axios'

export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'X-API-Version': '1',
  },
})

export function extrairMensagemErro(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ProblemDetail & { erro?: string; message?: string }>(error)) {
    const dados = error.response?.data
    if (dados?.detail) return dados.detail
    if (dados?.erro) return dados.erro
    if (dados?.message) return dados.message
    if (dados?.title) return dados.title
  }
  return fallback
}

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
