import { http } from '../../api/http'
import type { LoginRequest, LoginResponse } from '../../types/auth'

export async function login(data: LoginRequest): Promise<string> {
  // mock só para desenvolvimento, enquanto o backend não tem autenticação
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    await new Promise((resolve) => setTimeout(resolve, 400))
    if (data.username === 'admin' && data.password === 'mock') {
      return 'token-falso'
    }
    throw Object.assign(new Error('Unauthorized'), { response: { status: 401 } })
  }

  const response = await http.post<LoginResponse>('/auth/login', data)
  return response.data.token
}