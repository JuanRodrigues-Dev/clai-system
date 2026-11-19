import { http } from '../../api/http'
import type { LoginRequest, LoginResponse, PerfilUsuario } from '../../types/auth'

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

function extrairPerfilDoToken(token: string): PerfilUsuario {
  try {
    const partes = token.split('.')
    if (partes.length === 3) {
      const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(window.atob(base64)) as {
        sub?: string
        email?: string
        roles?: string[]
        authorities?: string[]
      }
      const roles = Array.isArray(payload.roles)
        ? payload.roles
        : Array.isArray(payload.authorities)
          ? payload.authorities
          : ['ROLE_ADMIN']
      return {
        email: payload.sub ?? payload.email ?? 'admin@ifpb.edu.br',
        ativo: true,
        roles: roles.length > 0 ? roles : ['ROLE_ADMIN'],
      }
    }
  } catch {
    // ignora erro de parse caso o token seja um mock simples
  }
  return {
    email: 'admin@ifpb.edu.br',
    ativo: true,
    roles: ['ROLE_ADMIN', 'ROLE_CLAI'],
  }
}

export async function obterPerfilLogado(): Promise<PerfilUsuario> {
  const token = localStorage.getItem('token') ?? ''
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return extrairPerfilDoToken(token)
  }

  try {
    const response = await http.get<PerfilUsuario>('/auth/me')
    return {
      ...response.data,
      ativo: response.data.ativo ?? true,
      roles:
        Array.isArray(response.data.roles) && response.data.roles.length > 0
          ? response.data.roles
          : ['ROLE_ADMIN'],
    }
  } catch {
    return extrairPerfilDoToken(token)
  }
}
